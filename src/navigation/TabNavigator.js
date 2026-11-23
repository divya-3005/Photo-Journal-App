import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import QuoteScreen from '../screens/QuoteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();

const ICONS = {
  HomeTab: 'book',
  QuoteTab: 'chatbubble-ellipses',
  ProfileTab: 'person',
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: COLORS.primary,
        tabBarIcon: ({ focused, color, size }) => {
          // Filled icon when selected, outline when not
          const name = focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`;
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      {/* This tab has its own stack, so it hides the tab header */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Journal', headerShown: false }}
      />
      <Tab.Screen name="QuoteTab" component={QuoteScreen} options={{ title: 'Quote' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
