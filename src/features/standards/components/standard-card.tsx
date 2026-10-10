import type { Song } from '../standards';
import { Pressable, View } from 'react-native';
import { Button, Text } from '@/components/ui';
import colors from '@/components/ui/colors';
import { Link as LinkIcon, Support } from '@/components/ui/icons';
import { useThemeConfig } from '@/components/ui/use-theme-config';
import { translate } from '@/lib/i18n';
import { openLinkInBrowser } from '@/lib/utils';

type StandardCardProps = {
  standard: Song;
  onPress: () => void;
  onAdd?: () => void;
  added?: boolean;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
};

export function StandardCard({
  standard,
  onPress,
  onAdd,
  added = false,
  isFavourite = false,
  onToggleFavourite,
}: StandardCardProps) {
  const theme = useThemeConfig();
  const realBookPage = standard.RealBookPage;
  const favouriteColor = isFavourite ? colors.primary[600] : colors.neutral[500];
  const favouriteFill = isFavourite ? colors.primary[600] : 'none';
  return (
    <Pressable onPress={onPress} className="flex-1">
      <View className={`mb-1 rounded-md border bg-white p-2.5 dark:bg-neutral-900 ${
        added
          ? 'border-primary-500 dark:border-primary-400'
          : 'border-neutral-200 dark:border-neutral-800'
      }`}
      >
        <View className="flex-row items-stretch gap-3">
          <View className="min-w-0 flex-1">
            <View className="mb-0.5 flex-row items-center">
              <View className="shrink border-b border-primary-700">
                <Text className="text-base font-semibold text-neutral-900 dark:text-white">
                  {standard.Title}
                </Text>
              </View>
              {realBookPage && (
                <Pressable
                  accessibilityLabel="Open Real Book page"
                  hitSlop={8}
                  onPress={(e) => {
                    e.stopPropagation();
                    openLinkInBrowser(
                      `https://archive.org/details/The_Real_Book_Sixth_Edition_volume_1/page/n${realBookPage + 1}/mode/1up`,
                    );
                  }}
                  className="ml-2"
                >
                  <LinkIcon color={theme.colors.text} />
                </Pressable>
              )}
            </View>
            <Text className="mb-1.5 text-sm text-neutral-600 dark:text-neutral-400">
              {standard.Composer}
            </Text>
            <View className="flex-row flex-wrap gap-1.5">
              {standard.Key && (
                <View className="rounded-sm bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
                  <Text className="text-xs text-neutral-700 dark:text-neutral-300">{standard.Key}</Text>
                </View>
              )}
              {standard.TimeSignature && (
                <View className="rounded-sm bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
                  <Text className="text-xs text-neutral-700 dark:text-neutral-300">{standard.TimeSignature}</Text>
                </View>
              )}
              {standard.Rhythm && (
                <View className="rounded-sm bg-neutral-100 px-1.5 py-0.5 dark:bg-neutral-800">
                  <Text className="text-xs text-neutral-700 dark:text-neutral-300">{standard.Rhythm}</Text>
                </View>
              )}
            </View>
          </View>

          <View className="flex-col items-end justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              hitSlop={8}
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavourite?.();
              }}
            >
              <Support color={favouriteColor} fill={favouriteFill} />
            </Pressable>

            {onAdd && (
              <Button
                label={added ? '✓' : translate('standards.card.addToJam')}
                variant={added ? 'secondary' : 'outline'}
                size="sm"
                className="my-0 h-8 w-28 shrink-0 rounded-md px-2"
                textClassName="text-xs"
                onPress={(e) => {
                  e.stopPropagation();
                  onAdd?.();
                }}
              />
            )}
          </View>

        </View>
      </View>
    </Pressable>
  );
}
