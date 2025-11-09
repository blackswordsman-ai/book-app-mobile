import { TouchableOpacity, Text, Alert } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import styles from '../assets/styles/profile.styles';

export default function LogoutButton() {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              console.log('Logging out...');
              await logout();
              console.log('Logout completed, navigating to auth...');
              router.replace('/(auth)');
            } catch (error) {
              console.log('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={handleLogout}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      <Ionicons name="log-out-outline" size={20} color="#fff" />
      <Text style={styles.logoutButtonText}>
        {isLoading ? 'Logging out...' : 'Logout'}
      </Text>
    </TouchableOpacity>
  );
}