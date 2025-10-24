// screens/PlaylistScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';

export default function PlaylistScreen() {
  const [name, setName] = useState('');
  const [playlists, setPlaylists] = useState([]);

  function add() {
    if (!name.trim()) return;
    setPlaylists(prev => [...prev, { id: Date.now().toString(), name }]);
    setName('');
  }

  return (
    <View style={{ flex: 1, padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '600', textAlign: 'center' }}>
        Playlists
      </Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="New playlist name"
          style={{ flex: 1, borderWidth: 1, borderRadius: 10, padding: 10 }}
        />
        <TouchableOpacity onPress={add} style={{ backgroundColor: '#111', padding: 12, borderRadius: 10 }}>
          <Text style={{ color: 'white' }}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={it => it.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderRadius: 10, marginVertical: 6 }}>
            <Text>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 12 }}>No playlists yet</Text>}
      />
    </View>
  );
}
