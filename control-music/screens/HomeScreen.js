// screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, padding: 20, gap: 12, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: '600', textAlign: 'center' }}>
        Advanced Gesture Music Player (Basic)
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('Player')}
        style={{ backgroundColor: '#111', padding: 14, borderRadius: 12 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Open Player</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Playlists')}
        style={{ backgroundColor: '#222', padding: 14, borderRadius: 12 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Playlists</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('Settings')}
        style={{ backgroundColor: '#444', padding: 14, borderRadius: 12 }}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
}
