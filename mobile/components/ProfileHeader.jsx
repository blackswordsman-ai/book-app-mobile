import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import { useAuthStore } from '../store/authStore';
import COLORS from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileHeader({ books = [] }) {
  const { user } = useAuthStore();
  
  // Check if profileImage is SVG and convert to PNG
  const profileImage = user?.profileImage || '';
  const isSvg = profileImage.includes('.svg') || profileImage.includes('/svg?');
  let imageUrl = profileImage;
  
  if (isSvg && profileImage.includes('dicebear.com')) {
    imageUrl = profileImage.replace('/svg?', '/png?').replace('.svg', '.png');
  }
  
  const hasProfileImage = imageUrl && imageUrl.trim() !== '';

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Profile Image */}
        <View style={styles.imageWrapper}>
          {hasProfileImage ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.profileImage}
              onError={(error) => console.log("Profile image load error:", error)}
            />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Text style={styles.placeholderText}>
                {user?.userName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.username}>{user?.userName || 'User'}</Text>
          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="book" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{books.length}</Text>
            <Text style={styles.statLabel}>Books</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={24} color="#f4b400" />
            <Text style={styles.statNumber}>{books.length}</Text>
            <Text style={styles.statLabel}>Recommendations</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageWrapper: {
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  placeholderText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
});