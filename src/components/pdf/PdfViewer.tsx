/**
 * PDF Viewer Component
 *
 * Renders PDF documents with:
 * - Swipe navigation between pages
 * - Double-tap to zoom
 * - Pinch to zoom
 * - Page change callbacks
 */

import React, { useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Pdf, { PdfRef } from 'react-native-pdf';

const { width, height } = Dimensions.get('window');

interface PdfViewerProps {
  source: string;
  page: number;
  onPageChange: (page: number, totalPages: number) => void;
  onLoadComplete?: (totalPages: number) => void;
  onError?: (error: any) => void;
  readingMode?: 'paged' | 'scroll';
  backgroundColor?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = React.memo(
  ({
    source,
    page: _page,
    onPageChange,
    onLoadComplete,
    onError,
    readingMode = 'paged',
    backgroundColor = '#FFFFFF',
  }) => {
    const pdfRef = useRef<PdfRef>(null);
    const initialPage = useRef(_page);

    const handleLoadComplete = useCallback(
      (numberOfPages: number) => {
        if (
          pdfRef.current &&
          initialPage.current > 1 &&
          initialPage.current <= numberOfPages
        ) {
          pdfRef.current.setPage(initialPage.current);
        }

        onLoadComplete?.(numberOfPages);
      },
      [onLoadComplete],
    );

    const handlePageChanged = useCallback(
      (currentPage: number, numberOfPages: number) => {
        onPageChange(currentPage, numberOfPages);
      },
      [onPageChange],
    );

    const handleError = useCallback(
      (error: any) => {
        console.error('PDF Error:', error);
        onError?.(error);
      },
      [onError],
    );

    const pdfSource = useMemo(() => {
      if (source.startsWith('file://')) {
        return { uri: source, cache: true };
      } else if (source.startsWith('/')) {
        return { uri: `file://${source}`, cache: true };
      }
      return { uri: source, cache: true };
    }, [source]);

    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Pdf
          ref={pdfRef}
          source={pdfSource}
          horizontal={readingMode === 'paged'}
          enablePaging={readingMode === 'paged'}
          onLoadComplete={handleLoadComplete}
          onPageChanged={handlePageChanged}
          onError={handleError}
          enableDoubleTapZoom={true}
          minScale={1.0}
          maxScale={4.0}
          spacing={0}
          fitPolicy={0}
          style={[styles.pdf, backgroundColor ? { backgroundColor } : {}]}
          enableAntialiasing={true}
          enableAnnotationRendering={false}
          trustAllCerts={false}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width,
    height,
  },
});

export default PdfViewer;
