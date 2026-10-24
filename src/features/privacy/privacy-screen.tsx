import { Linking } from 'react-native';

import { FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';

export function PrivacyScreen() {
  const openContactEmail = () => {
    void Linking.openURL('mailto:sidd.topiwala02@gmail.com').catch((error) => {
      console.error(error);
    });
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FocusAwareStatusBar />
      <ScrollView className="flex-1">
        <View className="gap-4 p-4">
          <Text>{translate('privacy.intro')}</Text>

          <View className="gap-2">
            <Text className="text-lg font-semibold">
              {translate('privacy.informationTitle')}
            </Text>
            <Text>{translate('privacy.information')}</Text>
          </View>

          <View className="gap-2">
            <Text className="text-lg font-semibold">
              {translate('privacy.contactTitle')}
            </Text>
            <Text>
              {translate('privacy.contactPrompt')}
              {' '}
              <Text
                className="text-primary-300 underline dark:text-primary-200"
                onPress={openContactEmail}
              >
                {translate('privacy.contactLink')}
              </Text>
              .
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
