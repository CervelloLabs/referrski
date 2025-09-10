import React, { useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';

import { ReferrSki } from './index';

export interface InviteModalProps extends PropsWithChildren<any> {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  inviterId: string;
  inviterName?: string;
  sendEmail?: boolean;
  successMessage?: string;
  autoCloseDelay?: number; // milliseconds, 0 to disable auto-close
  resetOnClose?: boolean; // Reset form when modal closes
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
    successContainer?: StyleProp<ViewStyle>;
    successText?: StyleProp<TextStyle>;
    successIcon?: StyleProp<TextStyle>;
    fromInput?: StyleProp<TextStyle>;
  };
  texts?: {
    title?: string;
    description?: string;
    placeholder?: string;
    button?: string;
    success?: string;
    error?: string;
    fromPlaceholder?: string;
    loadingText?: string;
  };
}

export function InviteModal({
  visible,
  onClose,
  onSuccess,
  onError,
  inviterId,
  inviterName,
  sendEmail = true,
  successMessage = 'Invitation sent successfully!',
  autoCloseDelay = 2000,
  resetOnClose = true,
  style = {},
  texts = {},
}: InviteModalProps): JSX.Element {
  const [inviteeIdentifier, setInviteeIdentifier] = useState('');
  const [fromName, setFromName] = useState(inviterName || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [screenData, setScreenData] = useState(Dimensions.get('window'));
  
  const emailInputRef = useRef<TextInput>(null);
  const nameInputRef = useRef<TextInput>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle screen orientation changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  // Reset form when modal closes if resetOnClose is true
  useEffect(() => {
    if (!visible && resetOnClose) {
      setInviteeIdentifier('');
      setFromName(inviterName || '');
      setError(null);
      setIsSuccess(false);
      // Clear any pending timeout
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
        successTimeoutRef.current = null;
      }
    }
  }, [visible, resetOnClose, inviterName]);

  // Update fromName when inviterName prop changes
  useEffect(() => {
    if (inviterName && (!fromName || fromName === '')) {
      setFromName(inviterName);
    }
  }, [inviterName]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const validateEmail = (email: string) => {
    if (!email || email.trim().length === 0) {
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validateName = (name: string) => {
    return name && name.trim().length >= 2;
  };

  const resetForm = () => {
    setInviteeIdentifier('');
    setFromName(inviterName || '');
    setError(null);
    setIsSuccess(false);
  };

  const handleClose = () => {
    // Clear any pending timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
    onClose();
  };

  const handleInvite = async () => {
    // Validate inputs
    const trimmedEmail = inviteeIdentifier.trim();
    const trimmedName = fromName.trim();

    if (!trimmedEmail) {
      const errorMsg = texts.error || 'Please enter an email address';
      setError(errorMsg);
      onError?.(errorMsg);
      emailInputRef.current?.focus();
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      const errorMsg = 'Please enter a valid email address';
      setError(errorMsg);
      onError?.(errorMsg);
      emailInputRef.current?.focus();
      return;
    }

    if (!validateName(trimmedName)) {
      const errorMsg = 'Please enter your name (at least 2 characters)';
      setError(errorMsg);
      onError?.(errorMsg);
      nameInputRef.current?.focus();
      return;
    }

    // Basic validation for required props
    if (!inviterId || inviterId.trim().length === 0) {
      const errorMsg = 'Invalid configuration: inviterId is required.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const inviteOptions = {
        inviteeIdentifier: trimmedEmail,
        inviterId,
        metadata: {
          inviterName: trimmedName,
          timestamp: new Date().toISOString(),
          platform: Platform.OS,
        },
        ...(sendEmail && trimmedName && {
          email: {
            fromName: trimmedName,
            subject: `${trimmedName} invited you to join our app!`,
            content: `Hey there! ${trimmedName} thinks you'd love using our app. Join us and discover all the amazing features we have to offer!`
          }
        })
      };

      await ReferrSki.sendInvite(inviteOptions);
      
      // Clear form and show success
      setInviteeIdentifier('');
      setIsSuccess(true);
      onSuccess?.();
      
      // Auto-close modal if delay is set
      if (autoCloseDelay > 0) {
        successTimeoutRef.current = setTimeout(() => {
          setIsSuccess(false);
          handleClose();
        }, autoCloseDelay);
      }
    } catch (err: any) {
      console.warn('ReferrSki invitation error:', err);
      
      let errorMsg = 'Something went wrong, please try again.';
      
      // Handle specific error cases
      if (err.message?.includes('invite limit') || err.message?.includes('cannot invite')) {
        errorMsg = 'You cannot invite people right now, try again later.';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMsg = 'Network error. Please check your connection and try again.';
      } else if (err.message?.includes('unauthorized') || err.message?.includes('authentication')) {
        errorMsg = 'Authentication error. Please contact support.';
      } else if (err.message?.includes('already invited') || err.message?.includes('duplicate')) {
        errorMsg = 'This person has already been invited.';
      } else if (err.message?.includes('invalid email')) {
        errorMsg = 'Please enter a valid email address.';
      }
      
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isSuccess) {
      return (
        <View style={[styles.successContainer, style.successContainer]}>
          <Text style={[styles.successIcon, style.successIcon]}>✓</Text>
          <Text style={[styles.successText, style.successText]}>
            {successMessage}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <Text style={[styles.title, style.title]}>
          {texts.title || 'Invite Friends'}
        </Text>
        <Text style={[styles.description, style.description]}>
          {texts.description || 'Share this app with your friends and family'}
        </Text>
        
        <View style={styles.formContainer}>
        <View style={[styles.inputContainer, style.inputContainer]}>
          <TextInput
            ref={nameInputRef}
            style={[styles.input, style.fromInput || style.input]}
            placeholder={texts.fromPlaceholder || 'Your name'}
            placeholderTextColor="#a1a1aa"
            value={fromName}
            onChangeText={(text) => {
              setFromName(text);
              setError(null); // Clear error when user types
            }}
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
            maxLength={50}
            accessible={true}
            accessibilityLabel="Your name"
            accessibilityHint="Enter your name to be shown in the invitation"
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
            editable={!isLoading}
          />
        </View>
        <View style={[styles.inputContainer, style.inputContainer]}>
          <TextInput
            ref={emailInputRef}
            style={[styles.input, style.input]}
            placeholder={texts.placeholder || 'Enter friend\'s email'}
            placeholderTextColor="#a1a1aa"
            value={inviteeIdentifier}
            onChangeText={(text) => {
              setInviteeIdentifier(text);
              setError(null); // Clear error when user types
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            autoCorrect={false}
            spellCheck={false}
            maxLength={254} // RFC 5321 email length limit
            accessible={true}
            accessibilityLabel="Friend's email address"
            accessibilityHint="Enter the email address of the person you want to invite"
            returnKeyType="send"
            onSubmitEditing={handleInvite}
            editable={!isLoading}
          />
        </View>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.error, style.error]} accessible={true} accessibilityRole="alert">
              {error}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled, style.button]}
          onPress={handleInvite}
          disabled={isLoading}
          accessible={true}
          accessibilityLabel={isLoading ? (texts.loadingText || 'Sending invitation') : (texts.button || 'Send Invitation')}
          accessibilityHint="Send referral invitation to your friend"
          accessibilityRole="button"
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fafafa" size="small" style={styles.loadingSpinner} />
              <Text style={[styles.buttonText, style.buttonText, styles.loadingText]}>
                {texts.loadingText || 'Sending...'}
              </Text>
            </View>
          ) : (
            <Text style={[styles.buttonText, style.buttonText]}>
              {texts.button || 'Send Invitation'}
            </Text>
          )}
        </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableOpacity 
            style={[styles.overlay, style.overlay]}
            activeOpacity={1}
            onPress={handleClose}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                <View style={[
                  styles.modalCard, 
                  style.modalCard || style.container,
                  { maxHeight: screenData.height * 0.8 }
                ]}>
                  <TouchableOpacity 
                    style={[styles.closeButton, style.closeButton]} 
                    onPress={handleClose}
                    accessible={true}
                    accessibilityLabel="Close invitation modal"
                    accessibilityRole="button"
                  >
                    <Text style={[styles.closeButtonText, style.closeButtonText]}>✕</Text>
                  </TouchableOpacity>
                  {renderContent()}
                </View>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.80)',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  contentContainer: {
    padding: 24,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0f0f0f',
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  inputContainer: {
    marginBottom: 16,
    width: '100%',
  },
  input: {
    width: '100%',
    height: 44,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
    borderRadius: 6,
    fontSize: 14,
    color: '#0f0f0f',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  button: {
    width: '100%',
    height: 44,
    backgroundColor: '#0f0f0f',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  buttonDisabled: {
    backgroundColor: '#a1a1aa',
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  buttonText: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.25,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    marginRight: 8,
  },
  loadingText: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    marginBottom: 16,
    paddingHorizontal: 0,
    paddingVertical: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 12,
    fontWeight: '500',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 6,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#71717a',
    fontWeight: '500',
    lineHeight: 16,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  successIcon: {
    fontSize: 48,
    color: '#16a34a',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 16,
    color: '#0f0f0f',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
}); 