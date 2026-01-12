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
  wasAmbientPlaying: boolean;
  selectedVoiceId: string | null;

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
  speed: 0.5,
  speedIndex: 1,
  currentText: '',
  isInitialized: false,
  wasAmbientPlaying: false,
  selectedVoiceId: null,

  initialize: async () => {
    if (get().isInitialized) return;

    try {
      await Tts.getInitStatus();

      Tts.setDefaultRate(get().speed);

      Tts.addEventListener('tts-start', () => {
        set({ isSpeaking: true, isPaused: false });
      });

      Tts.addEventListener('tts-finish', () => {
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

    const musicStore = useMusicStore.getState();
    if (musicStore.isPlaying) {
      musicStore.toggleMusic();
      set({ wasAmbientPlaying: true });
    }

    Tts.stop();

    if (selectedVoiceId) {
      Tts.setDefaultVoice(selectedVoiceId);
    }

    Tts.setDefaultRate(speed);

    set({ currentText: text });
    Tts.speak(text);
  },

  speakPage: async (filePath: string, pageNumber: number) => {
    try {
      const text = await extractPageText(filePath, pageNumber);

      if (!text || text.trim().length === 0) {
        console.warn('[TTS] No text found on page', pageNumber);
        return;
      }

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
  },

  setSpeed: (speedIndex: number) => {
    const newSpeed = TTS_SPEEDS[speedIndex].value;
    Tts.setDefaultRate(newSpeed);
    set({ speed: newSpeed, speedIndex });

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
