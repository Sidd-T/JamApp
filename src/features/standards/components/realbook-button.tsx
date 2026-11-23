import type { ExternalPathString } from 'expo-router';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui';
import { MusicFile } from '@/components/ui/icons';
import { getRealBookViewerUrl } from '../realbook';

type RealBookButtonProps = {
  title: string;
  originalKey?: string;
  currentKey?: string;
  className?: string;
};

export function RealBookButton({ title, originalKey = 'C', currentKey = originalKey, className }: RealBookButtonProps) {
  const router = useRouter();
  const viewerUrl = getRealBookViewerUrl(title, originalKey, currentKey);
  const routePath = title.trim() ? '/standards/realbook' as ExternalPathString : undefined;

  if (!routePath || !viewerUrl)
    return null;

  return (
    <Button
      accessibilityRole="button"
      accessibilityLabel="Open Real Book page"
      variant="secondary"
      size="icon"
      hitSlop={8}
      className={`my-0 size-7 ${className ?? ''}`}
      onPress={(event) => {
        event.stopPropagation();
        router.push({
          pathname: routePath,
          params: { title, originalKey, currentKey },
        });
      }}
    >
      <MusicFile color="#fff" width={20} height={20} />
    </Button>
  );
}
