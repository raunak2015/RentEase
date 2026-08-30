import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { visitService } from '@/services/visitService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'];

const TIME_SLOT_META = {
  Morning: { icon: 'sunny-outline', desc: '9:00 AM – 12:00 PM' },
  Afternoon: { icon: 'partly-sunny-outline', desc: '12:00 PM – 4:00 PM' },
  Evening: { icon: 'moon-outline', desc: '4:00 PM – 7:00 PM' },
};

// Generate next 14 available date labels
const getAvailableDates = () => {
  const dates = [];
  const now = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const label = d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
    const value = d.toISOString().split('T')[0];
    dates.push({ label, value });
  }
  return dates;
};

export default function RequestVisitScreen() {
  const { propertyId, propertyTitle } = useLocalSearchParams();
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const dates = getAvailableDates();

  const handleSubmit = async () => {
    if (!selectedDate) {
      Alert.alert('Select Date', 'Please choose a preferred visit date.');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Select Time Slot', 'Please choose a preferred time slot.');
      return;
    }

    setLoading(true);
    try {
      await visitService.createVisitRequest({
        propertyId,
        requestedDate: selectedDate,
        requestedTimeSlot: selectedSlot,
        note: note.trim(),
      });

      Alert.alert(
        'Visit Requested! 🎉',
        `Your visit to "${propertyTitle}" on ${selectedDate} (${selectedSlot}) has been sent to the owner. You will be notified once they respond.`,
        [{ text: 'Great!', onPress: () => router.back() }]
      );
    } catch (err) {
      Alert.alert('Request Failed', err.message || 'Could not send visit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarTitleWrap}>
          <Text style={styles.topBarTitle}>Request a Visit</Text>
          <Text style={styles.topBarSub} numberOfLines={1}>{propertyTitle || 'Property'}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Step 1: Choose Date */}
        <View style={styles.section}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Choose a Date</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesRow}
          >
            {dates.map((d) => {
              const isSelected = selectedDate === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                  onPress={() => setSelectedDate(d.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dateChipText, isSelected && styles.dateChipTextSelected]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Step 2: Choose Time Slot */}
        <View style={styles.section}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Choose a Time Slot</Text>
          </View>

          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot) => {
              const meta = TIME_SLOT_META[slot];
              const isSelected = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotCard, isSelected && styles.slotCardSelected]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={meta.icon}
                    size={26}
                    color={isSelected ? colors.onPrimary : colors.primary}
                  />
                  <Text style={[styles.slotName, isSelected && styles.slotNameSelected]}>
                    {slot}
                  </Text>
                  <Text style={[styles.slotDesc, isSelected && styles.slotDescSelected]}>
                    {meta.desc}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Step 3: Add a Note */}
        <View style={styles.section}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Add a Note (Optional)</Text>
          </View>

          <Input
            placeholder="e.g. I'm interested in a 6-month lease and would like to check the WiFi speed..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
            leftIcon={<Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />}
          />
        </View>

        {/* Summary */}
        {selectedDate && selectedSlot && (
          <View style={styles.summaryCard}>
            <Ionicons name="calendar-check-outline" size={22} color={colors.primary} />
            <View style={styles.summaryTextWrap}>
              <Text style={styles.summaryTitle}>Visit Summary</Text>
              <Text style={styles.summaryLine}>
                📅 {selectedDate}   🕐 {selectedSlot} ({TIME_SLOT_META[selectedSlot].desc})
              </Text>
            </View>
          </View>
        )}

        {/* Submit */}
        <Button
          title={loading ? 'Sending Request...' : 'Send Visit Request'}
          onPress={handleSubmit}
          variant="primary"
          size="lg"
          disabled={loading}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surfaceContainerLowest,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitleWrap: {
    flex: 1,
  },
  topBarTitle: {
    ...typography.headlineMd,
    fontSize: 18,
    color: colors.textPrimary,
  },
  topBarSub: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  stepTitle: {
    ...typography.headlineMd,
    fontSize: 17,
    color: colors.textPrimary,
  },
  datesRow: {
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  dateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  dateChipText: {
    ...typography.labelMd,
    color: colors.textSecondary,
  },
  dateChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  slotsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  slotCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: colors.borderLight,
    gap: spacing.xs,
    ...shadows.sm,
  },
  slotCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotName: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  slotNameSelected: {
    color: colors.onPrimary,
  },
  slotDesc: {
    ...typography.bodyXs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  slotDescSelected: {
    color: colors.onPrimaryLight,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryTitle: {
    ...typography.labelLg,
    color: colors.primary,
    marginBottom: spacing.xxs,
  },
  summaryLine: {
    ...typography.bodyMd,
    color: colors.textPrimary,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});
