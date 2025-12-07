/**
 * Music Control Store
 *
 * Manages ambient music playback state using react-native-sound
 */

import { create } from 'zustand';
import Sound from 'react-native-sound';

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback');

// Define ambient tracks with display info
export const AMBIENT_TRACKS = [
  {
    id: 'ocean',
    file: 'heart_of_the_ocean.mp3',
    title: 'Heart of the Ocean',
    artist: 'Ambient',
    icon: '🌊',
  },
  {
    id: 'rain',
    file: 'rain_and_storm.mp3',
    title: 'Rain & Storm',
    artist: 'Nature',
    icon: '🌧️',
  },
  {
    id: 'stars',
    file: 'adrift_among_stars.mp3',
    title: 'Adrift Among Stars',
    artist: 'Space',
    icon: '✨',
  },
];

interface MusicState {
  isPlaying: boolean;
  volume: number;
  currentTrackIndex: number;
  sound: Sound | null;
  isLoaded: boolean;
  currentTime: number;
  duration: number;

  // Actions
  toggleMusic: () => void;
  setVolume: (volume: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  playTrack: (index: number) => void;
  initialize: () => void;
  cleanup: () => void;
  updateProgress: () => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  isPlaying: false,
  volume: 0.5,
  currentTrackIndex: 0,
  sound: null,
  isLoaded: false,
  currentTime: 0,
  duration: 0,

  initialize: () => {
    const { currentTrackIndex, volume, sound: existingSound } = get();

    // Clean up existing sound if any
    if (existingSound) {
      existingSound.stop();
      existingSound.release();
    }

    const track = AMBIENT_TRACKS[currentTrackIndex];

    // Load sound from app bundle
    const sound = new Sound(track.file, Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.error('Error loading sound:', error);
        set({ isLoaded: false });
        return;
      }

      // Set volume and enable looping
      sound.setVolume(volume);
      sound.setNumberOfLoops(-1); // Loop indefinitely

      const duration = sound.getDuration();
      set({ sound, isLoaded: true, duration, currentTime: 0 });
    });
  },

  toggleMusic: () => {
    const { isPlaying, sound, isLoaded } = get();

    if (!sound || !isLoaded) {
      // Initialize first if not loaded
      get().initialize();
      return;
    }

    if (isPlaying) {
      sound.pause();
      set({ isPlaying: false });
    } else {
      sound.play(success => {
        if (!success) {
          console.error('Playback failed');
        }
      });
      set({ isPlaying: true });
    }
  },

  setVolume: (volume: number) => {
    const { sound } = get();
    if (sound) {
      sound.setVolume(volume);
    }
    set({ volume });
  },

  updateProgress: () => {
    const { sound, isPlaying } = get();
    if (sound && isPlaying) {
      sound.getCurrentTime(seconds => {
        set({ currentTime: seconds });
      });
    }
  },

  playTrack: (index: number) => {
    const { sound, isPlaying } = get();

    // Stop current sound
    if (sound) {
      sound.stop();
      sound.release();
    }

    set({
      currentTrackIndex: index,
      sound: null,
      isLoaded: false,
      currentTime: 0,
    });

    // Load and play new track
    const track = AMBIENT_TRACKS[index];
    const { volume } = get();

    const newSound = new Sound(track.file, Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.error('Error loading sound:', error);
        return;
      }

      newSound.setVolume(volume);
      newSound.setNumberOfLoops(-1);

      const duration = newSound.getDuration();
      set({ sound: newSound, isLoaded: true, duration });

      // Auto-play if was playing before
      if (isPlaying) {
        newSound.play();
        set({ isPlaying: true });
      }
    });
  },

  nextTrack: () => {
    const { currentTrackIndex } = get();
    const nextIndex = (currentTrackIndex + 1) % AMBIENT_TRACKS.length;
    get().playTrack(nextIndex);
  },

  previousTrack: () => {
    const { currentTrackIndex } = get();
    const prevIndex =
      currentTrackIndex === 0
        ? AMBIENT_TRACKS.length - 1
        : currentTrackIndex - 1;
    get().playTrack(prevIndex);
  },

  cleanup: () => {
    const { sound } = get();
    if (sound) {
      sound.stop();
      sound.release();
    }
    set({ sound: null, isPlaying: false, isLoaded: false, currentTime: 0 });
  },
}));
