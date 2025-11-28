import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ListScreen from "./screens/ListScreen";
import PlaylistScreen from "./screens/PlaylistScreen";
import UserScreen from "./screens/UserScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function NavigationTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,

        /* ───── Pastel Color Theme ───── */
        tabBarActiveTintColor: "#D84F72",       // pastel bold pink
        tabBarInactiveTintColor: "#9CA3AF",     // soft gray

        /* ───── Pastel Floating Tab Bar ───── */
        tabBarStyle: {
          height: 70,
          borderTopWidth: 0,
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,

          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 20,

          shadowColor: "#FFB6C1",        // pink glow
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },

          paddingBottom: 10,
          paddingTop: 10,
        },

        /* ───── Tab Label Typography ───── */
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen 
        name="SearchTab" 
        component={ListScreen} 
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={24} color={color} />
          )
        }}
      />

      <Tab.Screen 
        name="PlaylistTab" 
        component={PlaylistScreen}
        options={{
          title: "Playlist",
          tabBarIcon: ({ color }) => (
            <Ionicons name="musical-notes" size={24} color={color} />
          )
        }}
      />

      <Tab.Screen 
        name="UserTab" 
        component={UserScreen}
        options={{
          title: "User",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}
