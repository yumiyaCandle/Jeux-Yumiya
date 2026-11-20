package ch.libre.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin local de LIBRE : coffre de données chiffré (voir LibreVaultPlugin).
        registerPlugin(LibreVaultPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
