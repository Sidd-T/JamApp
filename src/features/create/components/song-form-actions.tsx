import * as React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui';
import { translate } from '@/lib/i18n';

export function SongFormActions({ isLoading, isEditing, onCancel, onSave }: any) {
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
        disabled={isLoading}
      />
    </View>
  );
}
