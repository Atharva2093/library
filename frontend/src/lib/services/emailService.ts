import type { Notification, NotificationPreferences } from '@/lib/types/notifications';
import { EmailTemplateService, type EmailTemplate } from './emailTemplateService';

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailQueueItem {
  id: string;
  to: string;
  template: EmailTemplate;
  scheduledFor: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  createdAt: Date;
  sentAt?: Date;
  error?: string;
}

export class EmailService {
  private config: EmailConfig;
  private queue: EmailQueueItem[] = [];
  private isProcessing = false;
  private retryDelay = 5000; // 5 seconds
  private maxRetries = 3;

  constructor(config: EmailConfig) {
    this.config = config;
    this.startQueueProcessor();
  }

  /**
   * Send a notification email
   */
  async sendNotificationEmail(
    notification: Notification,
    userEmail: string,
    preferences: NotificationPreferences
  ): Promise<EmailSendResult> {
    // Check if email notifications are enabled
    if (!preferences.emailNotifications) {
      return { success: false, error: 'Email notifications disabled' };
    }

    // Check if this category is enabled for email
    const categorySettings = preferences.categories[notification.category];
    if (!categorySettings.enabled || !categorySettings.channels.includes('email')) {
      return { success: false, error: 'Email not enabled for this category' };
    }

    // Check quiet hours
    if (this.isQuietHours(preferences)) {
      return { success: false, error: 'Quiet hours active' };
    }

    // Generate email template
    const template = EmailTemplateService.generateNotificationEmail(notification);

    // Add to queue
    const queueItem: EmailQueueItem = {
      id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to: userEmail,
      template,
      scheduledFor: new Date(),
      attempts: 0,
      maxAttempts: this.maxRetries,
      status: 'pending',
      createdAt: new Date(),
    };

    this.queue.push(queueItem);
    return { success: true, messageId: queueItem.id };
  }

  /**
   * Send daily digest email
   */
  async sendDailyDigest(
    notifications: Notification[],
    userEmail: string,
    preferences: NotificationPreferences,
    date: Date = new Date()
  ): Promise<EmailSendResult> {
    if (!preferences.frequency.daily) {
      return { success: false, error: 'Daily digest disabled' };
    }

    const template = EmailTemplateService.generateDailyDigestEmail(notifications, date);

    const queueItem: EmailQueueItem = {
      id: `digest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to: userEmail,
      template,
      scheduledFor: new Date(),
      attempts: 0,
      maxAttempts: this.maxRetries,
      status: 'pending',
      createdAt: new Date(),
    };

    this.queue.push(queueItem);
    return { success: true, messageId: queueItem.id };
  }

  /**
   * Send weekly report email
   */
  async sendWeeklyReport(
    notifications: Notification[],
    userEmail: string,
    preferences: NotificationPreferences,
    startDate: Date,
    endDate: Date,
    stats: {
      totalSales: number;
      totalOrders: number;
      lowStockItems: number;
      newCustomers: number;
    }
  ): Promise<EmailSendResult> {
    if (!preferences.frequency.weekly) {
      return { success: false, error: 'Weekly report disabled' };
    }

    const template = EmailTemplateService.generateWeeklyReportEmail(
      notifications,
      startDate,
      endDate,
      stats
    );

    const queueItem: EmailQueueItem = {
      id: `weekly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      to: userEmail,
      template,
      scheduledFor: new Date(),
      attempts: 0,
      maxAttempts: this.maxRetries,
      status: 'pending',
      createdAt: new Date(),
    };

    this.queue.push(queueItem);
    return { success: true, messageId: queueItem.id };
  }

  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const [startHour, startMinute] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHours.end.split(':').map(Number);

    const startTime = startHour * 100 + startMinute;
    const endTime = endHour * 100 + endMinute;

