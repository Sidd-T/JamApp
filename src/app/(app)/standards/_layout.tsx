import { Stack } from 'expo-router';

export default function StandardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'neutral-100' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Jazz Standards',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={({ route }: any) => ({
          title: route.params?.id ? decodeURIComponent(route.params.id) : 'Standard',
          headerBackTitle: 'Back',
        })}
      />
    </Stack>
  );
}
