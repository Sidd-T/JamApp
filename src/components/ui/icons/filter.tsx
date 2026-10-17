import type { SvgProps } from 'react-native-svg';
import Svg, { Path } from 'react-native-svg';
import colors from '../colors';

export function Filter({ color, active = false, ...props }: SvgProps & { active?: boolean }) {
  const fillColor = active ? colors.primary[600] : (color || colors.neutral[500]);
  return (
    <Svg
      width={24}
      height={24}
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        d="M3 3h18v2.5L13 11v8l-2 1v-9L3 5.5V3z"
        fill={fillColor}
      />
    </Svg>
  );
}
