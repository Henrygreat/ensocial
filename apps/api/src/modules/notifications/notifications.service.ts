import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(config.get<string>('resend.apiKey'));
    this.fromEmail = config.get<string>('resend.fromEmail') ?? 'EnSocial <noreply@ensocial.co>';
    this.appUrl = config.get<string>('appUrl') ?? 'http://localhost:5173';
  }

  @OnEvent('auth.magic_link')
  async sendMagicLink(payload: { email: string; link: string; name: string }) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: payload.email,
        subject: 'Sign in to EnSocial',
        html: this.buildMagicLinkEmail(payload.name, payload.link),
      });
    } catch (error) {
      this.logger.error('Failed to send magic link email', error);
    }
  }

  @OnEvent('user.registered')
  async sendWelcomeEmail(payload: { userId: string; email: string }) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: payload.email,
        subject: 'Welcome to EnSocial — Your AI social media OS',
        html: this.buildWelcomeEmail(),
      });
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
    }
  }

  @OnEvent('org.member_invited')
  async sendInviteEmail(payload: { orgName: string; inviteeEmail: string; role: string }) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: payload.inviteeEmail,
        subject: `You've been invited to join ${payload.orgName} on EnSocial`,
        html: this.buildInviteEmail(payload.orgName, payload.role, this.appUrl),
      });
    } catch (error) {
      this.logger.error('Failed to send invite email', error);
    }
  }

  async sendPostPublishedNotification(userId: string, email: string, postId: string) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Your post has been published',
        html: `<p>Your post has been published successfully. <a href="${this.appUrl}/content/${postId}">View post</a></p>`,
      });
    } catch (error) {
      this.logger.error('Failed to send post published notification', error);
    }
  }

  async sendPostFailedNotification(email: string, postId: string, errorMessage: string) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Post publishing failed',
        html: `<p>Your post failed to publish. Error: ${errorMessage}. <a href="${this.appUrl}/content/${postId}">View post</a></p>`,
      });
    } catch (error) {
      this.logger.error('Failed to send post failed notification', error);
    }
  }

  private buildMagicLinkEmail(name: string, link: string): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #6366f1; font-size: 24px; margin: 0;">EnSocial</h1>
  </div>
  <h2>Sign in to EnSocial</h2>
  <p>Hi ${name},</p>
  <p>Click the button below to sign in. This link expires in 15 minutes.</p>
  <div style="text-align: center; margin: 32px 0;">
    <a href="${link}" style="background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
      Sign in to EnSocial
    </a>
  </div>
  <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
</body>
</html>`;
  }

  private buildWelcomeEmail(): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <h1 style="color: #6366f1;">Welcome to EnSocial</h1>
  <p>You're in! EnSocial is your AI-powered social media operating system.</p>
  <p>Get started:</p>
  <ol>
    <li>Connect your social accounts</li>
    <li>Create your first post with AI assistance</li>
    <li>Schedule and publish across all platforms</li>
  </ol>
  <a href="${this.appUrl}/connections" style="background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
    Connect your accounts
  </a>
</body>
</html>`;
  }

  private buildInviteEmail(orgName: string, role: string, appUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <h1 style="color: #6366f1;">You've been invited</h1>
  <p>You've been invited to join <strong>${orgName}</strong> on EnSocial as a <strong>${role}</strong>.</p>
  <a href="${appUrl}/signup" style="background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
    Accept Invitation
  </a>
</body>
</html>`;
  }
}
