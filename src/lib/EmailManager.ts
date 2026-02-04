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
    // Try to open the email composer directly with recipients prefilled
    try {
      if (Platform.OS === 'android') {
        // First try email target directly with single attachment (most reliable for Gmail)
        if (primaryUrl) {
          const result = await Share.shareSingle({
            social: Social.Email,
            url: primaryUrl,
            type: primaryMime ?? 'application/pdf',
            filename: primaryFilename,
            subject,
            message: body,
            title: subject,
            email: to.join(','),
          });
          console.log('Share result (android shareSingle email):', result);
          return { ok: true, status: 'shared' };
        }
        // Fallback: chooser with urls
        const result = await Share.open({
          title: subject,
          message: body,
          subject,
          urls: urls.length ? urls : undefined,
          failOnCancel: false,
        });
        console.log('Share result (android open):', result);
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
      console.log('Share email error, falling back to chooser', error);
    }

    // Fallback: generic chooser (lets user pick any app)
    try {
      await Share.open({
        title: subject,
        message: body,
        subject,
        urls: urls.length ? urls : undefined,
        failOnCancel: false,
      });
      return { ok: true, status: 'shared_chooser' };
    } catch (error2) {
      console.log('Share chooser error, falling back to mailto', error2);
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
