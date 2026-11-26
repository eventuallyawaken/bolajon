import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import Svg, { Polyline, Line } from 'react-native-svg';
import { colors } from '../theme/tokens';

interface StatusToggleProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Modern iOS-style toggle matching User Image 2:
 * - Active (ON): Green background (#10b981) + White Checkmark (✓) on the left
 * - Inactive (OFF): Dark Slate background (#334155) + Dark Cross (✕) on the right
 */
export const StatusToggle: React.FC<StatusToggleProps> = ({
  checked,
  onToggle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={() => onToggle(!checked)}
      style={[
        styles.track,
        {
          backgroundColor: checked
            ? colors.toggleTrackActive
            : colors.toggleTrackInactive,
        },
      ]}
    >
      {/* Left Icon: White checkmark (✓) */}
      <View style={[styles.iconLeft, { opacity: checked ? 1 : 0 }]}>
        <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <Polyline
            points="20 6 9 17 4 12"
            stroke="#ffffff"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>

      {/* Right Icon: Dark cross (✕) */}
      <View style={[styles.iconRight, { opacity: !checked ? 1 : 0 }]}>
        <Svg width="11" height="11" viewBox="0 0 24 24" fill="none">
          <Line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
            stroke="#64748b"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
          <Line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            stroke="#64748b"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
        </Svg>
      </View>

      {/* Thumb Circle */}
      <View
        style={[
          styles.thumb,
          {
            left: checked ? 30 : 3,
            backgroundColor: checked
              ? colors.toggleThumbActive
              : colors.toggleThumbInactive,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 58,
    height: 30,
    borderRadius: 15,
    position: 'relative',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  iconLeft: {
    position: 'absolute',
    left: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    position: 'absolute',
    right: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});
