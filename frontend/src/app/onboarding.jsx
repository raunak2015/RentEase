import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '@/components/ui/Button';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius } from '@/constants/spacing';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'search-location-outline',
    title: 'Discover Nearby Rentals',
    description:
      'Find verified rooms, PGs, flats, and shared accommodations matching your budget and location preferences.',
  },
  {
    id: '2',
    icon: 'calendar-outline',
    title: 'Schedule Property Visits',
    description:
      'Request visits with a single tap, pick your preferred date and time, and receive instant status updates from property owners.',
  },
  {
    id: '3',
    icon: 'home-outline',
    title: 'List & Manage Properties',
    description:
      'Are you a property owner? Post listings easily, upload photos, set coordinates, and manage visit requests effortlessly.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
    } catch (err) {
      console.error('Error saving onboarding state:', err);
    }
    router.replace('/sign-in');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleFinishOnboarding();
    }
  };

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Skip */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleFinishOnboarding}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slide Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slideContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={64} color={colors.primary} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {/* Indicators */}
        <View style={styles.indicatorContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.indicatorActive,
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          size="lg"
          style={styles.nextButton}
        />
      </View>
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
    paddingVertical: spacing.md,
    alignItems: 'flex-end',
  },
  skipText: {
    ...typography.labelLg,
    color: colors.textMuted,
  },
  slideContainer: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding * 1.5,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.display,
    fontSize: 26,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.bodyLg,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceContainerHigh,
  },
  indicatorActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  nextButton: {
    width: '100%',
  },
});
