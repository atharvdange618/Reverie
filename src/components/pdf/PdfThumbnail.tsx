/**
 * PDF Thumbnail Component
 *
 * Renders a thumbnail of the first page of a PDF
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2;

interface PdfThumbnailProps {
  source: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const PdfThumbnail: React.FC<PdfThumbnailProps> = React.memo(
  ({
    source,
    width: thumbnailWidth = CARD_WIDTH,
    height: thumbnailHeight = 120,
    backgroundColor = '#E8E4DF',
    onLoad,
    onError,
  }) => {
    const [hasError, setHasError] = useState(false);

    const handleLoadComplete = useCallback(() => {
      onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(
      (error: any) => {
        console.warn('PDF Thumbnail Error:', error);
        setHasError(true);
        onError?.();
      },
      [onError],
    );

    const pdfSource = source.startsWith('file://')
      ? { uri: source, cache: true }
      : source.startsWith('/')
      ? { uri: `file://${source}`, cache: true }
      : { uri: source, cache: true };

    if (hasError) {
      return (
        <View
          style={[
            styles.fallback,
            {
              backgroundColor,
              width: thumbnailWidth,
              height: thumbnailHeight,
            },
          ]}
        />
      );
    }

    return (
      <View
        style={[
          styles.container,
          { width: thumbnailWidth, height: thumbnailHeight },
        ]}
      >
        <Pdf
          source={pdfSource}
          page={1}
          horizontal={false}
          enablePaging={false}
          onLoadComplete={handleLoadComplete}
          onError={handleError}
          enableDoubleTapZoom={false}
          spacing={0}
          fitPolicy={0}
          style={[
            styles.pdf,
            { width: thumbnailWidth, height: thumbnailHeight },
          ]}
          enableAntialiasing={true}
          enableAnnotationRendering={false}
          trustAllCerts={false}
          singlePage={true}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  pdf: {
    backgroundColor: 'transparent',
  },
  fallback: {
    opacity: 0.9,
  },
});

export default PdfThumbnail;
