import { createElement } from 'react';
import { View } from 'react-native';
import { FocusAwareStatusBar } from '@/components/ui';
import { RealBookScreenControls } from '@/features/standards/components/realbook-screen-controls';
import { useRealBookScreen } from '@/features/standards/use-realbook-screen';

export default function RealBookRoute() {
  const { title, viewerUrl, isFullscreen, toggleFullscreen, close } = useRealBookScreen();

  return (
    <View className="flex-1 bg-neutral-950">
      <FocusAwareStatusBar hidden={isFullscreen} />
      <RealBookScreenControls
        title={title}
        isFullscreen={isFullscreen}
        onClose={close}
        onToggleFullscreen={toggleFullscreen}
      />
      <View className="flex-1 overflow-hidden">
        {viewerUrl
          ? createElement('iframe', {
              title: `${title} Real Book page`,
              src: viewerUrl,
              allowFullScreen: true,
              style: { display: 'block', width: '100%', height: '100%', border: 0 },
            })
          : null}
      </View>
    </View>
  );
}
