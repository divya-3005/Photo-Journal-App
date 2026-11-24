import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EntriesScreen from '../screens/EntriesScreen';
import EntryDetailsScreen from '../screens/EntryDetailsScreen';
import AddEntryScreen from '../screens/AddEntryScreen';
import EditEntryScreen from '../screens/EditEntryScreen';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="Entries">
      <Stack.Screen
        name="Entries"
        component={EntriesScreen}
        options={{ title: 'My Journal' }}
      />
      <Stack.Screen
        name="EntryDetails"
        component={EntryDetailsScreen}
        // Header title comes from the params we pass while navigating
        options={({ route }) => ({ title: route.params?.title ?? 'Entry' })}
      />
      <Stack.Screen
        name="AddEntry"
        component={AddEntryScreen}
        options={{ title: 'New Entry' }}
      />
      <Stack.Screen
        name="EditEntry"
        component={EditEntryScreen}
        options={{ title: 'Edit Entry' }}
      />
    </Stack.Navigator>
  );
}
