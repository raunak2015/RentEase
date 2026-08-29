import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '@/services/authService';
import Header from '@/components/ui/Header';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing from '@/constants/spacing';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleResetPassword = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Forgot Password" showBack onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {submitted ? (
            <View style={styles.successCard}>
              <View style={styles.successIconBadge}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              </View>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successMessage}>
                We have sent password reset instructions to{' '}
                <Text style={styles.boldText}>{email}</Text>. Follow the link in the email to reset your password.
              </Text>
              <Button
                title="Back to Sign In"
                onPress={() => router.replace('/sign-in')}
                variant="primary"
                size="lg"
                style={styles.backButton}
              />
            </View>
          ) : (
            <>
              <View style={styles.iconBadge}>
                <Ionicons name="key-outline" size={32} color={colors.primary} />
              </View>

              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter the email address associated with your RentEase account and we'll send you instructions to reset your password.
              </Text>

              <View style={styles.formSection}>
                <Input
                  label="Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={error}
                  leftIcon={
                    <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                  }
                />

                <Button
                  title="Send Reset Instructions"
                  onPress={handleResetPassword}
                  loading={loading}
                  variant="primary"
                  size="lg"
                  style={styles.submitButton}
                />

                <Button
                  title="Back to Sign In"
                  onPress={() => router.back()}
                  variant="outlined"
                  size="lg"
                  style={styles.cancelButton}
                />
              </View>
            </>
          )}
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
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
    alignSelf: 'center',
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 26,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.base,
  },
  formSection: {
    marginTop: spacing.sm,
  },
  submitButton: {
    marginTop: spacing.base,
  },
  cancelButton: {
    marginTop: spacing.md,
  },
  successCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  successIconBadge: {
    marginBottom: spacing.base,
  },
  successTitle: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  successMessage: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  backButton: {
    width: '100%',
  },
});
