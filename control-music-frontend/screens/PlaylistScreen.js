import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { auth } from "../firebaseConfig";
import { BASE_URL } from "@env";

export default function PlaylistScreen({ route, navigation }) {
  const [playlists, setPlaylists] = useState([]);

  const song = route.params?.song || null;
  const userId = auth.currentUser.uid;

  /* ──────────────────────────────── FETCH PLAYLISTS ─────────────────────────────── */
  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/playlist/list/${userId}`);
      const data = await res.json();
      setPlaylists(data);
    } catch (err) {
      console.log("FETCH PLAYLIST ERROR:", err);
    }
  };

  /* Auto-refresh when screen is focused */
  useFocusEffect(
    React.useCallback(() => {
      console.log("PlaylistScreen focused - fetching playlists...");
      fetchPlaylists();
    }, [userId])
  );

  /* ──────────────────────────────── DELETE PLAYLIST ─────────────────────────────── */
  const deletePlaylist = async (playlistId, playlistName) => {
    try {
      const res = await fetch(`${BASE_URL}/api/playlist/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Failed to delete playlist");
        return;
      }

      alert(`Deleted "${playlistName}"`);
      fetchPlaylists();
    } catch (err) {
      console.log("DELETE ERROR:", err);
      alert("Error deleting playlist");
    }
  };

  /* ──────────────────────────────── ADD SONG OR OPEN PLAYLIST ─────────────────────────────── */
  const selectPlaylist = async (playlist) => {
    const userId = auth.currentUser.uid;

    if (song) {
      try {
        const res = await fetch(`${BASE_URL}/api/playlist/addSong`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            playlistName: playlist.playlistName,
            song: song,
          }),
        });

        const data = await res.json();

        if (!data.success) {
          alert("Failed to add song");
          return;
        }

        alert(`Added "${song.name}" to "${playlist.playlistName}"`);
        navigation.goBack();
      } catch (err) {
        console.log("ADD SONG ERROR:", err);
        alert("Error adding song");
      }
      return;
    }

    navigation.navigate("PlaylistDetailScreen", {
      playlistId: playlist._id,
      playlistName: playlist.playlistName,
    });
  };

  /* ──────────────────────────────── SWIPE DELETE BUTTON ─────────────────────────────── */
  const renderRightActions = (playlist) => (
    <TouchableOpacity
      style={styles.deleteBtn}
      onPress={() => deletePlaylist(playlist._id, playlist.playlistName)}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
  <View style={styles.container}>

    <Text style={styles.title}>Your Playlists</Text>

    <FlatList
      data={playlists}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ paddingBottom: 120 }}   // prevent overlap
      renderItem={({ item }) => (
        <Swipeable renderRightActions={() => renderRightActions(item)}>
          <TouchableOpacity style={styles.item} onPress={() => selectPlaylist(item)}>
            <Text style={styles.itemText}>{String(item.playlistName)}</Text>
          </TouchableOpacity>
        </Swipeable>
      )}
    />

    {/* FIXED BUTTON ABOVE THE TABBAR */}
    <View style={styles.fixedCreateWrapper}>
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => navigation.navigate("CreatePlaylistScreen")}
      >
        <Text style={styles.createText}>＋ Create Playlist</Text>
      </TouchableOpacity>
    </View>

  </View>
);

}

/* ──────────────────────────────── STYLES ─────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 20,
    backgroundColor: "#F7F9FC",
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2E3A59",
    marginBottom: 25,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  item: {
    padding: 18,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,182,193,0.25)",
    shadowColor: "#9AC8EB",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  itemText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2E3A59",
  },

  deleteBtn: {
    backgroundColor: "rgba(255, 99, 99, 0.9)",
    width: 100,
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

  fixedCreateWrapper: {
  position: "absolute",
  bottom: 110,   // ⬅️ sits ABOVE the floating tab navigator
  left: 0,
  right: 0,
  alignItems: "center",
},

createBtn: {
  paddingVertical: 16,
  width: "75%",
  backgroundColor: "rgba(255, 182, 193, 0.92)",
  borderRadius: 16,

  shadowColor: "#FFB6C1",
  shadowOpacity: 0.35,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
},

createText: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "700",
  textAlign: "center",
  letterSpacing: 0.4,
},



});
