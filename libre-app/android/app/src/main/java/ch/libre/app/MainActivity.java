package ch.libre.app;

import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin local de LIBRE : coffre de données chiffré (voir LibreVaultPlugin).
        registerPlugin(LibreVaultPlugin.class);
        super.onCreate(savedInstanceState);
        // Confidentialité : l'aperçu de LIBRE dans les applications récentes ne doit montrer aucun contenu.
        // Android 13+ : on désactive seulement la capture utilisée pour cet aperçu ; les captures d'écran faites
        // par l'utilisateur restent possibles (contrairement à FLAG_SECURE permanent).
        if (Build.VERSION.SDK_INT >= 33) setRecentsScreenshotEnabled(false);
    }

    // Android 7 à 12 : pas d'équivalent ; on pose FLAG_SECURE seulement quand l'app quitte le premier plan
    // (l'aperçu est alors noir) et on le retire au retour. Les captures d'écran restent possibles pendant l'utilisation.
    // À vérifier sur appareil : sur certaines versions, l'aperçu peut être pris avant onPause.
    @Override
    public void onPause() {
        if (Build.VERSION.SDK_INT < 33) getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE);
        super.onPause();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (Build.VERSION.SDK_INT < 33) getWindow().clearFlags(WindowManager.LayoutParams.FLAG_SECURE);
    }
}
