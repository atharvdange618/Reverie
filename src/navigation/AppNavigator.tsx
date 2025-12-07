/**
 * App Navigator
 *
 * Root navigation stack
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import { useSettingsStore, useBookStore } from '../store';
import { getDatabase } from '../db';
import { OnboardingScreen, ReaderScreen, VoiceSelectionScreen } from '../screens';
import { FloatingMusicPlayer } from '../components/audio';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Splash Screen
const SplashScreen = () => {
  const { themeColors } = useSettingsStore();

  return (
    <View style={[styles.splash, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.splashTitle, { color: themeColors.accentPrimary }]}>
        ✨ Reverie ✨
      </Text>
      <Text
        style={[styles.splashSubtitle, { color: themeColors.textSecondary }]}
      >
        Lost in a book
      </Text>
      <ActivityIndicator
        size="small"
        color={themeColors.accentPrimary}
        style={styles.loader}
      />
    </View>
  );
};

export const AppNavigator = () => {
  const [isReady, setIsReady] = useState(false);
  const [currentRouteName, setCurrentRouteName] = useState<string | null>(null);
  const {
    initialize: initSettings,
    hasCompletedOnboarding,
    themeColors,
    ambientMusicEnabled,
  } = useSettingsStore();
  const { initialize: initBooks } = useBookStore();

  useEffect(() => {
    const initializeApp = () => {
      try {
        // Initialize database (sync)
        getDatabase();

        // Initialize stores (sync)
        initSettings();
        initBooks();

        // Small delay for splash effect
        setTimeout(() => setIsReady(true), 1000);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsReady(true);
      }
    };

    initializeApp();
  }, [initSettings, initBooks]);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      onStateChange={state => {
        if (state) {
          const currentRoute = state.routes[state.index];
          setCurrentRouteName(currentRoute?.name || null);
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: themeColors.background },
        }}
        initialRouteName={hasCompletedOnboarding ? 'MainTabs' : 'Onboarding'}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen
          name="Reader"
          options={{
            animation: 'slide_from_right',
          }}
          component={ReaderScreen}
        />
        <Stack.Screen
          name="VoiceSelection"
          options={{
            animation: 'slide_from_right',
          }}
          component={VoiceSelectionScreen}
        />
      </Stack.Navigator>
      {ambientMusicEnabled && (
        <FloatingMusicPlayer
          themeColors={themeColors}
          isOnReaderScreen={currentRouteName === 'Reader'}
        />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  // Splash
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: '300',
    letterSpacing: 4,
  },
  splashSubtitle: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  loader: {
    marginTop: 40,
  },
});
