import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL } from "@env";
import { Ionicons } from "@expo/vector-icons";

export default function PlaylistDetailScreen({ route, navigation }) {
  const { playlistId, playlistName } = route.params;
  const [songs, setSongs] = useState([]);

  const fetchSongs = async () => {
    console.log("Fetching songs for playlist:", playlistId);
    const res = await fetch(`${BASE_URL}/api/playlist/songs/${playlistId}`);
    const data = await res.json();
    console.log("Fetched songs:", data.length);
    setSongs(data);
  };

  /* Auto-refresh when screen is focused */
  useFocusEffect(
    React.useCallback(() => {
      fetchSongs();
    }, [playlistId])
  );

  /* ───────────────────────────────────────── DELETE SONG ───────────────────────────────────────── */
  const deleteSong = async (songId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/playlist/song/${songId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.success) {
        alert("Error deleting song");
        return;
      }

      fetchSongs();
    } catch (err) {
      console.log("DELETE SONG ERROR:", err);
      alert("Error deleting song");
    }
  };

  const renderRightActions = (item) => (
    <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteSong(item._id)}>
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  /* ───────────────────────────────────────── PLAY SONG ───────────────────────────────────────── */
  const playSong = (item, index) => {
    navigation.navigate("NowPlayingScreen", {
      songs: songs.map((s) => s.song),
      index: index,
    });
  };

  /* ───────────────────────────────────────── RENDER ───────────────────────────────────────── */
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topIcon}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{playlistName}</Text>

      <FlatList
        data={songs}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <Swipeable renderRightActions={() => renderRightActions(item)}>
            <TouchableOpacity style={styles.songItem} onPress={() => playSong(item, index)}>
              <Text style={styles.songTitle}>{item.song.name}</Text>
              <Text style={styles.artist}>{item.song.artist_name}</Text>
            </TouchableOpacity>
          </Swipeable>
        )}
      />
    </View>
  );
}

/* ───────────────────────────────────────── STYLES ───────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 20,
    backgroundColor: "#F7F9FC",
  },

  topBar: {
    position: "absolute",
    top: 45,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 999,
  },

  topIcon: {
    padding: 8,
    backgroundColor: "rgba(255, 182, 193, 0.25)",   // pastel pink
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.45)",
    shadowColor: "#FFB6C1",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 182, 193, 0.25)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.45)",
    shadowColor: "#FFB6C1",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    marginBottom: 20,
  },

  backText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#D84F72",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2E3A59",
    marginBottom: 25,
    textAlign: "center",
    letterSpacing: 0.3,
  },

  songItem: {
    padding: 18,
    backgroundColor: "#fff",
    marginBottom: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.25)",
    shadowColor: "#9AC8EB",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  songTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E3A59",
  },

  artist: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },

  /* Swipe delete button */
  deleteBtn: {
    backgroundColor: "rgba(255, 99, 99, 0.9)", // pastel red
    width: 90,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    marginBottom: 14,
    marginLeft: 10,
  },

  deleteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
