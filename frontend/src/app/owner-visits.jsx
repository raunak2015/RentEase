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

function OwnerVisitCard({ visit, onAccept, onReject }) {
  const meta = STATUS_META[visit.status] || STATUS_META.pending;
  const tenant = visit.tenantId || {};
  const property = visit.propertyId || {};

  return (
    <View style={styles.card}>
      {/* Property Title + Status */}
      <View style={styles.cardHeader}>
        <View style={styles.propertyInfoWrap}>
          <Text style={styles.propertyTitle} numberOfLines={1}>{property.title || 'Property'}</Text>
          <Text style={styles.propertyAddress} numberOfLines={1}>{property.address || '—'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={13} color={meta.color} />
          <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      {/* Tenant Info */}
      <View style={styles.tenantRow}>
        <Avatar source={tenant.profileImage} name={tenant.name} size={40} />
        <View style={styles.tenantInfo}>
          <Text style={styles.tenantName}>{tenant.name || 'Tenant'}</Text>
          <Text style={styles.tenantContact}>{tenant.phone || tenant.email || 'No contact'}</Text>
          {tenant.bio ? (
            <Text style={styles.tenantBio} numberOfLines={2}>"{tenant.bio}"</Text>
          ) : null}
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
      </View>

      {/* Tenant Note */}
      {visit.note ? (
        <View style={styles.noteBox}>
          <Ionicons name="chatbubble-outline" size={13} color={colors.textMuted} />
          <Text style={styles.noteText} numberOfLines={3}>{visit.note}</Text>
        </View>
      ) : null}

      {/* Accept / Reject Actions */}
      {visit.status === 'pending' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => onReject(visit._id)}
          >
            <Ionicons name="close" size={16} color={colors.error} />
            <Text style={[styles.actionBtnText, { color: colors.error }]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.acceptBtn]}
            onPress={() => onAccept(visit._id)}
          >
            <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
            <Text style={[styles.actionBtnText, { color: colors.onPrimary }]}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function OwnerVisitsScreen() {
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
      const res = await visitService.getOwnerVisits();
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

  const updateStatus = async (visitId, status) => {
    try {
      await visitService.updateVisitStatus(visitId, status);
      setVisits((prev) =>
        prev.map((v) => (v._id === visitId ? { ...v, status } : v))
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not update the visit request');
    }
  };

  const handleAccept = (visitId) => {
    Alert.alert('Accept Visit', 'Confirm that you want to accept this visit request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: () => updateStatus(visitId, 'accepted') },
    ]);
  };

  const handleReject = (visitId) => {
    Alert.alert('Reject Visit', 'Are you sure you want to reject this visit request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => updateStatus(visitId, 'rejected') },
    ]);
  };

  if (loading) return <Loader message="Loading visit requests..." />;
  if (error) return <ErrorState message={error} onRetry={fetchVisits} />;

  const pendingCount = visits.filter((v) => v.status === 'pending').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Visit Requests</Text>
        {pendingCount > 0 ? (
          <View style={styles.pendingBadge}>
            <Ionicons name="time-outline" size={14} color={colors.warning} />
            <Text style={styles.pendingBadgeText}>{pendingCount} awaiting response</Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>{visits.length} total requests</Text>
        )}
      </View>

      {visits.length === 0 ? (
        <EmptyState
          icon="calendar-clear-outline"
          title="No Visit Requests Yet"
          description="When tenants request to visit your properties, they will appear here for you to accept or reject."
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
            <OwnerVisitCard
              visit={item}
              onAccept={handleAccept}
              onReject={handleReject}
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
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  pendingBadgeText: {
    ...typography.labelMd,
    color: colors.warning,
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
  propertyInfoWrap: {
    flex: 1,
    marginRight: spacing.sm,
  },
  propertyTitle: {
    ...typography.labelLg,
    fontSize: 16,
    color: colors.textPrimary,
  },
  propertyAddress: {
    ...typography.bodyXs,
    color: colors.textMuted,
    marginTop: 2,
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
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  tenantContact: {
    ...typography.bodyXs,
    color: colors.textMuted,
    marginTop: 2,
  },
  tenantBio: {
    ...typography.bodyXs,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
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
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  noteText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  acceptBtn: {
    backgroundColor: colors.primary,
  },
  rejectBtn: {
    borderWidth: 1.5,
    borderColor: colors.error,
    backgroundColor: 'transparent',
  },
  actionBtnText: {
    ...typography.labelMd,
    fontWeight: '700',
  },
});
