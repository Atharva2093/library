import type { Notification } from '@/lib/types/notifications';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailTemplateService {
  private static getBaseTemplate(
    title: string,
    content: string,
    actionUrl?: string,
    actionText?: string
  ): EmailTemplate {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px;
        }
        .notification-content {
            background-color: #f8fafc;
            border-left: 4px solid #10b981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 4px 4px 0;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 500;
            margin: 20px 0;
        }
        .action-button:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 40px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
        }
        .footer a {
            color: #10b981;
            text-decoration: none;
        }
        .priority-urgent { border-left-color: #dc2626; }
        .priority-high { border-left-color: #ea580c; }
        .priority-medium { border-left-color: #ca8a04; }
        .priority-low { border-left-color: #10b981; }
        @media (max-width: 480px) {
            body { padding: 10px; }
            .header, .content, .footer { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 BookStore Manager</h1>
        </div>
        
        <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">${title}</h2>
            
            <div class="notification-content">
                ${content}
            </div>
            
            ${
              actionUrl && actionText
                ? `
            <div style="text-align: center;">
                <a href="${actionUrl}" class="action-button">${actionText}</a>
            </div>
            `
                : ''
            }
        </div>
        
        <div class="footer">
            <p>
                This notification was sent from your BookStore Management System.<br>
                <a href="#">Manage notification preferences</a> | 
                <a href="#">Unsubscribe</a>
            </p>
            <p style="margin-top: 10px; font-size: 12px; color: #9ca3af;">
                © 2024 BookStore Manager. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;

    const text = `
${title}

${content.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n')}

${actionUrl && actionText ? `${actionText}: ${actionUrl}` : ''}

--
This notification was sent from your BookStore Management System.
Manage notification preferences or unsubscribe at: ${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications
`;

    return {
      subject: title,
      html: html.trim(),
      text: text.trim(),
    };
  }

  static generateNotificationEmail(notification: Notification): EmailTemplate {
    const priorityClass = `priority-${notification.priority}`;

    switch (notification.type) {
      case 'sale':
        return this.getSaleNotificationTemplate(notification);
      case 'inventory':
        return this.getInventoryNotificationTemplate(notification);
      case 'customer':
        return this.getCustomerNotificationTemplate(notification);
      case 'system':
        return this.getSystemNotificationTemplate(notification);
      case 'security':
        return this.getSecurityNotificationTemplate(notification);
      case 'maintenance':
        return this.getMaintenanceNotificationTemplate(notification);
      default:
        return this.getGeneralNotificationTemplate(notification);
    }
  }

  private static getSaleNotificationTemplate(notification: Notification): EmailTemplate {
    const content = `
      <h3 style="color: #10b981; margin: 0 0 15px 0;">💰 ${notification.title}</h3>
      <p>${notification.message}</p>
      
      ${
        notification.metadata
          ? `
      <div style="margin: 15px 0;">
        ${notification.metadata.orderNumber ? `<p><strong>Order Number:</strong> ${notification.metadata.orderNumber}</p>` : ''}
        ${notification.metadata.amount ? `<p><strong>Amount:</strong> $${notification.metadata.amount}</p>` : ''}
        ${notification.metadata.customer ? `<p><strong>Customer:</strong> ${notification.metadata.customer}</p>` : ''}
        ${notification.metadata.items ? `<p><strong>Items:</strong> ${notification.metadata.items}</p>` : ''}
      </div>
      `
          : ''
      }
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        <em>Received at ${new Date(notification.timestamp).toLocaleString()}</em>
      </p>
    `;

    return this.getBaseTemplate(
      notification.title,
      content,
      notification.actionUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/sales`,
      'View Sales Dashboard'
    );
  }

  private static getInventoryNotificationTemplate(notification: Notification): EmailTemplate {
    const content = `
      <h3 style="color: #ea580c; margin: 0 0 15px 0;">📦 ${notification.title}</h3>
      <p>${notification.message}</p>
      
      ${
        notification.metadata
          ? `
      <div style="margin: 15px 0;">
        ${notification.metadata.bookTitle ? `<p><strong>Book:</strong> ${notification.metadata.bookTitle}</p>` : ''}
        ${notification.metadata.isbn ? `<p><strong>ISBN:</strong> ${notification.metadata.isbn}</p>` : ''}
        ${notification.metadata.currentStock ? `<p><strong>Current Stock:</strong> ${notification.metadata.currentStock}</p>` : ''}
        ${notification.metadata.minThreshold ? `<p><strong>Minimum Threshold:</strong> ${notification.metadata.minThreshold}</p>` : ''}
        ${notification.metadata.supplier ? `<p><strong>Supplier:</strong> ${notification.metadata.supplier}</p>` : ''}
      </div>
      `
          : ''
      }
      
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; padding: 15px; margin: 15px 0;">
        <p style="margin: 0; color: #92400e;">
          <strong>⚠️ Action Required:</strong> 
          ${notification.priority === 'urgent' ? 'Immediate restocking recommended' : 'Consider restocking soon'}
        </p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        <em>Received at ${new Date(notification.timestamp).toLocaleString()}</em>
      </p>
    `;

    return this.getBaseTemplate(
      notification.title,
      content,
      notification.actionUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/inventory`,
      'View Inventory'
    );
  }

  private static getCustomerNotificationTemplate(notification: Notification): EmailTemplate {
    const content = `
      <h3 style="color: #3b82f6; margin: 0 0 15px 0;">👥 ${notification.title}</h3>
      <p>${notification.message}</p>
      
      ${
        notification.metadata
          ? `
      <div style="margin: 15px 0;">
        ${notification.metadata.customerName ? `<p><strong>Customer:</strong> ${notification.metadata.customerName}</p>` : ''}
        ${notification.metadata.email ? `<p><strong>Email:</strong> ${notification.metadata.email}</p>` : ''}
        ${notification.metadata.phone ? `<p><strong>Phone:</strong> ${notification.metadata.phone}</p>` : ''}
        ${notification.metadata.membershipType ? `<p><strong>Membership:</strong> ${notification.metadata.membershipType}</p>` : ''}
        ${notification.metadata.totalSpent ? `<p><strong>Total Spent:</strong> $${notification.metadata.totalSpent}</p>` : ''}
      </div>
      `
          : ''
      }
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        <em>Received at ${new Date(notification.timestamp).toLocaleString()}</em>
      </p>
    `;

    return this.getBaseTemplate(
      notification.title,
      content,
      notification.actionUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/customers`,
      'View Customer Details'
    );
  }

  private static getSystemNotificationTemplate(notification: Notification): EmailTemplate {
    const content = `
      <h3 style="color: #6b7280; margin: 0 0 15px 0;">⚙️ ${notification.title}</h3>
      <p>${notification.message}</p>
      
      ${
        notification.metadata
          ? `
      <div style="margin: 15px 0;">
        ${notification.metadata.component ? `<p><strong>Component:</strong> ${notification.metadata.component}</p>` : ''}
        ${notification.metadata.version ? `<p><strong>Version:</strong> ${notification.metadata.version}</p>` : ''}
        ${notification.metadata.status ? `<p><strong>Status:</strong> ${notification.metadata.status}</p>` : ''}
        ${notification.metadata.affectedUsers ? `<p><strong>Affected Users:</strong> ${notification.metadata.affectedUsers}</p>` : ''}
      </div>
      `
          : ''
      }
      
      ${
        notification.priority === 'urgent'
          ? `
      <div style="background-color: #fee2e2; border: 1px solid #dc2626; border-radius: 4px; padding: 15px; margin: 15px 0;">
        <p style="margin: 0; color: #991b1b;">
          <strong>🚨 Critical System Alert:</strong> Immediate attention may be required.
        </p>
      </div>
      `
          : ''
      }
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        <em>Received at ${new Date(notification.timestamp).toLocaleString()}</em>
      </p>
    `;

    return this.getBaseTemplate(
      notification.title,
      content,
      notification.actionUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/system`,
      'View System Status'
    );
  }

  private static getSecurityNotificationTemplate(notification: Notification): EmailTemplate {
    const content = `
      <h3 style="color: #dc2626; margin: 0 0 15px 0;">🔒 ${notification.title}</h3>
      <p>${notification.message}</p>
      
      ${
        notification.metadata
          ? `
      <div style="margin: 15px 0;">
        ${notification.metadata.ipAddress ? `<p><strong>IP Address:</strong> ${notification.metadata.ipAddress}</p>` : ''}
        ${notification.metadata.userAgent ? `<p><strong>Browser:</strong> ${notification.metadata.userAgent}</p>` : ''}
        ${notification.metadata.location ? `<p><strong>Location:</strong> ${notification.metadata.location}</p>` : ''}
        ${notification.metadata.attemptCount ? `<p><strong>Attempt Count:</strong> ${notification.metadata.attemptCount}</p>` : ''}
      </div>
      `
          : ''
      }
      
      <div style="background-color: #fee2e2; border: 1px solid #dc2626; border-radius: 4px; padding: 15px; margin: 15px 0;">
        <p style="margin: 0; color: #991b1b;">
          <strong>🛡️ Security Alert:</strong> If this wasn't you, please secure your account immediately.
        </p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        <em>Detected at ${new Date(notification.timestamp).toLocaleString()}</em>
      </p>
    `;

    return this.getBaseTemplate(
      notification.title,
      content,
      notification.actionUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/security`,
      'Review Security Settings'
    );
  }

  private static getMaintenanceNotificationTemplate(notification: Notification): EmailTemplate {
    const content = `
      <h3 style="color: #7c3aed; margin: 0 0 15px 0;">🔧 ${notification.title}</h3>
      <p>${notification.message}</p>
      
      ${
        notification.metadata
          ? `
      <div style="margin: 15px 0;">
        ${notification.metadata.scheduledTime ? `<p><strong>Scheduled Time:</strong> ${notification.metadata.scheduledTime}</p>` : ''}
        ${notification.metadata.duration ? `<p><strong>Expected Duration:</strong> ${notification.metadata.duration}</p>` : ''}
        ${notification.metadata.affectedServices ? `<p><strong>Affected Services:</strong> ${notification.metadata.affectedServices}</p>` : ''}
        ${notification.metadata.maintenanceType ? `<p><strong>Maintenance Type:</strong> ${notification.metadata.maintenanceType}</p>` : ''}
      </div>
      `
          : ''
      }
      
      <div style="background-color: #f3f4f6; border: 1px solid #9ca3af; border-radius: 4px; padding: 15px; margin: 15px 0;">
        <p style="margin: 0; color: #374151;">
          <strong>📋 What to Expect:</strong> 
          ${notification.metadata?.impact || 'Some services may be temporarily unavailable during maintenance.'}
        </p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        <em>Scheduled for ${new Date(notification.timestamp).toLocaleString()}</em>
      </p>
    `;

    return this.getBaseTemplate(
      notification.title,
      content,
      notification.actionUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/maintenance`,
      'View Maintenance Schedule'
    );
  }

  private static getGeneralNotificationTemplate(notification: Notification): EmailTemplate {
    const content = `
      <h3 style="color: #059669; margin: 0 0 15px 0;">📄 ${notification.title}</h3>
      <p>${notification.message}</p>
      
      ${
        notification.metadata && Object.keys(notification.metadata).length > 0
          ? `
      <div style="margin: 15px 0;">
        ${Object.entries(notification.metadata)
          .map(
            ([key, value]) =>
              `<p><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</p>`
          )
          .join('')}
      </div>
      `
          : ''
      }
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
        <em>Received at ${new Date(notification.timestamp).toLocaleString()}</em>
      </p>
    `;

    return this.getBaseTemplate(
      notification.title,
      content,
      notification.actionUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      'View Dashboard'
    );
  }

  // Daily digest template
  static generateDailyDigestEmail(notifications: Notification[], date: Date): EmailTemplate {
    const sortedNotifications = notifications.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    const urgentCount = notifications.filter(n => n.priority === 'urgent').length;
    const highCount = notifications.filter(n => n.priority === 'high').length;

    const content = `
      <h3 style="color: #059669; margin: 0 0 15px 0;">📊 Daily Activity Summary</h3>
      <p>Here's what happened in your bookstore on ${date.toLocaleDateString()}:</p>
      
      <div style="margin: 20px 0;">
        <h4 style="color: #374151; margin: 0 0 10px 0;">Summary</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li><strong>${notifications.length}</strong> total notifications</li>
          ${urgentCount > 0 ? `<li><strong style="color: #dc2626;">${urgentCount}</strong> urgent alerts</li>` : ''}
          ${highCount > 0 ? `<li><strong style="color: #ea580c;">${highCount}</strong> high priority items</li>` : ''}
        </ul>
      </div>
      
      <div style="margin: 20px 0;">
        <h4 style="color: #374151; margin: 0 0 15px 0;">Recent Notifications</h4>
        ${sortedNotifications
          .slice(0, 10)
          .map(
            notification => `
          <div style="border-left: 4px solid ${
            notification.priority === 'urgent'
              ? '#dc2626'
              : notification.priority === 'high'
                ? '#ea580c'
                : notification.priority === 'medium'
                  ? '#ca8a04'
                  : '#10b981'
          }; padding: 10px 15px; margin: 10px 0; background-color: #f8fafc; border-radius: 0 4px 4px 0;">
            <h5 style="margin: 0 0 5px 0; color: #1f2937;">${notification.title}</h5>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">${notification.message}</p>
            <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 12px;">
              ${new Date(notification.timestamp).toLocaleTimeString()}
            </p>
          </div>
        `
          )
          .join('')}
        
        ${
          notifications.length > 10
            ? `
          <p style="text-align: center; margin: 15px 0; color: #6b7280; font-style: italic;">
            And ${notifications.length - 10} more notifications...
          </p>
        `
            : ''
        }
      </div>
    `;

    return this.getBaseTemplate(
      `Daily Digest - ${date.toLocaleDateString()}`,
      content,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/activity`,
      'View Full Activity Feed'
    );
  }

  // Weekly summary template
  static generateWeeklyReportEmail(
    notifications: Notification[],
    startDate: Date,
    endDate: Date,
    stats: {
      totalSales: number;
      totalOrders: number;
      lowStockItems: number;
      newCustomers: number;
    }
  ): EmailTemplate {
    const content = `
      <h3 style="color: #059669; margin: 0 0 15px 0;">📈 Weekly Report</h3>
      <p>Your bookstore performance summary for ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}:</p>
      
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
        <div style="background-color: #f0fdf4; border: 1px solid #10b981; border-radius: 6px; padding: 15px; text-align: center;">
          <h4 style="margin: 0 0 5px 0; color: #059669;">Total Sales</h4>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">$${stats.totalSales.toLocaleString()}</p>
        </div>
        <div style="background-color: #f0f9ff; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px; text-align: center;">
          <h4 style="margin: 0 0 5px 0; color: #2563eb;">Total Orders</h4>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">${stats.totalOrders}</p>
        </div>
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; text-align: center;">
          <h4 style="margin: 0 0 5px 0; color: #d97706;">Low Stock Items</h4>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">${stats.lowStockItems}</p>
        </div>
        <div style="background-color: #f3e8ff; border: 1px solid #8b5cf6; border-radius: 6px; padding: 15px; text-align: center;">
          <h4 style="margin: 0 0 5px 0; color: #7c3aed;">New Customers</h4>
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1f2937;">${stats.newCustomers}</p>
        </div>
      </div>
      
      <div style="margin: 20px 0;">
        <h4 style="color: #374151; margin: 0 0 15px 0;">Activity Summary</h4>
        <p><strong>${notifications.length}</strong> notifications this week</p>
        
        ${
          notifications.filter(n => n.priority === 'urgent').length > 0
            ? `
          <div style="background-color: #fee2e2; border: 1px solid #dc2626; border-radius: 4px; padding: 10px; margin: 10px 0;">
            <p style="margin: 0; color: #991b1b;">
              <strong>⚠️ Urgent items requiring attention:</strong> 
              ${notifications.filter(n => n.priority === 'urgent').length}
            </p>
          </div>
        `
            : ''
        }
      </div>
    `;

    return this.getBaseTemplate(
      `Weekly Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      content,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/reports`,
      'View Detailed Reports'
    );
  }
}

export default EmailTemplateService;
