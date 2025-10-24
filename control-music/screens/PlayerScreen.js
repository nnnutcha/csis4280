// screens/PlayerScreen.js
import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import PlayerControls from '../components/PlayerControls';
import useAudioPlayer from '../hooks/useAudioPlayer';

export default function PlayerScreen() {
  const { status, loadAsync, playPause, seekBy, setVolume } = useAudioPlayer();

  React.useEffect(() => {
  (async () => {
    try {
      await loadAsync(require('../assets/keshi - Soft Spot.mp3')); // start with this
    } catch (e) {
      console.warn('LOAD ERROR', e);
    }
  })();
}, [loadAsync, playPause]);

  // Gestures: tap=play/pause, left/right=seek, up/down=volume
  const tap = Gesture.Tap().onEnd(() => playPause());
  const swipe = Gesture.Pan().onEnd(e => {
    const { translationX, translationY } = e;
    if (Math.abs(translationX) > Math.abs(translationY)) {
      if (translationX > 40) seekBy(10);      // swipe right = forward 10s
      else if (translationX < -40) seekBy(-10); // swipe left = back 10s
    } else {
      if (translationY < -40) setVolume(+0.1);  // swipe up = volume up
      else if (translationY > 40) setVolume(-0.1); // swipe down = volume down
    }
  });

  const composed = useMemo(() => Gesture.Simultaneous(tap, swipe), [tap, swipe]);

  return (
    <GestureDetector gesture={composed}>
      <View style={{ flex: 1, padding: 20, justifyContent: 'center', gap: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '600', textAlign: 'center' }}>
          Now Playing
        </Text>
        <Text style={{ fontSize: 16, textAlign: 'center' }}>
          Tap: Play/Pause · Swipe ←/→: Seek ±10s · Swipe ↑/↓: Volume
        </Text>

        <PlayerControls
          isPlaying={!!status?.isPlaying}
          onPlayPause={playPause}
          onBack={() => seekBy(-10)}
          onForward={() => seekBy(10)}
        />

        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Text>Position: {Math.floor((status?.positionMillis ?? 0) / 1000)}s</Text>
          <Text>Duration: {Math.floor((status?.durationMillis ?? 0) / 1000)}s</Text>
          <Text>Volume: {status?.volume?.toFixed(2) ?? '—'}</Text>
        </View>
      </View>
    </GestureDetector>
  );
}
