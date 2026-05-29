import { Stack } from 'expo-router';

export default function CreateLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: 'white' },
        headerTitleStyle: { fontSize: 24 },

      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'My Songs',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="[option]"
        options={({ route }: any) => ({
          title: route.params?.option && decodeURIComponent(route.params.option) === 'edit' ? 'Edit Song' : 'Create Song',
          headerBackTitle: 'Back',
        })}
      />
    </Stack>
  );
}
