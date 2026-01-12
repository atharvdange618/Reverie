/**
 * PDF Utilities
 */

import { pick, types } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';

const getBooksDir = () => `${RNFS.DocumentDirectoryPath}/books`;

/**
 * Pick a PDF file from device storage and copy it to app storage
 */
export const pickPdfFile = async (): Promise<{
  name: string;
  uri: string;
  size: number | null;
} | null> => {
  try {
    const [result] = await pick({
      type: [types.pdf],
      mode: 'open',
    });

    if (result) {
      const timestamp = Date.now();
      const sanitizedName = (result.name || 'book.pdf').replace(
        /[^a-zA-Z0-9.-]/g,
        '_',
      );
      const destFileName = `${timestamp}_${sanitizedName}`;
      const booksDir = getBooksDir();
      const destPath = `${booksDir}/${destFileName}`;

      const dirExists = await RNFS.exists(booksDir);
      if (!dirExists) {
        await RNFS.mkdir(booksDir);
      }

      await RNFS.copyFile(result.uri, destPath);

      const stats = await RNFS.stat(destPath);

      return {
        name: result.name || 'Untitled.pdf',
        uri: destPath,
        size: stats.size ? Number(stats.size) : null,
      };
    }

    return null;
  } catch (error: any) {
    if (
      error?.code === 'OPERATION_CANCELED' ||
      error?.message?.includes('cancel')
    ) {
      return null;
    }
    console.error('Error picking PDF:', error);
    throw error;
  }
};

/**
 * Extract title from PDF filename
 */
export const extractTitleFromFilename = (filename: string): string => {
  const withoutExtension = filename.replace(/\.pdf$/i, '');

  const withSpaces = withoutExtension.replace(/[_-]/g, ' ');

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

/**
 * Delete a PDF file from app storage
 */
export const deletePdfFile = async (filePath: string): Promise<void> => {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
  } catch (error) {
    console.error('Error deleting PDF file:', error);
  }
};
