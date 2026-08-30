import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { propertyService } from '@/services/propertyService';
import { readFromClipboard } from '@/utils/contacts';
import SearchBar from '@/components/ui/SearchBar';
import PropertyCard from '@/components/ui/PropertyCard';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius } from '@/constants/spacing';

const CATEGORIES = ['All', 'Room', 'PG', 'Flat', 'Shared'];
const ALL_FACILITIES = [
  'WiFi',
  'Parking',
  'AC',
  'Food',
  'Furnished',
  'Laundry',
  'Security',
];

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [searchQuery, setSearchQuery] = useState(params.q || '');
  const [selectedCategory, setSelectedCategory] = useState(params.category || 'All');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter Modal state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price_low' | 'price_high' | 'rating'

  useEffect(() => {
    fetchProperties();
  }, [selectedCategory, searchQuery, sortBy]);

  const fetchProperties = async () => {
    setError(null);
    try {
      const queryParams = {};

      if (selectedCategory !== 'All') {
        queryParams.type = selectedCategory;
      }

      if (searchQuery.trim()) {
        queryParams.search = searchQuery.trim();
      }

      if (minPrice.trim()) {
        queryParams.minPrice = minPrice.trim();
      }

      if (maxPrice.trim()) {
        queryParams.maxPrice = maxPrice.trim();
      }

      const res = await propertyService.getAllProperties(queryParams);
      let data = res.data || [];

      // Filter client-side by facilities if selected
      if (selectedFacilities.length > 0) {
        data = data.filter((item) =>
          selectedFacilities.every((fac) => item.facilities?.includes(fac))
        );
      }

      // Sort client-side
      if (sortBy === 'price_low') {
        data.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_high') {
        data.sort((a, b) => b.price - a.price);
      } else if (sortBy === 'rating') {
        data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else {
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setProperties(data);
    } catch (err) {
      setError(err.message || 'Failed to search properties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };

  const toggleFacilityFilter = (facility) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(selectedFacilities.filter((f) => f !== facility));
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedFacilities([]);
    setSortBy('newest');
    setShowFilterModal(false);
    fetchProperties();
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    setLoading(true);
    fetchProperties();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore Rentals</Text>
        <Text style={styles.subtitle}>Find verified rooms, PGs, flats & shares</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          placeholder="Search by title, location, landmark..."
          onFilterPress={() => setShowFilterModal(true)}
        />
        <TouchableOpacity
          style={styles.pasteCodeBtn}
          onPress={async () => {
            const text = await readFromClipboard();
            if (text && text.trim().length > 0) {
              setSearchQuery(text.trim());
            }
          }}
        >
          <Ionicons name="clipboard-outline" size={15} color={colors.primary} />
          <Text style={styles.pasteCodeText}>Paste Property Code</Text>
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="swap-vertical" size={16} color={colors.primary} />
          <Text style={styles.sortButtonText}>
            {sortBy === 'price_low'
              ? 'Price: Low'
              : sortBy === 'price_high'
              ? 'Price: High'
              : sortBy === 'rating'
              ? 'Top Rated'
              : 'Newest'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Property List */}
      {loading ? (
        <Loader message="Searching properties..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProperties} />
      ) : properties.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No Rentals Found"
          description="We couldn't find any listings matching your search or filters. Try resetting your search parameters."
          buttonTitle="Reset Search"
          onButtonPress={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            resetFilters();
          }}
        />
      ) : (
        <FlatList
          data={properties}
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
              onPress={() => router.push(`/property/${item._id}`)}
              style={styles.cardItem}
            />
          )}
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Sort By Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Sort Listings</Text>
                <View style={styles.sortOptionsGroup}>
                  {[
                    { id: 'newest', label: 'Newest First' },
                    { id: 'price_low', label: 'Price: Low to High' },
                    { id: 'price_high', label: 'Price: High to Low' },
                    { id: 'rating', label: 'Highest Rated' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.sortOptionChip,
                        sortBy === option.id && styles.sortOptionChipActive,
                      ]}
                      onPress={() => setSortBy(option.id)}
                    >
                      <Text
                        style={[
                          styles.sortOptionText,
                          sortBy === option.id && styles.sortOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Range Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Price Range (₹ / Month)</Text>
                <View style={styles.priceRow}>
                  <View style={styles.priceInputWrapper}>
                    <Input
                      label="Min Rent"
                      placeholder="e.g. 5000"
                      value={minPrice}
                      onChangeText={setMinPrice}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.priceInputWrapper}>
                    <Input
                      label="Max Rent"
                      placeholder="e.g. 25000"
                      value={maxPrice}
                      onChangeText={setMaxPrice}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Facilities Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterLabel}>Required Amenities</Text>
                <View style={styles.facilityWrap}>
                  {ALL_FACILITIES.map((facility) => {
                    const isSelected = selectedFacilities.includes(facility);
                    return (
                      <Tag
                        key={facility}
                        label={facility}
                        selected={isSelected}
                        onPress={() => toggleFacilityFilter(facility)}
                      />
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.modalFooter}>
              <Button
                title="Reset All"
                onPress={resetFilters}
                variant="outlined"
                size="md"
                style={styles.modalFooterBtn}
              />
              <Button
                title="Apply Filters"
                onPress={applyFilters}
                variant="primary"
                size="md"
                style={styles.modalFooterBtn}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
    paddingBottom: spacing.xs,
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
  searchContainer: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
  },
  pasteCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    marginTop: spacing.xs,
  },
  pasteCodeText: {
    ...typography.labelSm,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  categoryStrip: {
    paddingLeft: spacing.screenPadding,
    marginBottom: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLow,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    ...typography.labelLg,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.onPrimary,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
  },
  resultsCount: {
    ...typography.labelLg,
    color: colors.textMuted,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    ...typography.labelLg,
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
  },
  cardItem: {
    marginBottom: spacing.base,
  },

  // Modal Styles
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.base,
  },
  filterSection: {
    marginBottom: spacing.xl,
  },
  filterLabel: {
    ...typography.labelLg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sortOptionsGroup: {
    gap: spacing.sm,
  },
  sortOptionChip: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sortOptionChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  sortOptionText: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  sortOptionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  priceInputWrapper: {
    flex: 1,
  },
  facilityWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
  },
  modalFooterBtn: {
    flex: 1,
  },
});
