import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import type { ChildInfo } from '../types';

interface ChildSelectorPillProps {
  childrenList: ChildInfo[];
  selectedChildId: string;
  onSelectChild: (id: string) => void;
}

export const ChildSelectorPill: React.FC<ChildSelectorPillProps> = ({
  childrenList,
  selectedChildId,
  onSelectChild,
}) => {
  const c = useThemeColors();
  if (childrenList.length <= 1) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollList}>
        {childrenList.map((child) => {
          const isSelected = child.id === selectedChildId;
          return (
            <TouchableOpacity
              key={child.id}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? c.primarySoft : c.surface,
                  borderColor: isSelected ? c.primary : c.borderLight,
                },
              ]}
              onPress={() => onSelectChild(child.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: isSelected ? c.primary : c.borderDark },
                ]}
              />
              <Text
                style={[
                  styles.name,
                  {
                    color: isSelected ? c.primaryDark : c.textSecondary,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
              >
                {child.fullName}
              </Text>
              <Text style={[styles.group, { color: isSelected ? c.primary : c.textMuted }]}>
                {child.groupName.split('(')[0].trim()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  scrollList: {
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    marginRight: 8,
  },
  name: {
    fontSize: typography.sm,
    marginRight: 6,
  },
  group: {
    fontSize: typography.xs,
  },
});
