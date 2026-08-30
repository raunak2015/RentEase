import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, userRole } = useAuth();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of RentEase?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/sign-in');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete your account and remove all your data. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await userService.deleteAccount();
              await signOut();
              Alert.alert('Account Deleted', 'Your account has been permanently removed.');
              router.replace('/sign-in');
            } catch (err) {
              Alert.alert('Error', err.message || 'Could not delete account.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@rentease.com?subject=RentEase%20Support%20Inquiry');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Settings & Preferences</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Notifications */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              <Text style={styles.settingLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="mail-outline" size={22} color={colors.primary} />
              <Text style={styles.settingLabel}>Email Updates & Alerts</Text>
            </View>
            <Switch
              value={emailAlerts}
              onValueChange={setEmailAlerts}
              trackColor={{ false: colors.borderLight, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Section 2: Support & Legal */}
        <Text style={styles.sectionHeader}>Support & Info</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowFaqModal(true)}>
            <View style={styles.rowLeft}>
              <Ionicons name="help-circle-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Frequently Asked Questions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleContactSupport}>
            <View style={styles.rowLeft}>
              <Ionicons name="headset-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Contact Support</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={() => setShowTermsModal(true)}>
            <View style={styles.rowLeft}>
              <Ionicons name="document-text-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={() => setShowPrivacyModal(true)}>
            <View style={styles.rowLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section 3: App Info */}
        <Text style={styles.sectionHeader}>About App</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="information-circle-outline" size={22} color={colors.textMuted} />
              <Text style={styles.settingLabel}>Application Version</Text>
            </View>
            <Text style={styles.versionText}>v1.0.0 (Build 100)</Text>
          </View>
        </View>

        {/* Section 4: Actions */}
        <Text style={styles.sectionHeader}>Account Actions</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
            <View style={styles.rowLeft}>
              <Ionicons name="log-out-outline" size={22} color={colors.warning} />
              <Text style={[styles.settingLabel, { color: colors.warning }]}>Sign Out</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.warning} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="trash-outline" size={22} color={colors.error} />
              <Text style={[styles.settingLabel, { color: colors.error }]}>
                {deleting ? 'Deleting Account...' : 'Delete Account'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>RentEase India © 2026 — Verified Rentals Made Simple</Text>
      </ScrollView>

      {/* Terms of Service Modal */}
      <Modal visible={showTermsModal} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <TouchableOpacity onPress={() => setShowTermsModal(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.legalHeading}>1. Acceptance of Terms</Text>
            <Text style={styles.legalBody}>
              By using RentEase, you agree to comply with all applicable terms, conditions, and regulations governing rental properties in your jurisdiction.
            </Text>

            <Text style={styles.legalHeading}>2. Listings & Accuracy</Text>
            <Text style={styles.legalBody}>
              Property owners are solely responsible for ensuring listing details, prices, and locations are truthful and up to date.
            </Text>

            <Text style={styles.legalHeading}>3. User Conduct</Text>
            <Text style={styles.legalBody}>
              Fraudulent, misleading, or abusive communication between tenants and owners is strictly prohibited and will result in immediate ban.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal visible={showPrivacyModal} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <TouchableOpacity onPress={() => setShowPrivacyModal(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.legalHeading}>1. Data Collection</Text>
            <Text style={styles.legalBody}>
              We collect your name, email, phone number, and location coordinates solely to facilitate property searches, visit requests, and contact with verified owners.
            </Text>

            <Text style={styles.legalHeading}>2. Data Protection</Text>
            <Text style={styles.legalBody}>
              Your password is encrypted using industry-standard bcrypt hashing. We never sell your personal contact details to third-party advertisers.
            </Text>

            <Text style={styles.legalHeading}>3. Your Rights</Text>
            <Text style={styles.legalBody}>
              You have the right to request full account deletion and data purge at any time using the Delete Account option in Settings.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* FAQ Modal */}
      <Modal visible={showFaqModal} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Frequently Asked Questions</Text>
            <TouchableOpacity onPress={() => setShowFaqModal(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.legalHeading}>Q: How do I book a visit?</Text>
            <Text style={styles.legalBody}>
              Open any property listing, tap "Request Visit", select your preferred date & time slot, and submit. The owner will accept or decline your request.
            </Text>

            <Text style={styles.legalHeading}>Q: What is a Property Code?</Text>
            <Text style={styles.legalBody}>
              Every property has a unique code (e.g. #RE-1042). You can copy the code and paste it into the Explore search bar for instant lookup.
            </Text>

            <Text style={styles.legalHeading}>Q: How do I list my property?</Text>
            <Text style={styles.legalBody}>
              If your account is registered as an Owner, navigate to "My Properties" tab and tap "Add Property" button.
            </Text>
          </ScrollView>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    ...typography.headlineLg,
    fontSize: 18,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    ...typography.labelLg,
    fontSize: 13,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    ...shadows.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingLabel: {
    ...typography.bodyLg,
    fontSize: 15,
    color: colors.textPrimary,
  },
  versionText: {
    ...typography.bodyMd,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
  footerNote: {
    ...typography.bodySm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    ...typography.headlineMd,
    fontSize: 20,
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.lg,
  },
  legalHeading: {
    ...typography.headlineMd,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  legalBody: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
});
