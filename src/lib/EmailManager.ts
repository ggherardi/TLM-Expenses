export type EmailAttachment = {
  path: string;
  mimeType?: string;
};

export type EmailSendResult =
  | { ok: true; status: MailComposer.MailComposerStatus }
  | { ok: false; reason: 'not_available' | 'error'; error?: unknown };

export const EmailManager = {
  async send(
    to: string[],
    subject: string,
    body: string,
    attachments?: (string | EmailAttachment)[],
  ): Promise<EmailSendResult> {
    // Lazy load to avoid crashing if the native module is not present
    let MailComposer: typeof import('expo-mail-composer') | null = null;
    try {
      MailComposer = require('expo-mail-composer');
    } catch (error) {
      console.log('expo-mail-composer module not available', error);
      return { ok: false, reason: 'not_available' };
    }

    try {
      const available = await MailComposer.isAvailableAsync();
      if (!available) {
        console.log('Cannot open default email app (MailComposer not available)');
        return { ok: false, reason: 'not_available' };
      }

      const normalizedAttachments = attachments?.map(att => {
        if (typeof att === 'string') {
          return att;
        }
        return att.path;
      });

      const result = await MailComposer.composeAsync({
        subject,
        recipients: to,
        body,
        attachments: normalizedAttachments,
        isHtml: true,
      });

      console.log('MailComposer result:', result.status);
      return { ok: true, status: result.status };
    } catch (error) {
      console.log('MailComposer error:', error);
      return { ok: false, reason: 'error', error };
    }
  },
};
