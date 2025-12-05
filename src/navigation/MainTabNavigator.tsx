/**
 * Main Tab Navigator
 *
 * Bottom tabs: Home, Library, Settings
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Library, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MainTabParamList } from './types';
import { useSettingsStore } from '../store';
import { spacing } from '../theme';
import { HomeScreen, LibraryScreen, SettingsScreen } from '../screens';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icons
const HomeIcon = ({ color, size }: { color: string; size: number }) => (
  <Home color={color} size={size} />
);

const LibraryIcon = ({ color, size }: { color: string; size: number }) => (
  <Library color={color} size={size} />
);

const SettingsIcon = ({ color, size }: { color: string; size: number }) => (
  <Settings color={color} size={size} />
);

export const MainTabNavigator = () => {
  const { themeColors } = useSettingsStore();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
          borderTopWidth: 1,
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom + spacing.xs,
          paddingTop: spacing.sm,
        },
        tabBarActiveTintColor: themeColors.accentPrimary,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'Library',
          tabBarIcon: LibraryIcon,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
};
