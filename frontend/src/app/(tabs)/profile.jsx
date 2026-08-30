import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out of your RentEase account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/sign-in');
          },
        },
      ]
    );
  };

  const isOwner = user?.role === 'owner';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarRow}>
            <Avatar
              source={user?.profileImage}
              name={user?.name}
              size={80}
            />
            <View style={styles.headerDetails}>
              <Text style={styles.userName}>{user?.name || 'RentEase User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              
              <View style={styles.roleBadge}>
                <Ionicons
                  name={isOwner ? 'business' : 'person'}
                  size={12}
                  color={colors.onPrimary}
                />
                <Text style={styles.roleBadgeText}>
                  {isOwner ? 'Property Owner' : 'Tenant'}
                </Text>
              </View>
            </View>
          </View>

          {user?.phone ? (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={16} color={colors.textMuted} />
              <Text style={styles.infoText}>{user.phone}</Text>
            </View>
          ) : null}

          {user?.bio ? (
            <Text style={styles.bioText} numberOfLines={3}>
              "{user.bio}"
            </Text>
          ) : null}

          {/* Edit Profile CTA */}
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Section / Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account & Activities</Text>

          {isOwner ? (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/(tabs)/my-properties')}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconBadge, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="home-outline" size={20} color={colors.primary} />
                </View>
                <Text style={styles.menuItemText}>My Properties</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push('/owner-visits')}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconBadge, { backgroundColor: colors.secondaryContainer }]}>
                  <Ionicons name="calendar-outline" size={20} color={colors.secondary} />
                </View>
                <Text style={styles.menuItemText}>Owner Visit Inbox</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/(tabs)/my-visits')}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBadge, { backgroundColor: colors.secondaryContainer }]}>
                <Ionicons name="calendar-outline" size={20} color={colors.secondary} />
              </View>
              <Text style={styles.menuItemText}>My Visit Requests</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/favorites')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBadge, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="heart-outline" size={20} color={colors.error} />
            </View>
            <Text style={styles.menuItemText}>Saved Favorites</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/(tabs)/messages')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBadge, { backgroundColor: colors.tertiaryContainer + '20' }]}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.tertiary} />
            </View>
            <Text style={styles.menuItemText}>Messages</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBadge, { backgroundColor: colors.surfaceContainerHigh }]}>
              <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
            </View>
            <Text style={styles.menuItemText}>Settings & Privacy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout CTA */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
    paddingVertical: spacing.xl,
  },
  profileHeaderCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
    gap: spacing.base,
  },
  headerDetails: {
    flex: 1,
  },
  userName: {
    ...typography.headlineLg,
    fontSize: 22,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  userEmail: {
    ...typography.bodyMd,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  roleBadgeText: {
    ...typography.labelSm,
    color: colors.onPrimary,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  bioText: {
    ...typography.bodyMd,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm + 2,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  editProfileText: {
    ...typography.labelLg,
    color: colors.primary,
  },
  menuSection: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: borderRadius.xxl,
    padding: spacing.base,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.labelLg,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  menuIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.textPrimary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorContainer,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.base,
    gap: spacing.xs,
    marginBottom: spacing.xxl,
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
  },
});
