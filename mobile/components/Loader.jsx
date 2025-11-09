import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import React from 'react';
import COLORS from '../constants/colors';

export default function Loader({ text, size = 'large', color }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator 
        size={size} 
        color={color || COLORS.primary} 
      />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

