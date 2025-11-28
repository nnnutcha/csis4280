import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ListScreen from "./screens/ListScreen";
import NowPlayingScreen from "./screens/NowPlayingScreen";
import AlbumScreen from "./screens/AlbumScreen";
import PlaylistScreen from "./screens/PlaylistScreen";
import CreatePlaylistScreen from "./screens/CreatePlaylistScreen";
import PlaylistDetailScreen from "./screens/PlaylistDetailScreen";

import NavigationTabs from "./NavigationTabs";

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => setUser(firebaseUser));
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <>
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={NavigationTabs} />
              <Stack.Screen name="NowPlayingScreen" component={NowPlayingScreen} />
              <Stack.Screen name="PlaylistScreen" component={PlaylistScreen} />
              <Stack.Screen name="AlbumScreen" component={AlbumScreen} />
              <Stack.Screen name="PlaylistDetailScreen" component={PlaylistDetailScreen} />
              <Stack.Screen name="CreatePlaylistScreen" component={CreatePlaylistScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
