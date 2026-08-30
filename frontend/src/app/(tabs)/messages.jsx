import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { messageService } from '@/services/messageService';
import Avatar from '@/components/ui/Avatar';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

function ConversationCard({ item, onPress }) {
  const property = item.propertyId || {};
  const other = item.otherUser || {};
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Avatar source={other.profileImage} name={other.name} size={50} />

      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.otherName} numberOfLines={1}>
            {other.name || 'User'}
          </Text>
          <Text style={styles.timeText}>{timeAgo(item.lastMessageAt)}</Text>
        </View>

        <Text style={styles.propertyLabel} numberOfLines={1}>
          <Ionicons name="home-outline" size={12} color={colors.primary} /> {property.title}
        </Text>

        <View style={styles.cardBottomRow}>
          <Text
            style={[styles.lastMessage, item.unread && styles.lastMessageUnread]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MessagesScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    setError(null);
    try {
      const res = await messageService.getInbox();
      setConversations(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInbox();
  };

  if (loading) return <Loader message="Loading messages..." />;
  if (error) return <ErrorState message={error} onRetry={fetchInbox} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>
          {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
        </Text>
      </View>

      {conversations.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title="No Conversations Yet"
          description="When you message a property owner or receive a message, conversations will appear here."
          buttonTitle="Explore Properties"
          onButtonPress={() => router.push('/(tabs)/explore')}
        />
      ) : (
        <FlatList
          data={conversations}
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
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <ConversationCard
              item={item}
              onPress={() =>
                router.push({
                  pathname: '/chat',
                  params: {
                    propertyId: item.propertyId?._id,
                    propertyTitle: item.propertyId?.title,
                    otherUserId: item.otherUser?._id,
                    otherUserName: item.otherUser?.name,
                    otherUserImage: item.otherUser?.profileImage,
                  },
                })
              }
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
  listContent: {
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.screenPadding + 50 + spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  cardContent: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  otherName: {
    ...typography.labelLg,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  timeText: {
    ...typography.bodyXs,
    color: colors.textMuted,
  },
  propertyLabel: {
    ...typography.bodyXs,
    color: colors.primary,
    marginBottom: 3,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lastMessage: {
    ...typography.bodyMd,
    color: colors.textMuted,
    flex: 1,
    fontSize: 13,
  },
  lastMessageUnread: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
