import * as WebBrowser from 'expo-web-browser';
import { Platform, Pressable } from 'react-native';
import { Link as LinkIcon } from '@/components/ui/icons';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { openLinkInBrowser } from '@/lib/utils';
import { getRealBookViewerUrl } from '../realbook';

type RealBookButtonProps = {
  title: string;
  keyName?: string;
  className?: string;
};

export function RealBookButton({ title, keyName = 'C', className }: RealBookButtonProps) {
  const theme = useThemeConfig();
  const url = getRealBookViewerUrl(title, keyName);

  if (!url)
    return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open Real Book page"
      hitSlop={8}
      onPress={(event) => {
        event.stopPropagation();
        if (Platform.OS === 'web')
          openLinkInBrowser(url);
        else
          void WebBrowser.openBrowserAsync(url);
      }}
      className={className}
    >
      <LinkIcon color={theme.colors.text} />
    </Pressable>
  );
}
