import type { Section, Song } from '@/features/standards/standards';
import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { SongFormActions, SongFormChordKeyboardOverlay, SongFormFields, SongFormSectionsPreview } from './components';

type SongFormProps = {
  song?: Omit<Song, 'id'> | null;
  onSave: (song: Omit<Song, 'id'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

const DEFAULT_SECTION: Section = { Label: 'A', MainSegment: { Chords: '' } };
const DEFAULT_NEW_SONG: Omit<Song, 'id'> = { Title: '', Composer: 'user', Sections: [DEFAULT_SECTION] };

export function SongFormScreen({
  song,
  onSave,
  onCancel,
  isLoading = false,
}: SongFormProps) {
  const [formData, setFormData] = React.useState<Omit<Song, 'id'>>(
    () => song || DEFAULT_NEW_SONG,
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [activeSectionIndex, setActiveSectionIndex] = React.useState<number | null>(null);
  const [activeBarIndex, setActiveBarIndex] = React.useState(0);

  const isEditing = !!song;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const stringFields: (keyof Omit<Song, 'id'>)[] = [
      'Title',
      'Key',
      'Rhythm',
      'TimeSignature',
    ];

    stringFields.forEach((field) => {
      const value = formData[field];
      if (typeof value !== 'string' || !value.trim()) {
        newErrors[field] = `${field} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateField = (field: keyof Omit<Song, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = async () => {
    if (!validateForm())
      return;
    await onSave(formData);
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* SCROLLABLE CONTENT */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        className="flex-1 px-4 pt-4"
        contentContainerClassName="pb-6"
      >
        <SongFormFields
          formData={formData}
          errors={errors}
          isLoading={isLoading}
          onChange={updateField}
        />

        <SongFormSectionsPreview
          sections={formData.Sections}
          timeSignature={formData.TimeSignature}
          onSelectSection={(i: number) => {
            setActiveSectionIndex(i);
            setActiveBarIndex(0);
          }}
        />
      </ScrollView>

      {/* FIXED BOTTOM ACTIONS */}
      <View className="border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-800 dark:bg-black">
        <SongFormActions
          isLoading={isLoading}
          isEditing={isEditing}
          onCancel={onCancel}
          onSave={handleSave}
        />
      </View>

      {/* OVERLAY */}
      <SongFormChordKeyboardOverlay
        activeSectionIndex={activeSectionIndex}
        sections={formData.Sections}
        activeBarIndex={activeBarIndex}
        setActiveBarIndex={setActiveBarIndex}
        setActiveSectionIndex={setActiveSectionIndex}
        setFormData={setFormData}
      />
    </View>
  );
}
