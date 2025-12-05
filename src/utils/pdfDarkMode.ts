/**
 * PDF Dark Mode Native Module
 *
 * Bridges to native Android code to apply color inversion filters
 * for true PDF dark mode support.
 */

import { NativeModules, Platform, findNodeHandle } from 'react-native';

interface PdfDarkModeInterface {
  enableDarkMode(viewTag: number, enable: boolean): Promise<boolean>;
}

const LINKING_ERROR =
  `The package 'PdfDarkMode' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const PdfDarkMode: PdfDarkModeInterface = NativeModules.PdfDarkMode
  ? NativeModules.PdfDarkMode
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

/**
 * Apply color inversion to a PDF view for dark mode
 * @param viewRef - Reference to the view component
 * @param enable - Whether to enable or disable dark mode
 */
export async function setPdfDarkMode(
  viewRef: any,
  enable: boolean,
): Promise<boolean> {
  if (Platform.OS !== 'android') {
    console.warn('PDF dark mode is only supported on Android');
    return false;
  }

  try {
    const viewTag = findNodeHandle(viewRef);

    if (!viewTag) {
      console.warn('Could not find view tag for PDF dark mode');
      return false;
    }

    const result = await PdfDarkMode.enableDarkMode(viewTag, enable);
    return result;
  } catch (error) {
    console.error('Failed to set PDF dark mode:', error);
    return false;
  }
}

export default PdfDarkMode;
