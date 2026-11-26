import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/shared/store/useAuthStore';

export default function Index() {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (role === 'teacher') {
    return <Redirect href="/(teacher)/attendance" />;
  }

  return <Redirect href="/(parent)/home" />;
}
