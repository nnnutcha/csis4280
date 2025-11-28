import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";

const CLIENT_ID = "2a059ea3";

export default function ListScreen({ navigation }) {
  const [keyword, setKeyword] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    setNotFound(false);
    setSongs([]);

    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=json&limit=30&namesearch=${encodeURIComponent(
      keyword
    )}&audioformat=mp31`;

    try {
      const res = await fetch(url);
      const json = await res.json();

      if (!json?.results || !Array.isArray(json.results)) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const validSongs = json.results.filter(
        (i) =>
          i.audio &&
          typeof i.audio === "string" &&
          i.audio.length > 5 &&
          i.image &&
          typeof i.image === "string" &&
          i.image.length > 5
      );

      if (validSongs.length === 0) {
        setNotFound(true);
      } else {
        setSongs(validSongs);
      }

    } catch (err) {
      console.log("Jamendo fetch error:", err);
      setNotFound(true);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎵 Gesture Music Player</Text>

      <TextInput
        placeholder="Search music..."
        value={keyword}
        onChangeText={setKeyword}
        style={styles.searchInput}
      />

      <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
        <Text style={styles.searchBtnText}>Search</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {notFound && !loading && (
        <Text style={styles.notFound}>
          No playable songs found.
        </Text>
      )}

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => navigation.navigate("NowPlayingScreen", { songs, index })}
          >
            <Text style={styles.itemText}>
              {item.name} — {item.artist_name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: "#F7F9FC",
  },

  header: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
    color: "#2E3A59",
  },

  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.5)",
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: "#FFB6C1",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 15,
  },

  searchBtn: {
    backgroundColor: "rgba(255, 182, 193, 0.85)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#FFB6C1",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  searchBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  listItem: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.25)",
    shadowColor: "#9AC8EB",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  itemText: {
    fontSize: 16,
    color: "#2E3A59",
    fontWeight: "500",
  },

  notFound: {
    marginTop: 20,
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  }
});

