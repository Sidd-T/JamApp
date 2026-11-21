import type { ExternalPathString } from 'expo-router';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { MusicFile } from '@/components/ui/icons';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { getRealBookViewerUrl } from '../realbook';

type RealBookButtonProps = {
  title: string;
  originalKey?: string;
  currentKey?: string;
  className?: string;
};

export function RealBookButton({ title, originalKey = 'C', currentKey = originalKey, className }: RealBookButtonProps) {
  const router = useRouter();
  const theme = useThemeConfig();
  const viewerUrl = getRealBookViewerUrl(title, originalKey, currentKey);
  const routePath = title.trim() ? '/standards/realbook' as ExternalPathString : undefined;

  if (!routePath || !viewerUrl)
    return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open Real Book page"
      hitSlop={8}
      onPress={(event) => {
        event.stopPropagation();
        router.push({
          pathname: routePath,
          params: { title, originalKey, currentKey },
        });
      }}
      className={className}
    >
      <MusicFile color={theme.colors.text} />
    </Pressable>
  );
}
