import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      determineNavigation();
    }
  }, [isLoading, isAuthenticated]);

  const determineNavigation = async () => {
    try {
      if (isAuthenticated) {
        router.replace('/(tabs)/home');
        return;
      }

      const onboardingState = await AsyncStorage.getItem('onboardingCompleted');
      if (onboardingState !== 'true') {
        router.replace('/onboarding');
      } else {
        router.replace('/sign-in');
      }
    } catch (err) {
      console.error('Splash navigation error:', err);
      router.replace('/sign-in');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Ionicons name="home" size={48} color={colors.primary} />
      </View>
      <Text style={styles.title}>RentEase</Text>
      <Text style={styles.tagline}>Smart & Simple Property Marketplace</Text>
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    ...typography.display,
    fontSize: 34,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.bodyLg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  loader: {
    marginTop: spacing.xl,
  },
});
