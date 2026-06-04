import type { Song } from '@/features/standards/standards';
import * as React from 'react';
import { Text, View } from 'react-native';
import { Input } from '@/components/ui';

type SongFormFieldsProps = {
  formData: Omit<Song, 'id'>;
  errors: Record<string, string>;
  isLoading?: boolean;
  onChange: (field: keyof Omit<Song, 'id'>, value: string) => void;
};

export function SongFormFields({ formData, errors, isLoading = false, onChange }: SongFormFieldsProps) {
  return (
    <View className="mb-4 space-y-4">
      {/* Title */}
      <View>
        <Text className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Title</Text>
        <Input
          placeholder="Song title"
          value={formData.Title}
          onChangeText={t => onChange('Title', t)}
          editable={!isLoading}
          className={`rounded-md border px-3 py-2 text-black dark:text-white ${errors.Title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
        />
      </View>

      {/* Row with Key, Rhythm, TimeSignature */}
      <View className="flex-row gap-2">
        {/* Key */}
        <View className="flex-1">
          <Text className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Key</Text>
          <Input
            placeholder="C, F, Bm"
            value={formData.Key}
            onChangeText={t => onChange('Key', t)}
            editable={!isLoading}
            className={`h-10 rounded-md border px-3 py-2 text-black dark:text-white ${errors.Key ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          />
        </View>

        {/* Rhythm */}
        <View className="flex-1">
          <Text className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Rhythm</Text>
          <Input
            placeholder="Bossa, Swing"
            value={formData.Rhythm}
            onChangeText={t => onChange('Rhythm', t)}
            editable={!isLoading}
            className={`h-10 rounded-md border px-3 py-2 text-black dark:text-white ${errors.Rhythm ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          />
        </View>

        {/* Time Signature */}
        <View className="flex-1">
          <Text className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">Time Signature</Text>
          <Input
            placeholder="4/4"
            value={formData.TimeSignature}
            onChangeText={t => onChange('TimeSignature', t)}
            editable={!isLoading}
            className={`h-10 rounded-md border px-3 py-2 text-black dark:text-white ${errors.TimeSignature ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
          />
        </View>
      </View>
    </View>
  );
}
