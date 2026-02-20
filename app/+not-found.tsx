import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '找不到頁面' }} />
      <View className="flex-1 items-center justify-center bg-background-primary p-5">
        <Text className="text-2xl font-bold text-text-primary mb-4">找不到此頁面</Text>
        <Link href="/" className="text-primary underline">
          <Text className="text-primary">返回首頁</Text>
        </Link>
      </View>
    </>
  );
}
