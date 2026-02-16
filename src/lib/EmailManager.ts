import { Linking, Platform } from 'react-native';
import Share, { Social } from 'react-native-share';

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
    const urls =
      attachments?.map(att => {
        if (typeof att === 'string') {
          const sanitized = att.startsWith('file://') ? att : `file://${att}`;
          return sanitized;
        }
        const sanitized = att.path.startsWith('file://') ? att.path : `file://${att.path}`;
        return sanitized;
      }) ?? [];
    const primaryUrl = urls[0];
    const primaryMime =
      attachments && attachments.length && typeof attachments[0] !== 'string'
        ? attachments[0].mimeType
        : undefined;
    const primaryFilename = primaryUrl ? primaryUrl.split('/').pop() : undefined;
    if (!primaryUrl) {
      return { ok: false, reason: 'not_available' };
    }
    const fallbackToMailto = async (): Promise<EmailSendResult> => {
      try {
        const mailto = `mailto:${encodeURIComponent(to.join(','))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        await Linking.openURL(mailto);
        return { ok: true, status: 'mailto' };
      } catch (error) {
        console.log('mailto fallback error', error);
        return { ok: false, reason: 'not_available', error };
      }
    };

    // Try to open the email composer directly with recipients prefilled
    try {
      if (Platform.OS === 'android') {
        // Android: target email app directly (no generic chooser)
        const result = await Share.shareSingle({
          social: Social.Email,
          url: primaryUrl,
          type: primaryMime ?? 'application/pdf',
          filename: primaryFilename,
          subject,
          message: body,
          title: subject,
          email: to.join(','),
          recipient: to.join(','),
        });
        console.log('Share result (android shareSingle email):', result);
        return { ok: true, status: 'shared' };
      } else {
        const result = await Share.shareSingle({
          title: subject,
          message: body,
          subject,
          urls: urls.length ? urls : undefined,
          url: primaryUrl,
          filename: primaryFilename,
          type: primaryMime ?? 'application/pdf',
          social: Social.Email,
          email: to.join(','),
        });
        console.log('Share result (ios shareSingle):', result);
        return { ok: true, status: 'shared' };
      }
    } catch (error) {
      console.log('Share email error', error);
      if (Platform.OS === 'android') {
        // On Android avoid generic file-share sheet and fall back to mailto.
        return fallbackToMailto();
      }
    }

    // Fallback: generic chooser (lets user pick any app)
    try {
      await Share.open({
        title: subject,
        message: body,
        subject,
        url: primaryUrl,
        urls: urls.length ? urls : undefined,
      });
      return { ok: true, status: 'shared_chooser' };
    } catch (error2) {
      console.log('Share chooser error, falling back to mailto', error2);
    }

    // Fallback: mailto without attachments
    return fallbackToMailto();
  },
};
