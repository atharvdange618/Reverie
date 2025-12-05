/**
 * PDF Utilities
 */

// TODO: Add @react-native-documents/picker when npm registry is available
// import { pick, types } from '@react-native-documents/picker';

/**
 * Pick a PDF file from device storage
 * TODO: Implement when document picker is installed
 */
export const pickPdfFile = async (): Promise<{
  name: string;
  uri: string;
  size: number | null;
} | null> => {
  // Placeholder until document picker is installed
  console.warn('Document picker not yet installed');
  return null;
};

/**
 * Extract title from PDF filename
 */
export const extractTitleFromFilename = (filename: string): string => {
  // Remove file extension
  const withoutExtension = filename.replace(/\.pdf$/i, '');

  // Replace underscores and hyphens with spaces
  const withSpaces = withoutExtension.replace(/[_-]/g, ' ');

  // Capitalize first letter of each word
  const titleCase = withSpaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return titleCase.trim() || 'Untitled';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number | null): string => {
  if (bytes === null || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(1)} ${units[i]}`;
};
