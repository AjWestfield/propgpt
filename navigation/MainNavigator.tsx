import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { PlayerDetailScreen } from '../screens/PlayerDetailScreen';
import { GameDetailScreen } from '../screens/GameDetailScreen';
import { OutlierEVScreen } from '../screens/OutlierEVScreen';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useMyPicks } from '../contexts/MyPicksContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabBarIcon({
  name,
  focused,
  color,
  badge,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  badge?: string | number;
}) {
  return (
    <View style={styles.iconContainer}>
      <Ionicons
        name={name}
        size={focused ? 26 : 22}
        color={color}
      />
      {badge && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

// Stack Navigator for Home (includes PlayerDetailScreen)
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0A' },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen
        name="PlayerDetail"
        component={PlayerDetailScreen}
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerBackTitle: 'Back',
          headerTintColor: '#FFFFFF',
          headerStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator for Games (includes GameDetailScreen)
function GamesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0A0A0A' },
      }}
    >
      <Stack.Screen name="GamesMain" component={FeedScreen} />
      <Stack.Screen
        name="GameDetail"
        component={GameDetailScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

export function MainNavigator() {
  const { picks } = useMyPicks();
  const picksCount = picks.length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: 'rgba(10, 10, 10, 0.85)',
              borderTopWidth: 1,
              borderTopColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
        ),
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as any,
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      }}
    >
      <Tab.Screen
        name="Props"
        component={HomeStack}
        options={{
          tabBarLabel: 'Props',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? 'trophy' : 'trophy-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Games"
        component={GamesStack}
        options={{
          tabBarLabel: 'Games',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? 'ticket' : 'ticket-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Trends"
        component={AnalyticsScreen}
        options={{
          tabBarLabel: 'Trends',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? 'flame' : 'flame-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Outlier EV"
        component={OutlierEVScreen}
        options={{
          tabBarLabel: 'Outlier EV',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? 'calculator' : 'calculator-outline'}
              focused={focused}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="My picks"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'My picks',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              name={focused ? 'briefcase' : 'briefcase-outline'}
              focused={focused}
              color={color}
              badge={picksCount > 0 ? (picksCount > 99 ? '99+' : picksCount) : undefined}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0A0A0A',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
