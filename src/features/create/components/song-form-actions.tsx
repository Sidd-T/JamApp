import * as React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui';

export function SongFormActions({ isLoading, isEditing, onCancel, onSave }: any) {
  return (
    <View className="flex-row gap-2">
      <Button
        label="Cancel"
        onPress={onCancel}
        variant="outline"
        className="flex-1"
        disabled={isLoading}
      />
      <Button
        label={isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        onPress={onSave}
        variant="secondary"
        className="flex-1"
        disabled={isLoading}
      />
    </View>
  );
}
