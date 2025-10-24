// components/PlayerControls.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function PlayerControls({ isPlaying, onPlayPause, onBack, onForward }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 12 }}>
      <SmallBtn label="⏮︎ -10s" onPress={onBack} />
      <BigBtn label={isPlaying ? '⏸︎' : '▶︎'} onPress={onPlayPause} />
      <SmallBtn label="+10s ⏭︎" onPress={onForward} />
    </View>
  );
}

function SmallBtn({ label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1 }}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
}

function BigBtn({ label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 22, paddingVertical: 16, borderRadius: 14, backgroundColor: '#111' }}>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}
