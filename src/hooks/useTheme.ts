import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme, Theme } from '@/src/theme';

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}
