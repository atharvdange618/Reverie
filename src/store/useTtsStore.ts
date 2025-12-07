/**
 * TTS (Text-to-Speech) Store
 *
 * Manages TTS playback state using react-native-tts
 * - Reads current page text aloud
 * - Speed control (0.5x, 1x, 1.5x, 2x)
 * - Auto-pauses ambient music when speaking
 */

import { create } from 'zustand';
import Tts from 'react-native-tts';
import { useMusicStore } from './useMusicStore';
import { extractPageText } from '../utils/pdfTextExtractor';

// Speed presets - Android TTS uses 0.5 as normal speed
// These are adjusted for natural reading pace
export const TTS_SPEEDS = [
  { label: '0.5x', value: 0.25 },
  { label: '1x', value: 0.5 },
  { label: '1.5x', value: 0.75 },
  { label: '2x', value: 1.0 },
] as const;

interface TtsState {
  isSpeaking: boolean;
  isPaused: boolean;
  speed: number;
  speedIndex: number;
  currentText: string;
  isInitialized: boolean;
  wasAmbientPlaying: boolean; // Track if we paused ambient music
  selectedVoiceId: string | null; // Store the selected voice ID

  // Actions
  initialize: () => Promise<void>;
  speak: (text: string) => void;
  speakPage: (filePath: string, pageNumber: number) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setSpeed: (speedIndex: number) => void;
  cycleSpeed: () => void;
  setVoice: (voiceId: string) => Promise<void>;
  cleanup: () => void;
}

export const useTtsStore = create<TtsState>((set, get) => ({
  isSpeaking: false,
  isPaused: false,
  speed: 0.5, // Normal speed on Android TTS
  speedIndex: 1, // Default to 1x (index 1)
  currentText: '',
  isInitialized: false,
  wasAmbientPlaying: false,
  selectedVoiceId: null,

  initialize: async () => {
    if (get().isInitialized) return;

    try {
      // Initialize TTS engine
      await Tts.getInitStatus();

      // Set default rate (0.5 = normal speed on Android)
      Tts.setDefaultRate(get().speed);

      // Set up event listeners
      Tts.addEventListener('tts-start', () => {
        set({ isSpeaking: true, isPaused: false });
      });

      Tts.addEventListener('tts-finish', () => {
        // Restore ambient music if we paused it
        const { wasAmbientPlaying } = get();
        if (wasAmbientPlaying) {
          const musicStore = useMusicStore.getState();
          if (!musicStore.isPlaying) {
            musicStore.toggleMusic();
          }
        }
        set({ isSpeaking: false, isPaused: false, wasAmbientPlaying: false });
      });

      Tts.addEventListener('tts-cancel', () => {
        // Restore ambient music if we paused it
        const { wasAmbientPlaying } = get();
        if (wasAmbientPlaying) {
          const musicStore = useMusicStore.getState();
          if (!musicStore.isPlaying) {
            musicStore.toggleMusic();
          }
        }
        set({ isSpeaking: false, isPaused: false, wasAmbientPlaying: false });
      });

      set({ isInitialized: true });
      console.log('[TTS] Initialized successfully');
    } catch (error) {
      console.error('[TTS] Initialization error:', error);
    }
  },

  speak: (text: string) => {
    const { isInitialized, speed, selectedVoiceId } = get();

    if (!isInitialized) {
      console.warn('[TTS] Not initialized, initializing now...');
      get()
        .initialize()
        .then(() => {
          get().speak(text);
        });
      return;
    }

    if (!text || text.trim().length === 0) {
      console.warn('[TTS] No text to speak');
      return;
    }

    // Pause ambient music if playing
    const musicStore = useMusicStore.getState();
    if (musicStore.isPlaying) {
      musicStore.toggleMusic(); // Pause it
      set({ wasAmbientPlaying: true });
    }

    // Stop any current speech
    Tts.stop();

    // Re-apply the selected voice before speaking (Android TTS can reset)
    if (selectedVoiceId) {
      Tts.setDefaultVoice(selectedVoiceId);
      console.log('[TTS] Speaking with voice:', selectedVoiceId);
    } else {
      console.log('[TTS] Speaking with system default voice');
    }

    // Set the rate before speaking
    Tts.setDefaultRate(speed);

    // Speak the text
    set({ currentText: text });
    Tts.speak(text);
  },

  speakPage: async (filePath: string, pageNumber: number) => {
    try {
      console.log(`[TTS] Extracting text from page ${pageNumber}...`);
      const text = await extractPageText(filePath, pageNumber);

      if (!text || text.trim().length === 0) {
        console.warn('[TTS] No text found on page', pageNumber);
        return;
      }

      console.log(`[TTS] Speaking page ${pageNumber}, ${text.length} chars`);
      get().speak(text);
    } catch (error) {
      console.error('[TTS] Error extracting page text:', error);
    }
  },

  pause: () => {
    Tts.stop();
    set({ isPaused: true, isSpeaking: false });
  },

  resume: () => {
    const { currentText, speed } = get();
    if (currentText) {
      Tts.setDefaultRate(speed);
      Tts.speak(currentText);
    }
    set({ isPaused: false });
  },

  stop: () => {
    Tts.stop();
    // Note: tts-cancel event will handle cleanup
  },

  setSpeed: (speedIndex: number) => {
    const newSpeed = TTS_SPEEDS[speedIndex].value;
    Tts.setDefaultRate(newSpeed);
    set({ speed: newSpeed, speedIndex });

    // If currently speaking, restart with new speed
    const { isSpeaking, currentText } = get();
    if (isSpeaking && currentText) {
      Tts.stop();
      setTimeout(() => {
        Tts.speak(currentText);
      }, 100);
    }
  },

  cycleSpeed: () => {
    const { speedIndex } = get();
    const nextIndex = (speedIndex + 1) % TTS_SPEEDS.length;
    get().setSpeed(nextIndex);
  },

  setVoice: async (voiceId: string) => {
    try {
      await Tts.setDefaultVoice(voiceId);
      set({ selectedVoiceId: voiceId });
      console.log('[TTS] Voice set to:', voiceId);
    } catch (error) {
      console.error('[TTS] Error setting voice:', error);
    }
  },

  cleanup: () => {
    Tts.stop();
    set({
      isSpeaking: false,
      isPaused: false,
      currentText: '',
      wasAmbientPlaying: false,
    });
  },
}));
