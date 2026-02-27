// ─── Polyfills (must be first) ───────────────────────────────────────────────
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
if (!global.Buffer) global.Buffer = Buffer;

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "../context/AppContext";
import { WalletProvider } from "../context/WalletContext";

export default function RootLayout() {
  return (
    <WalletProvider>
      <AppProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="system_settings" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="user_profile" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
        <StatusBar style="light" />
      </AppProvider>
    </WalletProvider>
  );
}