    if (startTime <= endTime) {
      // Same day range (e.g., 22:00 to 06:00)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight range (e.g., 22:00 to 06:00)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Start the email queue processor
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      this.processQueue();
    }, 1000); // Process queue every second
  }

  /**
   * Process pending emails in the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    try {
      const pendingEmails = this.queue.filter(
        item => item.status === 'pending' && item.scheduledFor <= new Date()
      );

      for (const emailItem of pendingEmails.slice(0, 5)) {
        // Process up to 5 at a time
        await this.processEmailItem(emailItem);
      }
    } catch (error) {
      console.error('Error processing email queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single email item
   */
  private async processEmailItem(emailItem: EmailQueueItem): Promise<void> {
    emailItem.status = 'sending';
    emailItem.attempts++;

    try {
      const result = await this.sendEmail(emailItem.to, emailItem.template);

      if (result.success) {
        emailItem.status = 'sent';
        emailItem.sentAt = new Date();
        // Remove from queue after successful send
        this.removeFromQueue(emailItem.id);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      emailItem.error = error instanceof Error ? error.message : 'Unknown error';

      if (emailItem.attempts >= emailItem.maxAttempts) {
        emailItem.status = 'failed';
        console.error(
          `Failed to send email after ${emailItem.maxAttempts} attempts:`,
          emailItem.error
        );
        // Remove from queue after max attempts
        this.removeFromQueue(emailItem.id);
      } else {
        emailItem.status = 'pending';
        emailItem.scheduledFor = new Date(Date.now() + this.retryDelay * emailItem.attempts);
      }
    }
  }

  /**
   * Remove email from queue
   */
  private removeFromQueue(emailId: string): void {
    const index = this.queue.findIndex(item => item.id === emailId);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  /**
   * Send email using configured SMTP settings
   */
  private async sendEmail(to: string, template: EmailTemplate): Promise<EmailSendResult> {
    // In a real implementation, this would use a service like Nodemailer, SendGrid, or AWS SES
    // For now, we'll simulate the email sending

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

      // Simulate occasional failures for testing
      if (Math.random() < 0.1) {
        // 10% failure rate for testing
        throw new Error('SMTP server temporarily unavailable');
      }

      // Mock successful send
      const messageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Log the email (in real implementation, this would be sent via SMTP)
      console.log('Email sent:', {
        to,
        subject: template.subject,
        messageId,
        timestamp: new Date().toISOString(),
      });

      return { success: true, messageId };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    pending: number;
    sending: number;
    failed: number;
    totalQueued: number;
  } {
    return {
      pending: this.queue.filter(item => item.status === 'pending').length,
      sending: this.queue.filter(item => item.status === 'sending').length,
      failed: this.queue.filter(item => item.status === 'failed').length,
      totalQueued: this.queue.length,
    };
  }

  /**
   * Get queue items for monitoring
   */
  getQueueItems(): EmailQueueItem[] {
    return [...this.queue].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Clear failed emails from queue
   */
  clearFailedEmails(): number {
    const failedCount = this.queue.filter(item => item.status === 'failed').length;
    this.queue = this.queue.filter(item => item.status !== 'failed');
    return failedCount;
  }

  /**
   * Retry failed emails
   */
  retryFailedEmails(): number {
    const failedEmails = this.queue.filter(item => item.status === 'failed');
    failedEmails.forEach(email => {
      email.status = 'pending';
      email.attempts = 0;
      email.scheduledFor = new Date();
      email.error = undefined;
    });
    return failedEmails.length;
  }

  /**
   * Update email configuration
   */
  updateConfig(newConfig: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Test email configuration
   */
  async testEmailConfig(testEmail: string): Promise<EmailSendResult> {
    const testTemplate: EmailTemplate = {
      subject: 'BookStore Manager - Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #10b981;">Email Configuration Test</h2>
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <p>If you receive this email, your BookStore Manager notification system is properly configured.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            <em>Sent at ${new Date().toLocaleString()}</em>
          </p>
        </div>
      `,
      text: `
Email Configuration Test

This is a test email to verify your email configuration is working correctly.
If you receive this email, your BookStore Manager notification system is properly configured.

Sent at ${new Date().toLocaleString()}
      `,
    };

    return this.sendEmail(testEmail, testTemplate);
  }
}

// Export default configuration
export const defaultEmailConfig: EmailConfig = {
  smtpHost: process.env.SMTP_HOST || 'localhost',
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  fromEmail: process.env.FROM_EMAIL || 'noreply@bookstore.com',
  fromName: process.env.FROM_NAME || 'BookStore Manager',
};

export default EmailService;
