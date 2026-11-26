import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import type { TeacherGroup } from '../types';

interface GroupSelectorBarProps {
  groups: TeacherGroup[];
  selectedGroupId: string;
  onSelectGroup: (id: string) => void;
}

export const GroupSelectorBar: React.FC<GroupSelectorBarProps> = ({
  groups,
  selectedGroupId,
  onSelectGroup,
}) => {
  const c = useThemeColors();
  if (groups.length <= 1) return null;

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {groups.map((g) => {
          const active = g.id === selectedGroupId;
          return (
            <TouchableOpacity
              key={g.id}
              onPress={() => onSelectGroup(g.id)}
              activeOpacity={0.75}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? c.primary : c.surface,
                  borderColor: active ? c.primary : c.borderLight,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? '#FFFFFF' : c.textSecondary },
                ]}
              >
                {g.name} ({g.currentCount})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  list: {
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: typography.xs,
    fontWeight: '700',
  },
});
