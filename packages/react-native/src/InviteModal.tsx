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
      animationType="slide"
      transparent
    >
      <View style={[styles.container, style.container]}>
        <Text style={[styles.title, style.title]}>
          {texts.title || 'Invite Friends'}
        </Text>
        <TextInput
          style={[styles.input, style.input]}
          placeholder={texts.placeholder || 'Enter friend\'s email or identifier'}
          value={inviteeIdentifier}
          onChangeText={setInviteeIdentifier}
          autoCapitalize="none"
          keyboardType="email-address"
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
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, style.buttonText]}>
              {texts.button || 'Send Invitation'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  input: {
    width: '100%',
    padding: Platform.OS === 'ios' ? 15 : 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#ff3b30',
    marginBottom: 10,
  },
}); 