import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, User, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { INK, BORDER, GLASS, RADIUS } from '../constants/theme';

interface BrandHeaderProps {
  title?: string;
  showSettings?: boolean;
  showProfile?: boolean;
  showBack?: boolean;
  hideBorder?: boolean;
  transparent?: boolean;
  rightElement?: React.ReactNode;
}

export function BrandHeader({ 
  title = "CORTEX",
  showSettings = true, 
  showProfile = true, 
  showBack = false,
  hideBorder = false,
  transparent = false,
  rightElement 
}: BrandHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handlePress = (type: 'settings' | 'profile') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (type === 'profile') {
      router.push({ pathname: '/user_profile' as any });
    } else {
      router.push({ pathname: '/system_settings' as any });
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={[styles.outerContainer, { paddingTop: insets.top }]}>
      <View style={styles.innerContainer}>
        {/* Title Container - Absolutely centered */}
        <View style={styles.titleContainer} pointerEvents="none">
          <Text style={styles.brandTitle}>{title}</Text>
        </View>

        {/* Left Slot */}
        <View style={styles.leftSlot}>
          {showBack ? (
            <Pressable 
              onPress={handleBack}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed
              ]}
            >
              <ChevronLeft size={20} color={INK.primary} strokeWidth={2} />
            </Pressable>
          ) : showProfile ? (
            <Pressable 
              onPress={() => handlePress('profile')}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed
              ]}
            >
              <View style={styles.profileIndicator}>
                <User size={18} color={INK.secondary} strokeWidth={1.5} />
              </View>
            </Pressable>
          ) : null}
        </View>

        {/* Right Slot */}
        <View style={styles.rightSlot}>
          {rightElement ? (
            rightElement
          ) : showSettings ? (
            <Pressable 
              onPress={() => handlePress('settings')}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed
              ]}
            >
              <View style={styles.settingsIndicator}>
                <Settings size={18} color={INK.secondary} strokeWidth={1.5} />
              </View>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    zIndex: 100,
  },
  innerContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  brandTitle: {
    color: INK.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 8,
    textTransform: 'uppercase',
    opacity: 0.9,
    marginLeft: 8, // Correction for letter-spacing
  },
  leftSlot: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rightSlot: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  iconButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ scale: 0.92 }],
  },
  profileIndicator: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GLASS.g0,
    borderWidth: 0.5,
    borderColor: BORDER.faint,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIndicator: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GLASS.g0,
    borderWidth: 0.5,
    borderColor: BORDER.faint,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
