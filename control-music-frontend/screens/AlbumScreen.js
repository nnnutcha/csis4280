import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AlbumScreen({ route, navigation }) {
  const { song } = route.params;
  const [lyrics, setLyrics] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLyrics = async () => {
    try {
      const id = song.id;
      const clientId = "2a059ea3"; 

      const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${clientId}&id=${id}&include=lyrics`;

      const response = await fetch(url);
      const json = await response.json();

      if (json.results && json.results.length > 0) {
        const lyricsData = json.results[0].lyrics;
        setLyrics(lyricsData || "Lyrics not available for this track.");
      } else {
        setLyrics("Lyrics not found.");
      }
    } catch (e) {
      console.log("Lyrics API error:", e);
      setLyrics("Error loading lyrics.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLyrics();
  }, []);

  return (
    <View style={styles.container}>
      {/* <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>⬅ Back</Text>
      </TouchableOpacity> */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.topIcon}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ alignItems: "center" }}>
        <Image source={{ uri: song.album_image }} style={styles.albumArt} />

        <Text style={styles.songName}>{song.name}</Text>
        <Text style={styles.artistName}>{song.artist_name}</Text>

        <Text style={styles.sectionTitle}>Lyrics</Text>

        {loading ? (
          <ActivityIndicator size="large" color="gray" />
        ) : (
          <Text style={styles.lyrics}>{lyrics}</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC", // soft light background
    paddingTop: 100,
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

  backBtn: {
    alignSelf: "flex-start",
    marginLeft: 20,
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255, 182, 193, 0.25)", // light pink pastel
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.45)",
    shadowColor: "#FFB6C1",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D84F72",
    letterSpacing: 0.3,
  },

  albumArt: {
    width: 260,
    height: 260,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 25,
    backgroundColor: "#fff",
    shadowColor: "#9AC8EB", // sky blue glow
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },

  songName: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#2E3A59",
    marginBottom: 6,
  },

  artistName: {
    fontSize: 18,
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#3A4F7A",
  },

  lyrics: {
    fontSize: 16,
    lineHeight: 26,
    color: "#4A5568",
    paddingHorizontal: 25,
    textAlign: "center",
    marginBottom: 50,
  },
});
