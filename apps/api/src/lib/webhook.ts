import { WebhookPayload } from '@/types/webhook';

/**
 * Sends a webhook notification to the specified URL
 * 
 * @param webhookUrl - The URL to send the webhook to
 * @param authHeader - Optional authorization header to include
 * @param payload - The webhook payload to send
 * @returns Promise resolving to the fetch response
 */
export async function sendWebhook(
  webhookUrl: string,
  authHeader: string | null,
  payload: WebhookPayload
): Promise<Response> {
  if (!webhookUrl) {
    throw new Error('No webhook URL provided');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  return fetch(webhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
} 