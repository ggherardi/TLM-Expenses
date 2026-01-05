import { Linking } from 'react-native';
import Share from 'react-native-share';

export type EmailAttachment = {
  path: string;
  mimeType?: string;
};

export type EmailSendResult =
  | { ok: true; status: string }
  | { ok: false; reason: 'not_available' | 'error'; error?: unknown };

export const EmailManager = {
  async send(
    to: string[],
    subject: string,
    body: string,
    attachments?: (string | EmailAttachment)[],
  ): Promise<EmailSendResult> {
    // Use react-native-share to open chooser with attachments (better support across devices)
    try {
      const urls =
        attachments?.map(att => {
          if (typeof att === 'string') {
            const sanitized = att.startsWith('file://') ? att : `file://${att}`;
            return sanitized;
          }
          const sanitized = att.path.startsWith('file://') ? att.path : `file://${att.path}`;
          return sanitized;
        }) ?? [];

      const result = await Share.open({
        title: subject,
        message: body,
        subject,
        urls: urls.length ? urls : undefined,
        failOnCancel: false,
      });
      console.log('Share result:', result);
      return { ok: true, status: 'shared' };
    } catch (error) {
      console.log('Share error, falling back to mailto', error);
    }

    // Fallback: mailto without attachments
    try {
      const mailto = `mailto:${encodeURIComponent(to.join(','))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      const canOpen = await Linking.canOpenURL(mailto);
      if (canOpen) {
        await Linking.openURL(mailto);
        return { ok: true, status: 'mailto' };
      }
      return { ok: false, reason: 'not_available' };
    } catch (error2) {
      console.log('mailto fallback error', error2);
      return { ok: false, reason: 'error', error: error2 };
    }
  },
};
