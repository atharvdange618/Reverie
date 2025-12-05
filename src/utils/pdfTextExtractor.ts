import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'PdfTextExtractor' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const PdfTextExtractor = NativeModules.PdfTextExtractor
  ? NativeModules.PdfTextExtractor
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

export interface PageText {
  pageNumber: number;
  text: string;
}

export interface ExtractedTextResult {
  pageCount: number;
  pages: PageText[];
}

/**
 * Extract text from all pages of a PDF file
 * @param filePath Absolute path to the PDF file
 * @returns Promise with page count and text for each page
 */
export async function extractText(
  filePath: string,
): Promise<ExtractedTextResult> {
  if (Platform.OS !== 'android') {
    throw new Error('PDF text extraction is only supported on Android');
  }

  try {
    const result = await PdfTextExtractor.extractText(filePath);
    return result as ExtractedTextResult;
  } catch (error) {
    console.error('[PdfTextExtractor] extractText error:', error);
    throw error;
  }
}

/**
 * Get the total number of pages in a PDF
 * @param filePath Absolute path to the PDF file
 * @returns Promise with page count
 */
export async function getPageCount(filePath: string): Promise<number> {
  if (Platform.OS !== 'android') {
    throw new Error('PDF text extraction is only supported on Android');
  }

  try {
    const count = await PdfTextExtractor.getPageCount(filePath);
    return count as number;
  } catch (error) {
    console.error('[PdfTextExtractor] getPageCount error:', error);
    throw error;
  }
}

/**
 * Extract text from a specific page
 * @param filePath Absolute path to the PDF file
 * @param pageNumber Page number (1-indexed)
 * @returns Promise with text content of the page
 */
export async function extractPageText(
  filePath: string,
  pageNumber: number,
): Promise<string> {
  if (Platform.OS !== 'android') {
    throw new Error('PDF text extraction is only supported on Android');
  }

  try {
    const text = await PdfTextExtractor.extractPageText(filePath, pageNumber);
    return text as string;
  } catch (error) {
    console.error('[PdfTextExtractor] extractPageText error:', error);
    throw error;
  }
}
