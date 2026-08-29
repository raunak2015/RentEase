import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

export default function SignInScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      // Auth context will update session state and navigation
      router.replace('/(tabs)/home');
    } catch (err) {
      const errorMessage = err.message || 'Invalid email or password';
      Alert.alert('Sign In Failed', errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Branding */}
          <View style={styles.headerSection}>
            <View style={styles.logoBadge}>
              <Ionicons name="home" size={32} color={colors.primary} />
            </View>
            <Text style={styles.brandTitle}>RentEase</Text>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage listings, save favorites, and request visits
            </Text>
          </View>

          {/* General Error Banner */}
          {errors.general ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View style={styles.formSection}>
            <Input
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: null, general: null }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              }
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: null, general: null }));
              }}
              secureTextEntry
              error={errors.password}
              leftIcon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textMuted}
                />
              }
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => router.push('/forgot-password')}
              style={styles.forgotPasswordButton}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In CTA */}
            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.signInButton}
            />
          </View>

          {/* Footer Link to Sign Up */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/sign-up')}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xl,
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brandTitle: {
    ...typography.headlineLg,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  welcomeText: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorContainer,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  errorBannerText: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
    flex: 1,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    ...typography.labelLg,
    color: colors.primary,
  },
  signInButton: {
    marginTop: spacing.sm,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  signUpLink: {
    ...typography.labelLg,
    color: colors.primary,
    fontWeight: '700',
  },
});
