import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { propertyService } from '@/services/propertyService';
import Avatar from '@/components/ui/Avatar';
import SearchBar from '@/components/ui/SearchBar';
import PropertyCard from '@/components/ui/PropertyCard';
import Loader from '@/components/ui/Loader';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

const CATEGORIES = [
  { id: 'Room', title: 'Single Rooms', icon: 'bed-outline', desc: 'Private & Shared' },
  { id: 'PG', title: 'PG / Hostel', icon: 'business-outline', desc: 'Meals included' },
  { id: 'Flat', title: 'Full Flats', icon: 'key-outline', desc: '1, 2, 3 BHK' },
  { id: 'Shared', title: 'Shared Flats', icon: 'people-outline', desc: 'Split rent' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    try {
      const res = await propertyService.getAllProperties();
      setProperties(res.data || []);
    } catch (err) {
      console.error('Error fetching featured properties:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeaturedProperties();
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(tabs)/explore',
        params: { q: searchQuery.trim() },
      });
    }
  };

  const navigateCategory = (category) => {
    router.push({
      pathname: '/(tabs)/explore',
      params: { category },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] || 'User'} 👋
            </Text>
            <Text style={styles.subGreeting}>
              {isOwner
                ? 'Manage your properties & visit requests'
                : 'Find verified rental spaces near you'}
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Avatar source={user?.profileImage} name={user?.name} size={48} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={
            isOwner ? 'Search property code or listing...' : 'Search rooms, PGs, flats, areas...'
          }
          onFilterPress={() => router.push('/(tabs)/explore')}
          style={styles.searchBar}
        />

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Categories</Text>
        </View>

        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryCard}
              onPress={() => navigateCategory(cat.id)}
              activeOpacity={0.8}
            >
              <View style={styles.categoryIconBadge}>
                <Ionicons name={cat.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.categoryCardTitle}>{cat.title}</Text>
              <Text style={styles.categoryCardDesc}>{cat.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Listings Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Listings</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Property Cards */}
        {loading ? (
          <Loader fullScreen={false} message="Loading properties..." />
        ) : properties.length === 0 ? (
          <View style={styles.emptyFeatured}>
            <Ionicons name="home-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyFeaturedText}>No featured properties available</Text>
          </View>
        ) : (
          <View style={styles.propertiesList}>
            {properties.slice(0, 5).map((property) => (
              <PropertyCard
                key={property._id}
                image={
                  property.images && property.images.length > 0
                    ? property.images[0]
                    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
                }
                title={property.title}
                type={property.type}
                price={property.price}
                location={property.address}
                rating={property.rating || 4.5}
                onPress={() => router.push(`/property/${property._id}`)}
                style={styles.propertyCardItem}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.base,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
  },
  subGreeting: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  searchBar: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  seeAllText: {
    ...typography.labelLg,
    color: colors.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    ...shadows.sm,
  },
  categoryIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  categoryCardTitle: {
    ...typography.headlineMd,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  categoryCardDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptyFeatured: {
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: borderRadius.xxl,
  },
  emptyFeaturedText: {
    ...typography.bodyMd,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  propertiesList: {
    gap: spacing.base,
  },
  propertyCardItem: {
    marginBottom: spacing.xs,
  },
});
