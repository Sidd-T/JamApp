import { Redirect } from 'expo-router';

import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

export default function Index() {
  const [isFirstTime] = useIsFirstTime();

  return <Redirect href={isFirstTime ? '/onboarding' : '/standards'} />;
}
