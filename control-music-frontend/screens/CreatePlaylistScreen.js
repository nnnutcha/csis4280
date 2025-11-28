import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { auth } from "../firebaseConfig";
import { BASE_URL } from "@env";
import { Ionicons } from "@expo/vector-icons";

export default function CreatePlaylistScreen({ navigation }) {
  const [playlistName, setPlaylistName] = useState("");

  const createPlaylist = async () => {
    try {
      const userId = auth.currentUser.uid;

      if (!playlistName.trim()) {
        alert("Please enter a playlist name");
        return;
      }

      const listRes = await fetch(`${BASE_URL}/api/playlist/list/${userId}`);
      const listData = await listRes.json();

      const exists = listData.some(
        (item) =>
          String(item.playlistName).trim().toLowerCase() ===
          playlistName.trim().toLowerCase()
      );

      if (exists) {
        alert("Playlist name already exists. Please use a different name.");
        return;
      }

      const res = await fetch(`${BASE_URL}/api/playlist/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, playlistName })
      });

      const data = await res.json();
      console.log("RESULT:", data);

      alert(`Playlist "${playlistName}" created!`);
      navigation.goBack();

    } catch (err) {
      console.log("ERROR:", err);
      alert("Error: " + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topIcon}>
                <Ionicons name="chevron-back" size={28} color="#222" />
              </TouchableOpacity>
            </View>

      <Text style={styles.title}>Create Playlist</Text>

      <TextInput
        style={styles.input}
        placeholder="Playlist name"
        value={playlistName}
        onChangeText={setPlaylistName}
      />

      <TouchableOpacity style={styles.btn} onPress={createPlaylist}>
        <Text style={styles.btnText}>Create</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 25,
    backgroundColor: "#F7F9FC", // same soft light background
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
    backgroundColor: "rgba(255, 182, 193, 0.25)", // pastel pink
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.45)",
    shadowColor: "#FFB6C1",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
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
    marginBottom: 35,
    textAlign: "center",
    letterSpacing: 0.5,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.5)",
    padding: 15,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#FFB6C1",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    fontSize: 16,
  },

  btn: {
    backgroundColor: "rgba(255, 182, 193, 0.85)",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#FFB6C1",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginTop: 10,
  },

  btnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
