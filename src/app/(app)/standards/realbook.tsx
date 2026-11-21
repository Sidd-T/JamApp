import { Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { FocusAwareStatusBar } from '@/components/ui';
import { RealBookScreenControls } from '@/features/standards/components/realbook-screen-controls';
import { useRealBookScreen } from '@/features/standards/use-realbook-screen';

export default function RealBookRoute() {
  const { title, viewerUrl, isFullscreen, toggleFullscreen, close } = useRealBookScreen();

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FocusAwareStatusBar hidden={isFullscreen} />
      <RealBookScreenControls
        title={title}
        isFullscreen={isFullscreen}
        onClose={close}
        onToggleFullscreen={toggleFullscreen}
      />
      {viewerUrl
        ? (
            <WebView
              source={{ uri: viewerUrl }}
              style={{ flex: 1 }}
            />
          )
        : (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center text-base text-neutral-600 dark:text-neutral-400">
                Real Book page unavailable
              </Text>
            </View>
          )}
    </View>
  );
}
