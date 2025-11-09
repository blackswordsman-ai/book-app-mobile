import { View, Text, Alert, FlatList, Image, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { API_BASE_URL } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';
import ProfileHeader from '../../components/ProfileHeader';
import LogoutButton from '../../components/LogoutButton';
import Loader from '../../components/Loader';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';

export default function Profile() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { token } = useAuthStore();

  const fetchData = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await fetch(`${API_BASE_URL}/api/books/user`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await response.json();
      console.log("User books:", data);
      setBooks(data);
    } catch (error) {
      console.log("Error in fetchData:", error);
      Alert.alert("Error", error.message || "Failed to fetch books");
    } finally {
      if (refresh) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleDeleteBook = (bookId) => {
    Alert.alert(
      "Delete Book",
      "Are you sure you want to delete this book?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
                method: "DELETE",
                headers: {
                  "Authorization": `Bearer ${token}`
                }
              });
              
              if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to delete book");
              }
              
              Alert.alert("Success", "Book deleted successfully");
              fetchData(); // Refresh the list
            } catch (error) {
              console.log("Error deleting book:", error);
              Alert.alert("Error", error.message || "Failed to delete book");
            }
          }
        }
      ]
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  const renderBookItem = ({ item }) => {
    return (
      <View style={styles.bookCard}>
        <Image source={{ uri: item.image }} style={styles.bookImage} resizeMode="cover" />
        
        <View style={styles.bookInfo}>
          <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.ratingContainer}>
            {renderStars(item.rating)}
          </View>
          
          <Text style={styles.bookCaption} numberOfLines={2}>
            {item.caption}
          </Text>
          
          <Text style={styles.bookDate}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteBook(item._id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff3b30" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="book-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>No Books Yet</Text>
        <Text style={styles.emptySubtext}>
          Start creating your book recommendations in the Create tab!
        </Text>
      </View>
    );
  };

  if (isLoading && books.length === 0) {
    return <Loader text="Loading your books..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={
          <>
            <ProfileHeader books={books} />
            <LogoutButton />
            <View style={styles.sectionHeader}>
              <Ionicons name="library" size={24} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>My Recommendations</Text>
              <Text style={styles.bookCount}>{books.length}</Text>
            </View>
          </>
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },
  bookCount: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookImage: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bookCaption: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 18,
    marginBottom: 4,
  },
  bookDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});