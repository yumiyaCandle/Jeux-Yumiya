package ch.libre.app;

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.fail;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.junit.Test;

/**
 * Tests du format chiffré du coffre (sur la JVM, avec une clé AES logicielle :
 * l’Android Keystore n’existe pas hors appareil ; il est vérifié par les tests sur téléphone).
 */
public class LibreVaultCryptoTest {

    private static SecretKey newKey() throws Exception {
        KeyGenerator kg = KeyGenerator.getInstance("AES");
        kg.init(256);
        return kg.generateKey();
    }

    private static final byte[] JSON = "{\"profile\":{\"name\":\"Camille\"},\"journal\":[{\"text\":\"Journée difficile, mais j’ai tenu ✓\"}]}".getBytes(StandardCharsets.UTF_8);

    @Test
    public void allerRetour() throws Exception {
        SecretKey k = newKey();
        byte[] blob = LibreVaultPlugin.seal(k, JSON);
        assertEquals("version", 1, blob[0]);
        assertEquals("taille : version + IV + texte + étiquette", 1 + 12 + JSON.length + 16, blob.length);
        assertArrayEquals(JSON, LibreVaultPlugin.open(k, blob));
    }

    @Test
    public void aucunTexteEnClair() throws Exception {
        byte[] blob = LibreVaultPlugin.seal(newKey(), JSON);
        String s = new String(blob, StandardCharsets.ISO_8859_1);
        assertFalse(s.contains("Camille"));
        assertFalse(s.contains("profile"));
    }

    @Test
    public void ivDifferentAChaqueEcriture() throws Exception {
        SecretKey k = newKey();
        byte[] a = LibreVaultPlugin.seal(k, JSON), b = LibreVaultPlugin.seal(k, JSON);
        assertFalse(Arrays.equals(Arrays.copyOfRange(a, 1, 13), Arrays.copyOfRange(b, 1, 13)));
    }

    @Test
    public void fichierAltereRefuse() throws Exception {
        SecretKey k = newKey();
        byte[] blob = LibreVaultPlugin.seal(k, JSON);
        blob[blob.length - 5] ^= 1;
        try { LibreVaultPlugin.open(k, blob); fail("un fichier modifié doit être refusé"); } catch (Exception expected) { }
    }

    @Test
    public void mauvaiseCleRefusee() throws Exception {
        byte[] blob = LibreVaultPlugin.seal(newKey(), JSON);
        try { LibreVaultPlugin.open(newKey(), blob); fail("une autre clé ne doit pas ouvrir le fichier"); } catch (Exception expected) { }
    }

    @Test
    public void formatInconnuRefuse() throws Exception {
        SecretKey k = newKey();
        byte[] blob = LibreVaultPlugin.seal(k, JSON);
        blob[0] = 2;
        try { LibreVaultPlugin.open(k, blob); fail("version de format inconnue"); } catch (IllegalStateException expected) { }
        try { LibreVaultPlugin.open(k, new byte[10]); fail("fichier tronqué"); } catch (IllegalStateException expected) { }
    }
}
