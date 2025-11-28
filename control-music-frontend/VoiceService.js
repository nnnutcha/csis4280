// VoiceService.js
import { Audio } from "expo-av";
// ⭐ ใช้ legacy filesystem เพื่อรองรับ readAsStringAsync
import * as FileSystem from "expo-file-system/legacy";

let recording = null;

const RECORDING_SETTINGS = {
  android: {
    extension: ".wav",
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_LINEAR_PCM,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM_16BIT,
    sampleRate: 48000,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: ".wav",
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 48000,
    numberOfChannels: 1,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

export async function startRecording() {
  try {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) return false;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(RECORDING_SETTINGS);
    await recording.startAsync();

    console.log("🎤 Recording started");
    return true;
  } catch (err) {
    console.log("Start recording error:", err);
    return false;
  }
}

export async function stopRecording(API_KEY) {
  try {
    if (!recording) return "";

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log("📁 Recording URI:", uri);

    // ⭐ อ่านไฟล์ด้วย legacy, encoding ต้องเป็น "base64"
    const base64Audio = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    console.log("📦 Base64 length:", base64Audio.length);

    return await sendToGoogleSTT(base64Audio, API_KEY);
  } catch (err) {
    console.log("Stop recording error:", err);
    return "no speech detected";
  }
}

async function sendToGoogleSTT(base64Audio, API_KEY) {
  console.log("🚀 Sending to Google Cloud Speech-to-Text...");

  const body = {
    audio: { content: base64Audio },
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 48000,
      languageCode: "en-US",
      enableAutomaticPunctuation: true,
    },
  };

  try {
    const res = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    console.log("🌐 Google Response:", JSON.stringify(data, null, 2));

    return (
      data?.results?.[0]?.alternatives?.[0]?.transcript ||
      "no speech detected"
    );
  } catch (err) {
    console.log("STT error:", err);
    return "no speech detected";
  }
}
