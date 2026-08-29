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
import spacing, { borderRadius } from '@/constants/spacing';

export default function SignUpScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('tenant'); // 'tenant' | 'owner'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (phone.trim().length < 10) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });

      Alert.alert(
        'Account Created',
        'Your RentEase account has been created successfully!',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)/home'),
          },
        ]
      );
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      Alert.alert('Sign Up Error', errorMessage);
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
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join RentEase as a Tenant looking for home or Owner listing properties
            </Text>
          </View>

          {/* General Error Banner */}
          {errors.general ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          ) : null}

          {/* Role Selection */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleToggleGroup}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'tenant' && styles.roleOptionActive,
                ]}
                onPress={() => setRole('tenant')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={role === 'tenant' ? colors.white : colors.textPrimary}
                />
                <Text
                  style={[
                    styles.roleText,
                    role === 'tenant' && styles.roleTextActive,
                  ]}
                >
                  Tenant
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  role === 'owner' && styles.roleOptionActive,
                ]}
                onPress={() => setRole('owner')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="business-outline"
                  size={20}
                  color={role === 'owner' ? colors.white : colors.textPrimary}
                />
                <Text
                  style={[
                    styles.roleText,
                    role === 'owner' && styles.roleTextActive,
                  ]}
                >
                  Property Owner
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors((prev) => ({ ...prev, name: null }));
              }}
              error={errors.name}
              leftIcon={
                <Ionicons name="person-outline" size={20} color={colors.textMuted} />
              }
            />

            <Input
              label="Email Address"
              placeholder="name@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: null }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={
                <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              }
            />

            <Input
              label="Phone Number"
              placeholder="+91 9876543210"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setErrors((prev) => ({ ...prev, phone: null }));
              }}
              keyboardType="phone-pad"
              error={errors.phone}
              leftIcon={
                <Ionicons name="call-outline" size={20} color={colors.textMuted} />
              }
            />

            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: null }));
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

            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              secureTextEntry
              error={errors.confirmPassword}
              leftIcon={
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={colors.textMuted}
                />
              }
            />

            {/* Sign Up CTA */}
            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.signUpButton}
            />
          </View>

          {/* Footer Link to Sign In */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
              <Text style={styles.signInLink}>Sign In</Text>
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
  },
  headerSection: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
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
  roleContainer: {
    marginBottom: spacing.xl,
  },
  roleLabel: {
    ...typography.labelLg,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  roleToggleGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    gap: spacing.sm,
  },
  roleOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleText: {
    ...typography.labelLg,
    color: colors.textPrimary,
  },
  roleTextActive: {
    color: colors.white,
  },
  formSection: {
    marginBottom: spacing.xl,
  },
  signUpButton: {
    marginTop: spacing.md,
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  footerText: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
  signInLink: {
    ...typography.labelLg,
    color: colors.primary,
    fontWeight: '700',
  },
});
