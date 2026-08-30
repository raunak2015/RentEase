import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { favoriteService } from '@/services/favoriteService';
import PropertyCard from '@/components/ui/PropertyCard';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setError(null);
    try {
      const res = await favoriteService.getFavorites();
      setFavorites(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load saved favorites');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handleToggleFavorite = async (propertyId) => {
    try {
      await favoriteService.removeFavorite(propertyId);
      setFavorites((prev) => prev.filter((p) => p._id !== propertyId));
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update favorites');
    }
  };

  if (loading) {
    return <Loader message="Loading your saved favorites..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchFavorites} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved Favorites</Text>
        <Text style={styles.subtitle}>
          {favorites.length} {favorites.length === 1 ? 'property' : 'properties'} saved
        </Text>
      </View>

      {/* Content */}
      {favorites.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="No Favorites Saved Yet"
          description="Browse rooms, PGs, and flats on RentEase and tap the heart icon to save listings for quick access."
          buttonTitle="Explore Properties"
          onButtonPress={() => router.push('/(tabs)/explore')}
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <PropertyCard
              image={
                item.images && item.images.length > 0
                  ? item.images[0]
                  : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
              }
              title={item.title}
              type={item.type}
              price={item.price}
              location={item.address}
              rating={item.rating || 4.5}
              isFavorite={true}
              onPress={() => router.push(`/property/${item._id}`)}
              onFavoritePress={() => handleToggleFavorite(item._id)}
              style={styles.cardItem}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.display,
    fontSize: 26,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textMuted,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
  },
  cardItem: {
    marginBottom: spacing.base,
  },
});
