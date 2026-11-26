import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../theme/useThemeStore';

interface AvatarProps {
  name: string;
  size?: number;
  bg?: string;
  color?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 40,
  bg,
  color,
}) => {
  const c = useThemeColors();
  const resolvedBg = bg || c.primarySoft;
  const resolvedColor = color || c.primary;

  const initials = name
    ? name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'B';

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: resolvedBg,
          borderWidth: 1,
          borderColor: c.primaryBorder,
        },
      ]}
    >
      <Text style={[styles.text, { color: resolvedColor, fontSize: size * 0.36 }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
  },
});
