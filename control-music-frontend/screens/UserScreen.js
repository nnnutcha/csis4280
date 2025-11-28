import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
  Alert,
} from "react-native";

import { auth } from "../firebaseConfig";
import {
  updatePassword,
  updateProfile,
  deleteUser,
  signOut,
} from "firebase/auth";
import { BASE_URL } from "@env";

/* ─────────────────────────── PRESET AVATARS ─────────────────────────── */
const presetAvatars = [
  "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/45.png",
  "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/68.png",
  "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/32.png",
  "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/12.png",
  "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/22.png",
  "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/70.png",
  "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/male/5.png",
  "https://raw.githubusercontent.com/Ashwinvalento/cartoon-avatar/master/lib/images/female/50.png",
];

export default function UserScreen() {
  const user = auth.currentUser;

  const [modalType, setModalType] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [playlistsCount, setPlaylistsCount] = useState(0);

  /* ─────────────────────────── Fetch Playlist Count ─────────────────────────── */
  const fetchPlaylistStats = async () => {
    const res = await fetch(`${BASE_URL}/api/playlist/list/${user.uid}`);
    const data = await res.json();
    setPlaylistsCount(data.length);
  };

  useEffect(() => {
    fetchPlaylistStats();
  }, []);

  /* ─────────────────────────── Password Update ─────────────────────────── */
  const handlePasswordUpdate = async () => {
    if (!inputValue.trim()) return alert("Enter a new password");
    try {
      await updatePassword(user, inputValue);
      Alert.alert("Success", "Password updated successfully!");
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  /* ─────────────────────────── Display Name Update ─────────────────────────── */
  const handleNameUpdate = async () => {
    if (!inputValue.trim()) return alert("Enter a name");
    try {
      await updateProfile(user, { displayName: inputValue });
      Alert.alert("Success", "Name updated!");
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  /* ─────────────────────────── Photo Update (via URL - optional) ─────────────────────────── */
  const handlePhotoUpdateURL = async () => {
    if (!inputValue.trim()) return alert("Enter a photo URL");
    try {
      await updateProfile(user, { photoURL: inputValue });
      Alert.alert("Success", "Profile photo updated!");
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  /* ─────────────────────────── Avatar Selection ─────────────────────────── */
  const handleAvatarSelect = async (url) => {
    try {
      await updateProfile(user, { photoURL: url });
      Alert.alert("Updated!", "Your avatar has been changed.");
      closeModal();
    } catch (error) {
      alert(error.message);
    }
  };

  /* ─────────────────────────── Delete Account ─────────────────────────── */
  const deleteAccount = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete your account? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(user);
              Alert.alert("Account deleted");
            } catch (err) {
              alert(err.message);
            }
          },
        },
      ]
    );
  };

  /* ─────────────────────────── Logout ─────────────────────────── */
  const logout = async () => {
    await signOut(auth);
  };

  /* ─────────────────────────── Modal Control ─────────────────────────── */
  const closeModal = () => {
    setModalType(null);
    setInputValue("");
  };

  /* Modal Titles */
  const modalTitles = {
    password: "Change Password",
    name: "Update Display Name",
    photo: "Choose Profile Photo",
  };

  /* Modal Placeholders */
  const modalPlaceholders = {
    password: "Enter new password",
    name: "Enter new display name",
    photo: "OR enter custom URL (optional)",
  };

  /* Modal Handlers */
  const modalHandlers = {
    password: handlePasswordUpdate,
    name: handleNameUpdate,
    photo: handlePhotoUpdateURL,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Profile</Text>

      {/* ─────────── Profile Card ─────────── */}
      <View style={styles.card}>
        <Image
          source={{
            uri:
              user.photoURL ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png",
          }}
          style={styles.avatar}
        />

        <Text style={styles.infoValue}>{user.displayName || "No Name Set"}</Text>
        <Text style={styles.infoEmail}>{user.email}</Text>

        <Text style={styles.statsText}>
          Playlists Created:{" "}
          <Text style={{ fontWeight: "700" }}>{playlistsCount}</Text>
        </Text>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalType("name")}
        >
          <Text style={styles.btnText}>Change Display Name</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalType("photo")}
        >
          <Text style={styles.btnText}>Update Profile Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalType("password")}
        >
          <Text style={styles.btnText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

      </View>

      {/* ─────────── Modal ─────────── */}
      <Modal visible={modalType !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{modalTitles[modalType]}</Text>

            {/* ─────────── Avatar Selection (Only for photo modal) ─────────── */}
            {modalType === "photo" && (
              <View style={styles.avatarGrid}>
                {presetAvatars.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleAvatarSelect(url)}
                  >
                    <Image source={{ uri: url }} style={styles.avatarOption} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Optional URL Input */}
            {modalType === "photo" && (
              <TextInput
                style={styles.input}
                placeholder={modalPlaceholders[modalType]}
                value={inputValue}
                onChangeText={setInputValue}
              />
            )}

            {modalType !== "photo" && (
              <TextInput
                style={styles.input}
                placeholder={modalPlaceholders[modalType]}
                secureTextEntry={modalType === "password"}
                value={inputValue}
                onChangeText={setInputValue}
              />
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              {modalType !== "photo" && (
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={modalHandlers[modalType]}
                >
                  <Text style={styles.confirmText}>Save</Text>
                </TouchableOpacity>
              )}

              {/* For photo modal - Save URL button */}
              {modalType === "photo" && (
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handlePhotoUpdateURL}
                >
                  <Text style={styles.confirmText}>Use URL</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ─────────── Styles ─────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 5,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2E3A59",
    marginBottom: 20,
  },

  card: {
    width: "88%",
    backgroundColor: "#fff",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,182,193,0.35)",
    shadowColor: "#9AC8EB",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    alignItems: "center",
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 100,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "rgba(255,182,193,0.5)",
  },

  infoValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E3A59",
  },

  infoEmail: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 20,
  },

  statsText: {
    fontSize: 16,
    color: "#2E3A59",
    marginBottom: 25,
  },

  button: {
    width: "90%",
    paddingVertical: 12,
    backgroundColor: "rgba(255,182,193,0.9)",
    marginBottom: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },

  logoutBtn: {
    width: "90%",
    paddingVertical: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 14,
    marginTop: 10,
    marginBottom: 6,
  },

  logoutText: {
    color: "#555",
    fontWeight: "700",
    textAlign: "center",
  },

  deleteBtn: {
    width: "90%",
    paddingVertical: 12,
    backgroundColor: "#ff6b6b",
    borderRadius: 14,
  },

  deleteText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,182,193,0.45)",
    backgroundColor: "#FDF7FA",
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cancelBtn: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 12,
    backgroundColor: "#ddd",
    borderRadius: 12,
  },

  cancelText: {
    textAlign: "center",
    color: "#555",
    fontWeight: "600",
  },

  confirmBtn: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 12,
    backgroundColor: "rgba(255,182,193,0.9)",
    borderRadius: 12,
  },

  confirmText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
  },

  /* Avatar Selection */
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  avatarOption: {
    width: 70,
    height: 70,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,182,193,0.5)",
  },
});
