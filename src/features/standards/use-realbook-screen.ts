import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useImmersiveMode } from '@/lib/hooks/use-is-immersive';
import { getRealBookViewerUrl } from './realbook';

export function useRealBookScreen() {
  const params = useLocalSearchParams<{
    title?: string;
    originalKey?: string;
    currentKey?: string;
  }>();
  const title = String(params.title ?? '');
  const originalKey = String(params.originalKey ?? 'C');
  const currentKey = String(params.currentKey ?? originalKey);
  const router = useRouter();
  const isFullscreen = useImmersiveMode(state => state.isImmersive);
  const toggleFullscreen = useImmersiveMode(state => state.toggle);
  const showAppChrome = useImmersiveMode(state => state.show);
  const viewerUrl = getRealBookViewerUrl(title, originalKey, currentKey);

  useFocusEffect(
    useCallback(() => {
      showAppChrome();
      return showAppChrome;
    }, [showAppChrome]),
  );

  return {
    title,
    viewerUrl,
    isFullscreen,
    toggleFullscreen,
    close: () => router.back(),
  };
}
