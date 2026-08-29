import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { propertyService } from '@/services/propertyService';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

export default function MyPropertiesScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    setError(null);
    try {
      const res = await propertyService.getOwnerProperties();
      setProperties(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your properties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMyProperties();
  };

  const handleDeleteProperty = (id, title) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await propertyService.deleteProperty(id);
              setProperties((prev) => prev.filter((p) => p._id !== id));
              Alert.alert('Deleted', 'Property listing removed.');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete property.');
            }
          },
        },
      ]
    );
  };

  const filteredProperties = properties.filter((item) => {
    if (activeFilter === 'active') return item.isActive;
    if (activeFilter === 'inactive') return !item.isActive;
    return true;
  });

  if (loading) {
    return <Loader message="Loading your properties..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchMyProperties} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Properties</Text>
          <Text style={styles.subtitle}>
            {properties.length} {properties.length === 1 ? 'listing' : 'listings'} total
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-property')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {['all', 'active', 'inactive'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === filter && styles.filterChipTextActive,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Property List */}
      {filteredProperties.length === 0 ? (
        <EmptyState
          icon="business-outline"
          title="No Properties Found"
          description={
            properties.length === 0
              ? "You haven't posted any property listings yet. Tap 'Add' to create your first listing!"
              : 'No listings match the selected filter.'
          }
          buttonTitle={properties.length === 0 ? 'Add Property' : null}
          onButtonPress={properties.length === 0 ? () => router.push('/add-property') : null}
        />
      ) : (
        <FlatList
          data={filteredProperties}
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
            <View style={styles.propertyCard}>
              <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{item.type}</Text>
                </View>
                <Text style={styles.codeBadge}>{item.propertyCode}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: item.isActive ? colors.successLight : colors.errorContainer },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: item.isActive ? colors.success : colors.error },
                    ]}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{item.title}</Text>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={colors.textMuted} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>

              <Text style={styles.price}>
                ₹{item.price?.toLocaleString('en-IN') || item.price}
                <Text style={styles.priceUnit}> / month</Text>
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/property/${item._id}`)}
                >
                  <Ionicons name="eye-outline" size={18} color={colors.primary} />
                  <Text style={[styles.actionText, { color: colors.primary }]}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/edit-property/${item._id}`)}
                >
                  <Ionicons name="create-outline" size={18} color={colors.textPrimary} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDeleteProperty(item._id, item.title)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                  <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.labelLg,
    color: colors.onPrimary,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenPadding,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    ...typography.labelMd,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.onPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
  },
  propertyCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    marginBottom: spacing.base,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  typeBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: {
    ...typography.labelSm,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  codeBadge: {
    ...typography.labelSm,
    color: colors.textMuted,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.labelSm,
    fontWeight: '700',
  },
  cardTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  locationText: {
    ...typography.bodyMd,
    color: colors.textMuted,
    flex: 1,
  },
  price: {
    ...typography.headlineMd,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  priceUnit: {
    ...typography.bodyMd,
    color: colors.textMuted,
    fontWeight: '400',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs + 2,
    gap: 4,
  },
  actionText: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
});
