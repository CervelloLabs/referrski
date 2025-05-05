import React, { useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';

import { ReferrSki } from './index';

export interface InviteModalProps extends PropsWithChildren<any> {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  inviterId: string;
  style?: {
    container?: StyleProp<ViewStyle>;
    input?: StyleProp<TextStyle>;
    button?: StyleProp<ViewStyle>;
    buttonText?: StyleProp<TextStyle>;
    title?: StyleProp<TextStyle>;
    error?: StyleProp<TextStyle>;
  };
  texts?: {
    title?: string;
    placeholder?: string;
    button?: string;
    success?: string;
    error?: string;
  };
}

export function InviteModal({
  visible,
  onClose,
  onSuccess,
  inviterId,
  style = {},
  texts = {},
}: InviteModalProps): JSX.Element {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ReferrSki.createInvitation(email.trim());
      setEmail('');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError('Failed to send invitation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      transparent
    >
      <View style={[styles.overlay]}>
        <View style={[styles.container, style.container]}>
          <Text style={[styles.title, style.title]}>
            {texts.title || 'Invite a Friend'}
          </Text>

          <TextInput
            style={[styles.input, style.input]}
            placeholder={texts.placeholder || 'Enter email address'}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          {error && (
            <Text style={[styles.error, style.error]}>
              {error}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.button, style.button]}
            onPress={handleInvite}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={[styles.buttonText, style.buttonText]}>
                {texts.button || 'Send Invitation'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  closeButton: {
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
}); 