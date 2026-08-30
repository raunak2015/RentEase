import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { visitService } from '@/services/visitService';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Avatar from '@/components/ui/Avatar';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

const STATUS_META = {
  pending: { label: 'Pending', color: colors.warning, bg: colors.warningLight, icon: 'time-outline' },
  accepted: { label: 'Accepted', color: colors.success, bg: colors.successLight, icon: 'checkmark-circle-outline' },
  rejected: { label: 'Rejected', color: colors.error, bg: colors.errorLight, icon: 'close-circle-outline' },
  cancelled: { label: 'Cancelled', color: colors.textMuted, bg: colors.surfaceContainerHigh, icon: 'ban-outline' },
};

function VisitCard({ visit, onCancel }) {
  const meta = STATUS_META[visit.status] || STATUS_META.pending;
  const property = visit.propertyId || {};
  const owner = visit.ownerId || {};

  return (
    <View style={styles.card}>
      {/* Property & Status Row */}
      <View style={styles.cardHeader}>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle} numberOfLines={1}>
            {property.title || 'Property'}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={styles.locationText} numberOfLines={1}>{property.address || '—'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={13} color={meta.color} />
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      {/* Visit Details */}
      <View style={styles.detailsRow}>
        <View style={styles.detailChip}>
          <Ionicons name="calendar-outline" size={14} color={colors.primary} />
          <Text style={styles.detailText}>{visit.requestedDate}</Text>
        </View>
        <View style={styles.detailChip}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
          <Text style={styles.detailText}>{visit.requestedTimeSlot}</Text>
        </View>
        <View style={styles.detailChip}>
          <Ionicons name="cash-outline" size={14} color={colors.primary} />
          <Text style={styles.detailText}>₹{property.price?.toLocaleString('en-IN')}/mo</Text>
        </View>
      </View>

      {/* Owner & Note */}
      <View style={styles.ownerRow}>
        <Avatar source={owner.profileImage} name={owner.name} size={32} />
        <Text style={styles.ownerName}>{owner.name || 'Owner'}</Text>
      </View>

      {visit.note ? (
        <View style={styles.noteBox}>
          <Ionicons name="chatbubble-outline" size={13} color={colors.textMuted} />
          <Text style={styles.noteText} numberOfLines={2}>{visit.note}</Text>
        </View>
      ) : null}

      {/* Cancel Button for pending requests */}
      {visit.status === 'pending' && (
        <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(visit._id)}>
          <Ionicons name="close-circle-outline" size={16} color={colors.error} />
          <Text style={styles.cancelText}>Cancel Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function MyVisitsScreen() {
  const router = useRouter();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setError(null);
    try {
      const res = await visitService.getTenantVisits();
      setVisits(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load visit requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVisits();
  };

  const handleCancel = (visitId) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this visit request?',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            try {
              await visitService.updateVisitStatus(visitId, 'cancelled');
              setVisits((prev) =>
                prev.map((v) => (v._id === visitId ? { ...v, status: 'cancelled' } : v))
              );
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not cancel the request');
            }
          },
        },
      ]
    );
  };

  if (loading) return <Loader message="Loading your visit requests..." />;
  if (error) return <ErrorState message={error} onRetry={fetchVisits} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Visit Requests</Text>
        <Text style={styles.subtitle}>{visits.length} total requests</Text>
      </View>

      {visits.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No Visit Requests Yet"
          description="Browse properties and request a visit to schedule a showing with the owner."
          buttonTitle="Explore Properties"
          onButtonPress={() => router.push('/(tabs)/explore')}
        />
      ) : (
        <FlatList
          data={visits}
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
            <VisitCard visit={item} onCancel={handleCancel} />
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
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  propertyInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  propertyTitle: {
    ...typography.labelLg,
    fontSize: 16,
    color: colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    ...typography.bodyXs,
    color: colors.textMuted,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.labelSm,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  detailText: {
    ...typography.labelSm,
    color: colors.primary,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  ownerName: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  noteText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    flex: 1,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  cancelText: {
    ...typography.labelMd,
    color: colors.error,
  },
});
