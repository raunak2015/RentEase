import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import Avatar from '@/components/ui/Avatar';
import SearchBar from '@/components/ui/SearchBar';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

export default function HomeScreen() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
            <Text style={styles.subGreeting}>
              {isOwner ? 'Manage your property listings & visits' : 'Find your perfect room or flat share'}
            </Text>
          </View>
          <Avatar source={user?.profileImage} name={user?.name} size={44} />
        </View>

        {/* Search Bar */}
        <SearchBar placeholder={isOwner ? "Search your listings..." : "Search rooms, PGs, flats..."} style={styles.searchBar} />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.headlineLg,
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
});
