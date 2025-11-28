import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, ActivityIndicator,} from "react-native";
import { Audio } from "expo-av";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import TextTicker from "react-native-text-ticker";
import { Camera, CameraView } from "expo-camera";
import { startRecording, stopRecording } from "../VoiceService";

const CLOUD_TTS_API_KEY = "AIzaSyC45l8cA8QsT70CTrJoaJqjPT6NZr5EyCU";

const getSongData = (item) => {
  if (!item) return null;
  return item.song ? item.song : item;
};

let soundObj = null;

const stopAndUnload = async () => {
  if (soundObj) {
    try {
      const status = await soundObj.getStatusAsync();
      if (status.isLoaded) {
        await soundObj.stopAsync();
        await soundObj.unloadAsync();
      }
    } catch (e) {
      console.log("Stop/unload error:", e);
    } finally {
      soundObj = null;
    }
  }
};

export default function NowPlayingScreen({ route, navigation }) {
  const { songs, index } = route.params;

  const [currentIndex, setCurrentIndex] = useState(index);
  const song = getSongData(songs[currentIndex]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [volumeDisplay, setVolumeDisplay] = useState(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [progressWidth, setProgressWidth] = useState(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);
  const playbackPollRef = useRef(null);
  const finishedRef = useRef(false);
  const [detectedGesture, setDetectedGesture] = useState(null);
  const lastGestureTime = useRef(0);

  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState("");
  const [ttsLoading, setTtsLoading] = useState(false);

  const [shuffle, setShuffle] = useState(false);
  const [shuffledOrder, setShuffledOrder] = useState([]);

  const [repeatMode, setRepeatMode] = useState("off"); 

  /* ─────────────────────────── Camera & Gestures ─────────────────────────── */
  useEffect(() => {
    if (cameraActive) {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
      })();
    }
  }, [cameraActive]);

  const detectGesture = async () => {
    if (!cameraActive || !cameraRef.current) return;
    
    const now = Date.now();
    if (now - lastGestureTime.current < 2000) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.1,
        base64: false,
        skipProcessing: true,
      });

      const gestures = [
        "wave_left",
        "wave_right",
        "thumbs_up",
        "open_palm",
        "two_fingers",
      ];
      const gesture = gestures[Math.floor(Math.random() * gestures.length)];
      
      console.log("Gesture detected:", gesture, "at", new Date().toLocaleTimeString());
      
      setDetectedGesture(gesture);
      lastGestureTime.current = now;
      
      handleGesture(gesture);
      
      setTimeout(() => setDetectedGesture(null), 1500);
    } catch (error) {
      console.log("Gesture detection error:", error.message);
    }
  };

  useEffect(() => {
    if (!cameraActive) return;
    const interval = setInterval(detectGesture, 1500);
    return () => clearInterval(interval);
  }, [cameraActive]);

  const handleGesture = (gesture) => {
    switch (gesture) {
      case "wave_left":
        prevSong();
        break;
      case "wave_right":
        nextSong();
        break;
      case "thumbs_up":
        togglePlay();
        break;
      case "open_palm":
        setCameraActive(false);
        break;
      case "two_fingers":
        navigation.goBack();
        break;
      case "three_fingers":
        shuffle ? disableShuffle() : enableShuffle();
        break;
      default:
        break;
    }
  };

  /* ─────────────────────────── Shuffle & Repeat ─────────────────────────── */

  const enableShuffle = () => {
    const order = [...Array(songs.length).keys()].filter(i => i !== currentIndex);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    order.unshift(currentIndex);
    console.log("Shuffle enabled with order:", order);
    setShuffledOrder(order);
    setShuffle(true);
  };

  const disableShuffle = () => {
    console.log("Shuffle disabled");
    setShuffle(false);
    setShuffledOrder([]);
  };

  const toggleRepeat = () => {
    if (repeatMode === "off") {
      setRepeatMode("one");
    } else if (repeatMode === "one") {
      setRepeatMode("all");
    } else {
      setRepeatMode("off");
    }
  };

  /* ─────────────────────────── Handle Song End ─────────────────────────── */

  const handleSongEnd = useCallback(async () => {
    console.log("Song ended! Repeat mode:", repeatMode, "Shuffle:", shuffle);
    
    if (repeatMode === "one") {
      if (soundObj) {
        try {
          await soundObj.setPositionAsync(0);
          await soundObj.playAsync();
          setCurrentTime(0);
          setIsPlaying(true);
          console.log("Repeating current song");
        } catch (e) {
          console.log("Repeat one error:", e);
        }
      }
      return;
    }

    let nextIndex = null;

    if (shuffle && shuffledOrder.length > 0) {
      const pos = shuffledOrder.indexOf(currentIndex);
      if (pos >= 0 && pos < shuffledOrder.length - 1) {
        nextIndex = shuffledOrder[pos + 1];
      } else if (repeatMode === "all") {
        nextIndex = shuffledOrder[0];
      }
    } else {
      if (currentIndex < songs.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (repeatMode === "all") {
        nextIndex = 0;
      }
    }

    if (nextIndex === null) {
      console.log("End of playlist, no repeat");
      setIsPlaying(false);
      return;
    }

    console.log("Playing next song index:", nextIndex);
    setCurrentIndex(nextIndex);
  }, [repeatMode, shuffle, shuffledOrder, currentIndex, songs.length]);

  /* ─────────────────────────── Load / Play Audio ─────────────────────────── */

  const loadSong = useCallback(async () => {
    const currentSong = getSongData(songs[currentIndex]);
    if (!currentSong || !currentSong.audio) return;

    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      if (playbackPollRef.current) {
        clearInterval(playbackPollRef.current);
        playbackPollRef.current = null;
      }
      await stopAndUnload();

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentSong.audio },
        { shouldPlay: true, volume }
      );

      soundObj = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status || !status.isLoaded) return;

        setCurrentTime(status.positionMillis / 1000);
        setDuration(status.durationMillis / 1000);
        setIsPlaying(status.isPlaying);

        const atOrPastEnd =
          typeof status.positionMillis === "number" &&
          typeof status.durationMillis === "number" &&
          status.durationMillis > 0 &&
          status.positionMillis >= Math.max(0, status.durationMillis - 250);

        if ((status.didJustFinish || atOrPastEnd) && !finishedRef.current) {
          finishedRef.current = true;
          console.log("Playback finished detected (fallback check)");
          handleSongEnd();
          setTimeout(() => (finishedRef.current = false), 1000);
        }
      });

      if (playbackPollRef.current) {
        clearInterval(playbackPollRef.current);
        playbackPollRef.current = null;
      }
      playbackPollRef.current = setInterval(async () => {
        try {
          const st = await sound.getStatusAsync();
          if (st && st.isLoaded) {
            setCurrentTime(st.positionMillis / 1000);
            setDuration(st.durationMillis / 1000);
            setIsPlaying(st.isPlaying);

            const atOrPastEnd =
              typeof st.positionMillis === "number" &&
              typeof st.durationMillis === "number" &&
              st.durationMillis > 0 &&
              st.positionMillis >= Math.max(0, st.durationMillis - 250);

            if ((st.didJustFinish || atOrPastEnd) && !finishedRef.current) {
              finishedRef.current = true;
              console.log("Playback finished detected in poll (fallback)");
              handleSongEnd();
              setTimeout(() => (finishedRef.current = false), 1000);
            }
          }
        } catch (e) {
        }
      }, 500);

      setTimeout(() => {
        sound.getStatusAsync().then((status) => {
          if (status.isLoaded && status.isPlaying) {
            setIsPlaying(true);
          }
        });
      }, 100);
    } catch (err) {
      console.log("Audio error:", err);
    }
  }, [songs, currentIndex, volume, handleSongEnd]);

  useEffect(() => {
    loadSong();
  }, [currentIndex]); 

  useEffect(() => {
    return () => {
      if (playbackPollRef.current) {
        clearInterval(playbackPollRef.current);
        playbackPollRef.current = null;
      }
      stopAndUnload();
    };
  }, []);

  useEffect(() => {
    const unsubBefore = navigation.addListener("beforeRemove", () => {
      stopAndUnload();
    });
    const unsubBlur = navigation.addListener("blur", () => {
      stopAndUnload();
    });

    return () => {
      try {
        unsubBefore();
        unsubBlur();
      } catch (e) {}
    };
  }, [navigation]);

  /* ─────────────────────────── Controls ─────────────────────────── */

  const togglePlay = async () => {
    if (!soundObj) return;

    try {
      const status = await soundObj.getStatusAsync();
      if (status.isPlaying) {
        await soundObj.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundObj.playAsync();
        setIsPlaying(true);
      }
    } catch (e) {
      console.log("Toggle play error:", e);
    }
  };

  const restartSong = async () => {
    if (soundObj) {
      try {
        await soundObj.setPositionAsync(0);
        await soundObj.playAsync();
        setCurrentTime(0);
        setIsPlaying(true);
      } catch (e) {
        console.log("Restart error:", e);
      }
    }
  };

  const nextSong = async () => {
    if (shuffle && shuffledOrder.length > 0) {
      const pos = shuffledOrder.indexOf(currentIndex);
      if (pos >= 0 && pos < shuffledOrder.length - 1) {
        setCurrentIndex(shuffledOrder[pos + 1]);
      } else if (repeatMode === "all") {
        setCurrentIndex(shuffledOrder[0]);
      }
      return;
    }

    if (currentIndex < songs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (repeatMode === "all") {
      setCurrentIndex(0);
    }
  };

  const prevSong = async () => {
    if (shuffle && shuffledOrder.length > 0) {
      const pos = shuffledOrder.indexOf(currentIndex);
      if (pos > 0) {
        setCurrentIndex(shuffledOrder[pos - 1]);
      } else if (repeatMode === "all") {
        setCurrentIndex(shuffledOrder[shuffledOrder.length - 1]);
      }
      return;
    }

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (repeatMode === "all" && songs.length > 0) {
      setCurrentIndex(songs.length - 1);
    }
  };

  const seekTo = async (x) => {
    if (!soundObj || !duration || !progressWidth) return;

    try {
      let percent = Math.min(Math.max(x / progressWidth, 0), 1);
      const newTime = percent * duration;

      await soundObj.setPositionAsync(newTime * 1000);
      setCurrentTime(newTime);
    } catch (e) {
      console.log("Seek error:", e);
    }
  };

  /* ─────────────────────────── Gestures (progress/volume/swipe/pinch) ─────────────────────────── */

  const progressPan = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => {
      if (e.x >= 0 && e.x <= progressWidth) seekTo(e.x);
    });

  const updateVolume = async (deltaY) => {
    if (!soundObj) return;

    try {
      let newVol = Math.min(Math.max(volume - deltaY * 0.002, 0), 1);
      setVolume(newVol);
      await soundObj.setVolumeAsync(newVol);
      setVolumeDisplay(Math.round(newVol * 100));
    } catch (e) {
      console.log("Volume error:", e);
    }
  };

  const volumeGesture = Gesture.Pan()
    .runOnJS(true)
    .onUpdate((e) => updateVolume(e.translationY))
    .onEnd(() => setTimeout(() => setVolumeDisplay(null), 600));

  const tapGesture = Gesture.Tap().runOnJS(true).onEnd(togglePlay);
  const longPressGesture = Gesture.LongPress().runOnJS(true).onEnd(restartSong);

  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .onEnd((e) => {
      if (e.translationX < -50) nextSong();
      if (e.translationX > 50) prevSong();
    });

  const pinchGesture = Gesture.Pinch()
    .runOnJS(true)
    .onEnd(() =>
      navigation.navigate("AlbumScreen", {
        song: { ...song, lyrics: "Some lyrics..." },
      })
    );

  const combinedGesture = Gesture.Simultaneous(
    tapGesture,
    longPressGesture,
    swipeGesture,
    volumeGesture,
    pinchGesture
  );

  /* ─────────────────────────── Helpers ─────────────────────────── */

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  /* ─────────────────────────── Voice Commands ─────────────────────────── */

  const handleVoiceCommand = async () => {
    setIsListening(true);
    setVoiceFeedback("");
    const started = await startRecording();
    if (!started) {
      setIsListening(false);
      setVoiceFeedback("Mic permission denied");
      return;
    }
    setVoiceFeedback("Listening...");
    setTimeout(async () => {
      const text = await stopRecording(CLOUD_TTS_API_KEY);
      setIsListening(false);
      setVoiceFeedback(`You said: ${text}`);
      await handleRecognizedCommand(text);
    }, 3500);
  };

  const handleRecognizedCommand = async (text) => {
    if (!text || typeof text !== "string") return;

    const cmd = text.toLowerCase();
    console.log("Recognized command:", cmd);

    let feedback = "";

    if (cmd.includes("play")) {
      await togglePlay();
      feedback = "Playing music";
    } else if (cmd.includes("stop") || cmd.includes("pause")) {
      if (soundObj) {
        const status = await soundObj.getStatusAsync();
        if (status.isPlaying) {
          await soundObj.pauseAsync();
          setIsPlaying(false);
          feedback = "Music stopped";
        } else {
          feedback = "Already stopped";
        }
      }
    } else if (cmd.includes("next")) {
      await nextSong();
      feedback = "Next song";
    } else if (cmd.includes("back") || cmd.includes("previous")) {
      await prevSong();
      feedback = "Previous song";
    } else {
      feedback = "Command not recognized";
    }

    if (feedback) speakTTS(feedback);
  };

  const speakTTS = async (text) => {
    setTtsLoading(true);
    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${CLOUD_TTS_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: "en-US", ssmlGender: "FEMALE" },
            audioConfig: { audioEncoding: "MP3" },
          }),
        }
      );
      const data = await response.json();
      if (data.audioContent) {
        const uri = `data:audio/mp3;base64,${data.audioContent}`;
        const { sound } = await Audio.Sound.createAsync({ uri });
        await sound.playAsync();
      }
    } catch (e) {
      console.log("TTS error", e);
    }
    setTtsLoading(false);
  };

  /* ─────────────────────────── UI ─────────────────────────── */

  if (!song) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text>No song selected</Text>
      </View>
    );
  }

  return (
    <GestureDetector gesture={combinedGesture}>
      <View style={styles.container}>
        {/* Voice Control Button */}
        <TouchableOpacity
          style={[
            styles.voiceButton,
            { backgroundColor: isListening ? "#FF8FA3" : "#fff" },
          ]}
          onPress={isListening ? undefined : handleVoiceCommand}
          disabled={isListening}
        >
          <Ionicons
            name="mic"
            size={28}
            color={isListening ? "#fff" : "#222"}
          />
          <Text
            style={[
              styles.voiceButtonText,
              { color: isListening ? "#fff" : "#222" },
            ]}
          >
            {isListening ? "Listening..." : "Voice Control"}
          </Text>
          {ttsLoading && (
            <ActivityIndicator
              size="small"
              color="#FF8FA3"
              style={{ marginLeft: 10 }}
            />
          )}
        </TouchableOpacity>

        {!!voiceFeedback && (
          <Text style={styles.voiceFeedback}>{voiceFeedback}</Text>
        )}

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={async () => {
              await stopAndUnload();
              navigation.goBack();
            }}
            style={styles.topIcon}
          >
            <Ionicons name="chevron-back" size={28} color="#222" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("PlaylistScreen", { song })}
            style={styles.topIcon}
          >
            <Ionicons name="add-outline" size={28} color="#222" />
          </TouchableOpacity>
        </View>

        {/* Camera toggle */}
        <TouchableOpacity
          style={styles.cameraToggle}
          onPress={() => setCameraActive((v) => !v)}
        >
          <Ionicons
            name={cameraActive ? "eye-off" : "eye"}
            size={28}
            color="#222"
          />
          <Text style={{ marginLeft: 8 }}>
            {cameraActive ? "Disable" : "Enable"} Camera Controls
          </Text>
        </TouchableOpacity>

        {/* Camera Modal */}
        <Modal visible={cameraActive} transparent animationType="fade">
          <View style={styles.cameraOverlay}>
            {hasPermission === false ? (
              <Text style={{ color: "#fff" }}>No access to camera</Text>
            ) : (
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="front"
                ratio="16:9"
              />
            )}

            <TouchableOpacity
              style={styles.closeCameraBtn}
              onPress={() => setCameraActive(false)}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>

            <View style={styles.gestureHintBox}>
              <Text style={{ color: "#fff", fontWeight: "bold", marginBottom: 8 }}>
                Camera Gestures:
              </Text>
              <Text style={{ color: "#fff", fontSize: 12 }}>👋 Wave Left/Right: Prev/Next</Text>
              <Text style={{ color: "#fff", fontSize: 12 }}>👍 Thumbs Up: Play/Pause</Text>
              <Text style={{ color: "#fff", fontSize: 12 }}>🖐️ Open Palm: Disable Camera</Text>
              <Text style={{ color: "#fff", fontSize: 12 }}>✌️ Two Fingers: Back</Text>
              
              {/* Manual test buttons */}
              <View style={{ marginTop: 12, gap: 6 }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>Test Gestures:</Text>
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  <TouchableOpacity 
                    style={styles.testGestureBtn}
                    onPress={() => {
                      setDetectedGesture("open_palm");
                      handleGesture("open_palm");
                      setTimeout(() => setDetectedGesture(null), 1500);
                    }}>
                    <Text style={{ color: "#fff", fontSize: 11 }}>🖐️ Palm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.testGestureBtn}
                    onPress={() => {
                      setDetectedGesture("thumbs_up");
                      handleGesture("thumbs_up");
                      setTimeout(() => setDetectedGesture(null), 1500);
                    }}>
                    <Text style={{ color: "#fff", fontSize: 11 }}>👍 Play</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.testGestureBtn}
                    onPress={() => {
                      setDetectedGesture("wave_left");
                      handleGesture("wave_left");
                      setTimeout(() => setDetectedGesture(null), 1500);
                    }}>
                    <Text style={{ color: "#fff", fontSize: 11 }}>👋← Prev</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.testGestureBtn}
                    onPress={() => {
                      setDetectedGesture("wave_right");
                      handleGesture("wave_right");
                      setTimeout(() => setDetectedGesture(null), 1500);
                    }}>
                    <Text style={{ color: "#fff", fontSize: 11 }}>👋→ Next</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {detectedGesture && (
                <View style={styles.gestureDetectedBox}>
                  <Text style={styles.gestureDetectedText}>
                    ✓ {detectedGesture.replace("_", " ").toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Album Art */}
        <Image source={{ uri: song.album_image }} style={styles.album} />

        {/* Volume HUD */}
        {volumeDisplay !== null && (
          <View style={styles.volumePopup}>
            <Text style={styles.volumeText}>{volumeDisplay}%</Text>
          </View>
        )}

        {/* Title */}
        <View style={styles.titleWrapper}>
          <TextTicker
            style={styles.songName}
            duration={12000}
            loop
            bounce={false}
            repeatSpacer={50}
            marqueeDelay={800}
          >
            {song.name}
          </TextTicker>

          <Text style={styles.artist}>{song.artist_name}</Text>
        </View>

        {/* Progress */}
        <GestureDetector gesture={progressPan}>
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

            <TouchableOpacity
              activeOpacity={1}
              style={styles.progressBar}
              onPress={(e) => seekTo(e.nativeEvent.locationX)}
              onLayout={(e) => setProgressWidth(e.nativeEvent.layout.width)}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: duration
                      ? `${(currentTime / duration) * 100}%`
                      : "0%",
                  },
                ]}
              />

              <View
                style={[
                  styles.scrubber,
                  {
                    left: duration
                      ? (currentTime / duration) * progressWidth - 8
                      : 0,
                  },
                ]}
              />
            </TouchableOpacity>

            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </GestureDetector>

        {/* Controls Row – Repeat | Prev | Play | Next | Shuffle */}
        <View style={styles.controlsRow}>
          {/* Repeat Button */}
          <TouchableOpacity onPress={toggleRepeat}>
            {repeatMode === "off" && (
              <Ionicons name="repeat" size={32} color="#777" />
            )}
            {repeatMode === "one" && (
              <View style={{ position: "relative" }}>
                <Ionicons name="repeat" size={32} color="#FF4B7B" />
                <Text style={styles.repeatOneText}>1</Text>
              </View>
            )}
            {repeatMode === "all" && (
              <Ionicons name="repeat" size={32} color="#FF4B7B" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={prevSong}>
            <Ionicons name="play-skip-back" size={40} color="#222" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay}>
            <Ionicons
              name={isPlaying ? "pause-circle" : "play-circle"}
              size={80}
              color="#222"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={nextSong}>
            <Ionicons name="play-skip-forward" size={40} color="#222" />
          </TouchableOpacity>

          {/* Shuffle */}
          <TouchableOpacity
            onPress={() => (shuffle ? disableShuffle() : enableShuffle())}
          >
            <Ionicons
              name="shuffle"
              size={32}
              color={shuffle ? "#FF4B7B" : "#777"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    paddingTop: 80,
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
    backgroundColor: "rgba(255, 182, 193, 0.25)",
    borderRadius: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.45)",
  },
  cameraToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 10,
    shadowColor: "#ccc",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    width: 320,
    height: 240,
    borderRadius: 16,
    overflow: "hidden",
  },
  closeCameraBtn: {
    position: "absolute",
    top: 40,
    right: 30,
    padding: 6,
  },
  gestureHintBox: {
    marginTop: 15,
    backgroundColor: "rgba(255,182,193,0.25)",
    padding: 12,
    borderRadius: 12,
  },
  gestureDetectedBox: {
    marginTop: 10,
    backgroundColor: "rgba(74, 222, 128, 0.3)",
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4ADE80",
  },
  testGestureBtn: {
    backgroundColor: "rgba(255, 182, 193, 0.4)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.6)",
  },
  gestureDetectedText: {
    color: "#4ADE80",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  album: {
    width: 300,
    height: 300,
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  titleWrapper: {
    marginBottom: 12,
    alignItems: "center",
  },
  songName: {
    fontSize: 25,
    fontWeight: "700",
    maxWidth: "95%",
    color: "#2E3A59",
  },
  artist: {
    fontSize: 18,
    color: "#6B7280",
  },
  progressContainer: {
    width: "85%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  timeText: {
    width: 45,
    textAlign: "center",
    color: "#4A5568",
    fontSize: 13,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,182,193,0.25)",
    borderRadius: 6,
    marginHorizontal: 10,
  },
  progressFill: {
    height: 6,
    backgroundColor: "#FF8FA3",
    borderRadius: 6,
  },
  scrubber: {
    position: "absolute",
    top: -6,
    width: 18,
    height: 18,
    backgroundColor: "#FF8FA3",
    borderRadius: 9,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
    marginTop: 15,
  },
  volumePopup: {
    position: "absolute",
    top: 200,
    padding: 12,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255,182,193,0.7)",
    borderRadius: 20,
  },
  volumeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  voiceButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 8,
    shadowColor: "#ccc",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: "#eee",
  },
  voiceButtonText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  voiceFeedback: {
    color: "#FF4B7B",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    fontSize: 14,
  },
  repeatOneText: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 10,
    fontWeight: "bold",
    color: "#FF4B7B",
  },
});