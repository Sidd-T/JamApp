import * as React from 'react';

import { Image } from '@/components/ui/image';

export function Cover() {
  return (
    <Image
      source={require('../../../../assets/open_chords_illustration.png')}
      contentFit="contain"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
