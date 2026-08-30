import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { messageService } from '@/services/messageService';
import Avatar from '@/components/ui/Avatar';
import Loader from '@/components/ui/Loader';
import EmptyState from '@/components/ui/EmptyState';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import spacing, { borderRadius, shadows } from '@/constants/spacing';

function MessageBubble({ message, isMe }) {
  const time = new Date(message.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
      {!isMe && (
        <Avatar
          source={message.senderId?.profileImage}
          name={message.senderId?.name}
          size={30}
          style={styles.bubbleAvatar}
        />
      )}
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
          {message.text}
        </Text>
        <View style={styles.bubbleMeta}>
          <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>{time}</Text>
          {isMe && (
            <Ionicons
              name={message.read ? 'checkmark-done' : 'checkmark'}
              size={12}
              color={message.read ? colors.primaryLight : colors.onPrimaryLight}
            />
          )}
        </View>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { propertyId, propertyTitle, otherUserId, otherUserName, otherUserImage } =
    useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (propertyId && otherUserId) {
      fetchMessages(true);

      // Real-time polling: Fetch new incoming messages every 3 seconds
      const pollInterval = setInterval(() => {
        pollMessages();
      }, 3000);

      return () => clearInterval(pollInterval);
    }
  }, [propertyId, otherUserId]);

  const fetchMessages = async (isInitial = false) => {
    try {
      const res = await messageService.getConversation(propertyId, otherUserId);
      const fetched = res.data || [];
      setMessages(fetched);
      if (isInitial) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
      }
    } catch (err) {
      if (isInitial) {
        Alert.alert('Error', err.message || 'Could not load messages');
      }
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  const pollMessages = async () => {
    try {
      const res = await messageService.getConversation(propertyId, otherUserId);
      const fetched = res.data || [];
      // Only update if new message received or status changed
      setMessages((prev) => {
        if (prev.length !== fetched.length) {
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          return fetched;
        }
        return prev;
      });
    } catch (e) {
      // Silent error during background poll
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    const optimistic = {
      _id: `temp_${Date.now()}`,
      senderId: { _id: user?._id, name: user?.name, profileImage: user?.profileImage },
      receiverId: { _id: otherUserId, name: otherUserName },
      propertyId,
      text: trimmed,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const res = await messageService.sendMessage(otherUserId, propertyId, trimmed);
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? res.data : m))
      );
    } catch (err) {
      // Roll back optimistic update
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      Alert.alert('Send Failed', err.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader message="Loading conversation..." />;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Avatar source={otherUserImage} name={otherUserName} size={38} />

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerName}>{otherUserName || 'User'}</Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {propertyTitle || 'Property Chat'}
          </Text>
        </View>
      </View>

      {/* Property Context Banner */}
      <View style={styles.contextBanner}>
        <Ionicons name="home-outline" size={14} color={colors.primary} />
        <Text style={styles.contextText} numberOfLines={1}>
          Chat about: {propertyTitle}
        </Text>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length === 0 ? (
          <EmptyState
            icon="chatbubbles-outline"
            title="No Messages Yet"
            description="Start the conversation! Introduce yourself or ask about the property."
          />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            renderItem={({ item }) => {
              const isMe = item.senderId?._id === user?._id ||
                item.senderId === user?._id;
              return <MessageBubble message={item} isMe={isMe} />;
            }}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            <Ionicons
              name={sending ? 'ellipsis-horizontal' : 'send'}
              size={20}
              color={colors.onPrimary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
  },
  headerName: {
    ...typography.labelLg,
    fontSize: 16,
    color: colors.textPrimary,
  },
  headerSub: {
    ...typography.bodyXs,
    color: colors.textMuted,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xs,
  },
  contextText: {
    ...typography.labelSm,
    color: colors.primary,
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  bubbleRowMe: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  bubbleAvatar: {
    marginBottom: 2,
  },
  bubble: {
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxWidth: '100%',
  },
  bubbleThem: {
    backgroundColor: colors.surfaceContainerLowest,
    borderBottomLeftRadius: 4,
    ...shadows.xs,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    ...typography.bodyMd,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: colors.onPrimary,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 4,
  },
  bubbleTime: {
    ...typography.bodyXs,
    color: colors.textMuted,
    fontSize: 10,
  },
  bubbleTimeMe: {
    color: colors.onPrimaryLight,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.lg,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  sendBtnDisabled: {
    backgroundColor: colors.textMuted,
  },
});
