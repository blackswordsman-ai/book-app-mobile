import { View, Text, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native'
import { useAuthStore } from '../../store/authStore';
import React, { useEffect, useState, useCallback } from 'react';
import styles from '../../assets/styles/home.styles';
import { API_BASE_URL } from '../../constants/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import Loader from '../../components/Loader';


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function Home() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBooks = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      await sleep(1000);
        if (refresh) {
        setRefreshing(true);
      } else if (pageNum > 1) {
        setLoading(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }
      
      const response = await fetch(`${API_BASE_URL}/api/books?page=${pageNum}&limit=10`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      const data = await response.json();
    //   console.log("Fetched books:", data);
      
      if (!response.ok) throw new Error(data.message);
      
      const newBooks = data.books;
      if (refresh || pageNum === 1) {
        setBooks(newBooks);
      } else {
        setBooks(prevBooks => [...prevBooks, ...newBooks]);
      }
      
      setPage(pageNum);
      setHasMore(newBooks.length === 10);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.log("Error in fetchBooks:", error);
      setLoading(false);
      setRefreshing(false);
      setHasMore(false);
      if (error.message === "Unauthorized") {
        router.push("/(auth)");
      }
    }
  }, [token, router]);

  useEffect(() => {
    fetchBooks(1, false);
  }, [fetchBooks]);

  const handleRefresh = () => {
    setPage(1);
    fetchBooks(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchBooks(page + 1, false);
    }
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

  const renderItem = ({ item }) => {
    // Check if profileImage is SVG or PNG/JPG
    const profileImage = item.user?.profileImage || '';
    const isSvg = profileImage.includes('.svg') || profileImage.includes('/svg?');
    
    // If SVG, convert to PNG format for React Native compatibility
    let imageUrl = profileImage;
    if (isSvg && profileImage.includes('dicebear.com')) {
      imageUrl = profileImage.replace('/svg?', '/png?').replace('.svg', '.png');
      console.log("Converted SVG to PNG:", imageUrl);
    }
    
    const hasProfileImage = imageUrl && imageUrl.trim() !== '';
    
    return (
      <View style={styles.bookCard}>
        {/* User Header */}
        <View style={styles.bookHeader}>
          <View style={styles.userInfo}>
            {hasProfileImage ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.avatar}
                onError={(error) => {
                  console.log("Image load error for:", imageUrl);
                }}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  {item.user?.userName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <Text style={styles.username}>{item.user?.userName || 'Unknown User'}</Text>
          </View>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.textSecondary} />
        </View>

        {/* Book Image */}
        <View style={styles.bookImageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.bookImage}
            resizeMode="cover"
          />
        </View>

        {/* Book Details */}
        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          
          {/* Rating */}
          <View style={styles.ratingContainer}>
            {renderStars(item.rating)}
          </View>

          {/* Caption */}
          <Text style={styles.caption} numberOfLines={3}>
            {item.caption}
          </Text>

          {/* Date */}
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="book-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.emptyText}>No Books Yet</Text>
        <Text style={styles.emptySubtext}>
          Start by creating your first book in the Create tab!
        </Text>
      </View>
    );
  };

  if (loading && page === 1) {
    return <Loader text="Loading books..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}