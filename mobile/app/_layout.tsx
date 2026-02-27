// ─── Polyfills (must be first) ───────────────────────────────────────────────
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import { Buffer } from "buffer";
if (!global.Buffer) global.Buffer = Buffer;

import { useEffect } from "react";
import { Linking, Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProvider } from "../context/AppContext";
import { WalletProvider } from "../context/WalletContext";
import { registerForNotifications, Notifications } from "../services/notifications";

export default function RootLayout() {
  useEffect(() => {
    // Check if we are on a supported platform for notifications
    if (Platform.OS === 'web') return;

    // Request permission on first launch (no-op if already granted/denied)
    registerForNotifications().catch(() => {});

    // When user taps a notification, open Solscan for the tx if available
    if (Notifications && Notifications.addNotificationResponseReceivedListener) {
      const sub = Notifications.addNotificationResponseReceivedListener(
        (response: any) => {
          const txSig =
            response.notification.request.content.data?.txSignature;
          if (txSig) {
            Linking.openURL(
              `https://solscan.io/tx/${txSig}?cluster=testnet`,
            ).catch(() => {});
          }
        },
      );

      return () => sub.remove();
    }
  }, []);

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
