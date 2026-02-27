import { Platform, NativeModules } from "react-native";

// Defensive check for native modules (especially for Web or incomplete native environments)
// Also check for the specific native module that causes the warning
const isNotificationSupported = 
  Platform.OS !== 'web' && 
  (Platform.OS === 'ios' || Platform.OS === 'android');

let Notifications: any = null;

if (isNotificationSupported) {
  try {
    // Attempt to see if the native module exists before requiring
    // In some environments, expo-notifications is linked but the native parts are missing
    const hasNativeModule = !!NativeModules.ExpoPushTokenManager || !!NativeModules.RNNotifications;
    
    // We still try to require it but we'll be more silent if it fails
    // because we know this can happen in some dev environments
    Notifications = require("expo-notifications");
    
    if (Notifications && Notifications.setNotificationHandler) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    }
  } catch (e: any) {
    // Only log if it's NOT the missing native module error, or just suppress it to avoid noise
    if (e?.message && !e.message.includes('ExpoPushTokenManager')) {
      console.warn("Notifications: Failed to initialize", e.message);
    }
    Notifications = null;
  }
}

/**
 * Request notification permission and create Android channel.
 * Safe to call on every app start — no-ops if already granted.
 */
export async function registerForNotifications(): Promise<boolean> {
  if (!Notifications) return false;

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("trades", {
        name: "Trade Executions",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#00F5A0",
      });
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (e) {
    // Silent fail for registration in dev environments
    return false;
  }
}

/**
 * Fire an immediate local notification for a successful on-chain trade.
 */
export async function notifyTradeExecuted(
  agent: string,
  message: string,
  txSignature?: string,
): Promise<void> {
  if (!Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "CORTEX — Trade Executed",
        body: `${agent}: ${message}`,
        data: { txSignature: txSignature ?? null },
        ...(Platform.OS === "android" ? { channelId: "trades" } : {}),
      },
      trigger: null, // fire immediately
    });
  } catch (e) {
    // Silent fail
  }
}

/**
 * Fire an immediate local notification for a failed execution.
 */
export async function notifyTradeFailed(
  agent: string,
  message: string,
): Promise<void> {
  if (!Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "CORTEX — Execution Failed",
        body: `${agent}: ${message}`,
        ...(Platform.OS === "android" ? { channelId: "trades" } : {}),
      },
      trigger: null,
    });
  } catch (e) {
    // Silent fail
  }
}

// Export the module for use in listeners if needed
export { Notifications };
