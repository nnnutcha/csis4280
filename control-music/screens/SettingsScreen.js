// screens/SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';

export default function SettingsScreen() {
  const [autoplay, setAutoplay] = useState(true);
  const [gestureTips, setGestureTips] = useState(true);
  const [haptics, setHaptics] = useState(false);

  return (
    <View style={{ flex: 1, padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: '600', textAlign: 'center' }}>
        Settings
      </Text>

      {/* 1) Playback */}
      <View style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Playback</Text>
        <Row label="Autoplay on open" value={autoplay} onChange={setAutoplay} />
      </View>

      {/* 2) Gestures */}
      <View style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Gestures</Text>
        <Row label="Show gesture tips" value={gestureTips} onChange={setGestureTips} />
        <Row label="Haptics (vibrate)" value={haptics} onChange={setHaptics} />
      </View>

      {/* 3) About */}
      <View style={{ borderWidth: 1, borderRadius: 12, padding: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>About</Text>
        <Text>Version: 0.1 (class demo)</Text>
        <Text>Goal: minimal, functional, easy to test</Text>
      </View>
    </View>
  );
}

function Row({ label, value, onChange }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text>{label}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}
