import { Stack } from 'expo-router';

export default function StandardsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
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
