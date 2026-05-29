import type { Section, Song } from '@/features/standards/standards';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Button, Input, Text } from '@/components/ui';
import { SectionDisplay } from '@/features/standards/components';
import { generateListKey } from '@/lib/utils';
import { SectionChordKeyboard } from './section-chord-keyboard';

type SongFormProps = {
  song?: Omit<Song, 'id'> | null;
  onSave: (song: Omit<Song, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

const DEFAULT_SECTION: Section = {
  Label: 'A',
  MainSegment: {
    Chords: '',
  },
};

const DEFAULT_NEW_SONG: Omit<Song, 'id'> = {
  Title: 'New Song',
  Composer: 'user',
  Key: '',
  Rhythm: 'Medium Swing',
  TimeSignature: '4/4',
  Sections: [DEFAULT_SECTION],
};

export function SongForm({
  song,
  onSave,
  onCancel,
  isLoading = false,
}: SongFormProps) {
  const [formData, setFormData] = React.useState<Omit<Song, 'id'>>(
    () => song || DEFAULT_NEW_SONG,
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const isEditing = !!song;

  const [activeSectionIndex, setActiveSectionIndex]
    = React.useState<number | null>(null);

  const [activeBarIndex, setActiveBarIndex] = React.useState(0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.Title?.trim()) {
      newErrors.Title = 'Title is required';
    }

    if (!formData.Key?.trim()) {
      newErrors.Key = 'Key is required';
    }

    if (!formData.Rhythm?.trim()) {
      newErrors.Rhythm = 'Rhythm is required';
    }

    if (!formData.TimeSignature?.trim()) {
      newErrors.TimeSignature = 'Time Signature is required';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    }
    catch (error) {
      console.error('Error saving song:', error);
    }
  };

  const updateField = (
    field: keyof Omit<Song, 'id'>,
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: activeSectionIndex !== null ? 320 : 16,
        }}
      >
        {/* Form Fields */}
        <View className="mb-6 gap-4">
          {/* Title */}
          <View>
            <Text className="mb-1 text-sm font-semibold">
              Title
            </Text>

            <Input
              placeholder="Song title"
              value={formData.Title}
              onChangeText={text => updateField('Title', text)}
              editable={!isLoading}
              className={errors.Title ? 'border-red-500' : ''}
            />

            {errors.Title && (
              <Text className="mt-1 text-xs text-red-500">
                {errors.Title}
              </Text>
            )}
          </View>

          {/* Key and Rhythm Row */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold">
                Key
              </Text>

              <Input
                placeholder="e.g., C, F, Bmin"
                value={formData.Key}
                onChangeText={text => updateField('Key', text)}
                editable={!isLoading}
                className={errors.Key ? 'border-red-500' : ''}
              />

              {errors.Key && (
                <Text className="mt-1 text-xs text-red-500">
                  {errors.Key}
                </Text>
              )}
            </View>

            <View className="flex-1">
              <Text className="mb-1 text-sm font-semibold">
                Rhythm
              </Text>

              <Input
                placeholder="e.g., Swing, Bossa Nova"
                value={formData.Rhythm}
                onChangeText={text => updateField('Rhythm', text)}
                editable={!isLoading}
                className={errors.Rhythm ? 'border-red-500' : ''}
              />

              {errors.Rhythm && (
                <Text className="mt-1 text-xs text-red-500">
                  {errors.Rhythm}
                </Text>
              )}
            </View>
          </View>

          {/* Time Signature */}
          <View>
            <Text className="mb-1 text-sm font-semibold">
              Time Signature
            </Text>

            <Input
              placeholder="e.g., 4/4, 3/4"
              value={formData.TimeSignature}
              onChangeText={text => updateField('TimeSignature', text)}
              editable={!isLoading}
              className={
                errors.TimeSignature ? 'border-red-500' : ''
              }
            />

            {errors.TimeSignature && (
              <Text className="mt-1 text-xs text-red-500">
                {errors.TimeSignature}
              </Text>
            )}
          </View>
        </View>

        {/* Section Preview */}
        <View className="mb-6 border-t border-gray-200 py-4 dark:border-gray-800">
          <Text className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-400">
            Section (tap to edit chords)
          </Text>

          <View className="rounded-sm bg-gray-50 p-3 dark:bg-gray-900">
            {formData.Sections.map((section, index) => (
              <Pressable
                key={generateListKey(`section-preview-${section.Label || ''}`, index)}
                onPress={() => {
                  setActiveSectionIndex(index);
                  setActiveBarIndex(0);
                }}
              >
                <SectionDisplay
                  section={section}
                  index={index}
                  timeSignature={formData.TimeSignature}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="my-4 flex-row gap-2">
          <Button
            label="Cancel"
            onPress={onCancel}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          />

          <Button
            label={
              isLoading
                ? 'Saving...'
                : isEditing
                  ? 'Update'
                  : 'Create'
            }
            onPress={handleSave}
            className="flex-1"
            disabled={isLoading}
          />
        </View>
      </ScrollView>

      {/* Floating Chord Keyboard Overlay */}
      {activeSectionIndex !== null && (
        <View
          className="absolute inset-x-0 bottom-0 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-black"
        >
          <SectionChordKeyboard
            bars={(formData.Sections[activeSectionIndex]?.MainSegment?.Chords || '')
              .split('|')
              .map(b => b.trim())
              .filter(Boolean)}
            barIndex={activeBarIndex}
            onBarChange={(barIndex, chordToken) => {
              if (activeSectionIndex === null) {
                return;
              }

              const section
                = formData.Sections[activeSectionIndex];

              const currentBars = (
                section.MainSegment?.Chords || ''
              )
                .split('|')
                .map(b => b.trim())
                .filter(Boolean);

              while (currentBars.length <= barIndex) {
                currentBars.push('');
              }

              currentBars[barIndex] = chordToken;

              setFormData((prev) => {
                const nextSections = prev.Sections.map(
                  (s, i) => {
                    if (i !== activeSectionIndex) {
                      return s;
                    }

                    return {
                      ...s,
                      MainSegment: {
                        ...(s.MainSegment || {
                          Chords: '',
                        }),
                        Chords: currentBars.join('|'),
                      },
                    };
                  },
                );

                return {
                  ...prev,
                  Sections: nextSections,
                };
              });
            }}
            onPrevBar={() =>
              setActiveBarIndex(i => Math.max(0, i - 1))}
            onNextBar={() =>
              setActiveBarIndex(i => i + 1)}
            onClose={() => setActiveSectionIndex(null)}
          />
        </View>
      )}
    </View>
  );
}
