import type { ActiveTarget, Section, Song } from '@/features/standards/standards';
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

function nextSectionLabel(sections: Section[]): string {
  // A, B, C, ... Z, AA, AB, ... — simple increment off the count of
  // existing sections. Good enough until someone needs 27 sections.
  let num = sections.length;
  let label = '';
  do {
    label = String.fromCharCode(65 + (num % 26)) + label;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);
  return label;
}

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
  const [activeTarget, setActiveTarget] = React.useState<ActiveTarget>(null);

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

  const handleRepeatChange = (sectionIndex: number, repeat: number) => {
    setFormData(prev => ({
      ...prev,
      Sections: prev.Sections.map((s, i) => (i === sectionIndex ? { ...s, Repeat: repeat } : s)),
    }));
  };

  const handleModeChange = (sectionIndex: number, mode: 'repeat' | 'endings') => {
    setFormData(prev => ({
      ...prev,
      Sections: prev.Sections.map((s, i) => {
        if (i !== sectionIndex)
          return s;
        if (mode === 'endings') {
          // Switching into endings mode clears Repeat. Endings starts
          // empty — the user dials it up via the same stepper.
          return { ...s, Repeat: undefined, Endings: [] };
        }
        // Switching into repeat mode clears Endings.
        return { ...s, Endings: undefined, Repeat: 1 };
      }),
    }));

    // Leaving endings mode (or re-entering repeat mode) invalidates any
    // open keyboard pointed at an ending in this section.
    setActiveTarget(prev =>
      prev && prev.sectionIndex === sectionIndex && prev.segment.segment === 'ending'
        ? null
        : prev);
  };

  const handleEndingCountChange = (sectionIndex: number, count: number) => {
    setFormData(prev => ({
      ...prev,
      Sections: prev.Sections.map((s, i) => {
        if (i !== sectionIndex)
          return s;
        const current = s.Endings ?? [];
        if (count <= current.length) {
          return { ...s, Endings: current.slice(0, count) };
        }
        const additions = Array.from({ length: count - current.length }, () => ({ Chords: '' }));
        return { ...s, Endings: [...current, ...additions] };
      }),
    }));

    // If the keyboard is open on an ending that just got removed by a
    // decrement, close it rather than point at a stale index.
    setActiveTarget(prev =>
      prev
      && prev.sectionIndex === sectionIndex
      && prev.segment.segment === 'ending'
      && prev.segment.endingIndex >= count
        ? null
        : prev);
  };

  const handleDeleteSection = (sectionIndex: number) => {
    setFormData((prev) => {
      if (prev.Sections.length <= 1)
        return prev; // always keep at least one section
      return {
        ...prev,
        Sections: prev.Sections.filter((_, i) => i !== sectionIndex),
      };
    });

    // Close the keyboard if it was pointed at the section being deleted,
    // or shift its sectionIndex down if it was pointed at a later one.
    setActiveTarget((prev) => {
      if (!prev)
        return prev;
      if (formData.Sections.length <= 1)
        return prev;
      if (prev.sectionIndex === sectionIndex)
        return null;
      if (prev.sectionIndex > sectionIndex) {
        return { ...prev, sectionIndex: prev.sectionIndex - 1 };
      }
      return prev;
    });
  };

  const handleAddSection = () => {
    const newSection: Section = {
      Label: nextSectionLabel(formData.Sections),
      MainSegment: { Chords: '' },
    };
    const insertAt = formData.Sections.length;

    setFormData(prev => ({
      ...prev,
      Sections: [...prev.Sections, newSection],
    }));

    setActiveTarget({ sectionIndex: insertAt, segment: { segment: 'main' }, localIndex: 0 });
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
          onSelectBar={(sectionIndex, segment, localIndex) => {
            setActiveTarget({ sectionIndex, segment, localIndex });
          }}
          onRepeatChange={handleRepeatChange}
          onModeChange={handleModeChange}
          onEndingCountChange={handleEndingCountChange}
          onDeleteSection={handleDeleteSection}
          onAddSection={handleAddSection}
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
        activeTarget={activeTarget}
        sections={formData.Sections}
        setActiveTarget={setActiveTarget}
        setFormData={setFormData}
      />
    </View>
  );
}
