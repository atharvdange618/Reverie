/**
 * Reverie Settings Queries
 */

import { executeQuery, executeUpdate } from '../database';
import { AppSettings, defaultSettings } from '../../types';

/**
 * Get a setting value
 */
export const getSetting = <K extends keyof AppSettings>(
  key: K,
): AppSettings[K] => {
  const results = executeQuery<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key],
  );

  if (results.length === 0) {
    return defaultSettings[key];
  }

  try {
    return JSON.parse(results[0].value) as AppSettings[K];
  } catch {
    return defaultSettings[key];
  }
};

/**
 * Set a setting value
 */
export const setSetting = <K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
): void => {
  const jsonValue = JSON.stringify(value);

  executeUpdate(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, jsonValue],
  );
};

/**
 * Get all settings
 */
export const getAllSettings = (): AppSettings => {
  const results = executeQuery<{ key: string; value: string }>(
    'SELECT key, value FROM settings',
  );

  const settings = { ...defaultSettings };

  for (const row of results) {
    try {
      const key = row.key as keyof AppSettings;
      if (key in defaultSettings) {
        (settings as Record<string, unknown>)[key] = JSON.parse(row.value);
      }
    } catch {
      // Ignore parse errors, use default
    }
  }

  return settings;
};

/**
 * Reset all settings to defaults
 */
export const resetSettings = (): void => {
  executeUpdate('DELETE FROM settings');
};
