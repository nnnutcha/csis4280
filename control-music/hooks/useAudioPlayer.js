// hooks/useAudioPlayer.js
import React from 'react';
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export default function useAudioPlayer() {
  const soundRef = React.useRef(null);
  const [status, setStatus] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      try {
        if (Platform.OS !== 'web' && Audio?.setAudioModeAsync) {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
        }
      } catch (e) {
        console.warn('AUDIO MODE ERROR (expo-av)', e);
      }
    })();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  const onStatusUpdate = React.useCallback((s) => setStatus(s), []);

  const loadAsync = React.useCallback(async (source) => {
    if (!Audio?.Sound?.createAsync) throw new Error('Audio module unavailable');
    if (soundRef.current) await soundRef.current.unloadAsync();
    const { sound } = await Audio.Sound.createAsync(source, {}, onStatusUpdate);
    soundRef.current = sound;
    setStatus(await sound.getStatusAsync());
  }, [onStatusUpdate]);

  const playPause = React.useCallback(async () => {
    if (!soundRef.current) return;
    const s = await soundRef.current.getStatusAsync();
    if (!s.isLoaded) return;
    if (s.isPlaying) await soundRef.current.pauseAsync();
    else await soundRef.current.playAsync();
    setStatus(await soundRef.current.getStatusAsync());
  }, []);

  const seekBy = React.useCallback(async (seconds) => {
    if (!soundRef.current) return;
    const s = await soundRef.current.getStatusAsync();
    if (!s.isLoaded) return;
    const next = Math.max(0, (s.positionMillis || 0) + seconds * 1000);
    await soundRef.current.setPositionAsync(next);
    setStatus(await soundRef.current.getStatusAsync());
  }, []);

  const setVolume = React.useCallback(async (delta) => {
    if (!soundRef.current) return;
    const s = await soundRef.current.getStatusAsync();
    if (!s.isLoaded) return;
    const next = Math.max(0, Math.min(1, (s.volume ?? 1) + delta));
    await soundRef.current.setVolumeAsync(next);
    setStatus(await soundRef.current.getStatusAsync());
  }, []);

  return { status, loadAsync, playPause, seekBy, setVolume };
}
