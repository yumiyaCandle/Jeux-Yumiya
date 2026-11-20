package ch.libre.app;

import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.AtomicFile;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.Arrays;
import java.util.regex.Pattern;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * LIBRE – coffre de données chiffré.
 *
 * Les données de l’application (un texte JSON) sont enregistrées dans des fichiers privés de l’app
 * (filesDir/vault/NOM.bin), chiffrés en AES-256-GCM. La clé est créée et conservée dans l’Android Keystore :
 * elle ne peut pas être extraite, et elle ne quitte jamais le téléphone (elle n’est donc pas transférée
 * par une sauvegarde : la sauvegarde automatique est désactivée dans le manifeste).
 *
 * Format d’un fichier : 1 octet de version (1) + IV de 12 octets + texte chiffré (avec l’étiquette GCM de 16 octets).
 * Écriture atomique (AtomicFile) : une coupure pendant l’écriture laisse l’ancienne version intacte.
 *
 * JavaScript : Capacitor.Plugins.LibreVault
 *   isAvailable()              -> { available }
 *   read({ name })             -> { data: string | null }
 *   write({ name, data })      -> {}
 *   remove({ name })           -> {}
 *   move({ from, to })         -> {}   (met de côté un fichier illisible sans l’effacer)
 */
@CapacitorPlugin(name = "LibreVault")
public class LibreVaultPlugin extends Plugin {

    private static final String KEY_ALIAS = "libre_vault_key_v1";
    private static final Pattern NAME = Pattern.compile("^[a-zA-Z0-9_-]{1,64}$");
    private static final byte VERSION = 1;

    private File dir() {
        File d = new File(getContext().getFilesDir(), "vault");
        if (!d.exists()) d.mkdirs();
        return d;
    }

    private File file(String name) { return new File(dir(), name + ".bin"); }

    private static boolean validName(String n) { return n != null && NAME.matcher(n).matches(); }

    private SecretKey key() throws Exception {
        KeyStore ks = KeyStore.getInstance("AndroidKeyStore");
        ks.load(null);
        if (ks.containsAlias(KEY_ALIAS)) return ((KeyStore.SecretKeyEntry) ks.getEntry(KEY_ALIAS, null)).getSecretKey();
        KeyGenerator kg = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        kg.init(new KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(256)
                .setRandomizedEncryptionRequired(true)
                .build());
        return kg.generateKey();
    }

    static byte[] seal(SecretKey k, byte[] plain) throws Exception {
        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.ENCRYPT_MODE, k);
        byte[] iv = c.getIV();
        byte[] ct = c.doFinal(plain);
        byte[] out = new byte[1 + iv.length + ct.length];
        out[0] = VERSION;
        System.arraycopy(iv, 0, out, 1, iv.length);
        System.arraycopy(ct, 0, out, 1 + iv.length, ct.length);
        return out;
    }

    static byte[] open(SecretKey k, byte[] blob) throws Exception {
        if (blob.length < 1 + 12 + 16 || blob[0] != VERSION) throw new IllegalStateException("FORMAT");
        Cipher c = Cipher.getInstance("AES/GCM/NoPadding");
        c.init(Cipher.DECRYPT_MODE, k, new GCMParameterSpec(128, Arrays.copyOfRange(blob, 1, 13)));
        return c.doFinal(blob, 13, blob.length - 13);
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject r = new JSObject();
        try { key(); r.put("available", true); } catch (Exception e) { r.put("available", false); }
        call.resolve(r);
    }

    @PluginMethod
    public void read(PluginCall call) {
        String name = call.getString("name");
        if (!validName(name)) { call.reject("Nom invalide", "BAD_NAME"); return; }
        File f = file(name);
        JSObject r = new JSObject();
        if (!f.exists()) { r.put("data", null); call.resolve(r); return; }
        try {
            byte[] blob = new AtomicFile(f).readFully();
            r.put("data", new String(open(key(), blob), StandardCharsets.UTF_8));
            call.resolve(r);
        } catch (Exception e) {
            // Clé absente ou fichier altéré : on ne renvoie rien, on n’efface rien.
            call.reject("Lecture impossible", "UNREADABLE", e);
        }
    }

    @PluginMethod
    public void write(PluginCall call) {
        String name = call.getString("name");
        String data = call.getString("data");
        if (!validName(name) || data == null) { call.reject("Paramètres invalides", "BAD_ARGS"); return; }
        AtomicFile af = new AtomicFile(file(name));
        FileOutputStream out = null;
        try {
            byte[] blob = seal(key(), data.getBytes(StandardCharsets.UTF_8));
            out = af.startWrite();
            out.write(blob);
            af.finishWrite(out);
            call.resolve();
        } catch (Exception e) {
            if (out != null) af.failWrite(out);
            call.reject("Écriture impossible", "WRITE_FAILED", e);
        }
    }

    @PluginMethod
    public void remove(PluginCall call) {
        String name = call.getString("name");
        if (!validName(name)) { call.reject("Nom invalide", "BAD_NAME"); return; }
        new AtomicFile(file(name)).delete();
        call.resolve();
    }

    @PluginMethod
    public void move(PluginCall call) {
        String from = call.getString("from"), to = call.getString("to");
        if (!validName(from) || !validName(to)) { call.reject("Nom invalide", "BAD_NAME"); return; }
        File a = file(from), b = file(to);
        if (a.exists() && !a.renameTo(b)) { call.reject("Déplacement impossible", "MOVE_FAILED"); return; }
        call.resolve();
    }
}
