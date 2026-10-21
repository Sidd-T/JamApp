import * as React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui';
import { translate } from '@/lib/i18n';

type SongFormActionsProps = {
  isLoading: boolean;
  isEditing: boolean;
  isSaveDisabled: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export function SongFormActions({ isLoading, isEditing, isSaveDisabled, onCancel, onSave }: SongFormActionsProps) {
  return (
    <View className="flex-row gap-2">
      <Button
        label={translate('create.cancel')}
        onPress={onCancel}
        variant="outline"
        className="flex-1"
        disabled={isLoading}
      />
      <Button
        label={isLoading ? translate('create.saving') : isEditing ? translate('create.update') : translate('create.save')}
        onPress={onSave}
        variant="secondary"
        className="flex-1"
        disabled={isLoading || isSaveDisabled}
      />
    </View>
  );
}
