interface SendArgs {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private readonly apiKey: string | undefined;
  private readonly from: string;
  private resendClient: { emails: { send: (args: { from: string; to: string; subject: string; text: string; html?: string }) => Promise<unknown> } } | null = null;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.from = process.env.EMAIL_FROM ?? 'FormStack <no-reply@formstack.dev>';
  }

  private async ensureClient() {
    if (!this.apiKey) return null;
    if (this.resendClient) return this.resendClient;
    const { Resend } = await import('resend');
    this.resendClient = new Resend(this.apiKey) as unknown as typeof this.resendClient;
    return this.resendClient;
  }

  async send(args: SendArgs): Promise<{ delivered: boolean }> {
    const client = await this.ensureClient();
    if (!client) {
      console.info('[email:stub] would send to=%s subject="%s"', args.to, args.subject);
      return { delivered: false };
    }
    try {
      await client.emails.send({ from: this.from, ...args });
      return { delivered: true };
    } catch (err) {
      console.warn('[email] send failed', err);
      return { delivered: false };
    }
  }
}

export const emailService = new EmailService();
