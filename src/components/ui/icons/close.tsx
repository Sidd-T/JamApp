import type { SvgProps } from 'react-native-svg';
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

export function Close({ color = '#CCC', ...props }: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 18 17.94 6M18 18 6.06 6"
      />
    </Svg>
  );
}
