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
  inviterName: string;
  sendEmail?: boolean;
  style?: {
    container?: StyleProp<ViewStyle>;
    input?: StyleProp<TextStyle>;
    button?: StyleProp<ViewStyle>;
    buttonText?: StyleProp<TextStyle>;
    title?: StyleProp<TextStyle>;
    error?: StyleProp<TextStyle>;
    closeButton?: StyleProp<ViewStyle>;
    closeButtonText?: StyleProp<TextStyle>;
    overlay?: StyleProp<ViewStyle>;
    modalCard?: StyleProp<ViewStyle>;
    description?: StyleProp<TextStyle>;
    inputContainer?: StyleProp<ViewStyle>;
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
  inviterName,
  sendEmail = true,
  style = {},
  texts = {},
}: InviteModalProps): JSX.Element {
  const [inviteeIdentifier, setInviteeIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!inviteeIdentifier.trim()) {
      setError('Please enter an identifier');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await ReferrSki.sendInvite({
        inviteeIdentifier: inviteeIdentifier.trim(),
        inviterId,
        metadata: {
          inviterName
        },
        ...(sendEmail && {
          email: {
            fromName: inviterName,
            subject: 'Join our app!',
            content: 'Hey there! I think you\'d love using our app.'
          }
        })
      });
      setInviteeIdentifier('');
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
      animationType="fade"
      transparent
    >
      <View style={[styles.overlay, style.overlay]}>
        <View style={[styles.modalCard, style.container]}>
          <TouchableOpacity 
            style={[styles.closeButton, style.closeButton]} 
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, style.closeButtonText]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.title, style.title]}>
            {texts.title || 'Invite Friends'}
          </Text>
          <Text style={styles.description}>
            Share this app with your friends and family
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, style.input]}
              placeholder={texts.placeholder || 'Enter friend\'s email or identifier'}
              placeholderTextColor="#9ca3af"
              value={inviteeIdentifier}
              onChangeText={setInviteeIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {error && (
            <Text style={[styles.error, style.error]}>
              {error}
            </Text>
          )}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled, style.button]}
            onPress={handleInvite}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.buttonText, style.buttonText]}>
                {texts.button || 'Send Invitation'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    width: '100%',
    padding: Platform.OS === 'ios' ? 15 : 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    fontSize: 15,
    color: '#111827',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: '500',
  },
}); 