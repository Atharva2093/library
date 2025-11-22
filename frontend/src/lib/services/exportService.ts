// Export service for generating reports and exporting data in various formats
import type { Book, Author, Customer, Sale, Category } from '@/lib/types';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

export interface ReportData {
  books?: Book[];
  authors?: Author[];
  customers?: Customer[];
  sales?: Sale[];
  categories?: Category[];
  summary?: Record<string, any>;
}

class ExportService {
  /**
   * Export data to CSV format
   */
  async exportToCSV(
    data: any[],
    headers: string[],
    filename: string = 'export.csv'
  ): Promise<void> {
    try {
      // Create CSV content
      const csvContent = this.convertToCSV(data, headers);

      // Download file
      this.downloadFile(csvContent, filename, 'text/csv');
    } catch (error) {
      console.error('CSV export failed:', error);
      throw new Error('Failed to export CSV file');
    }
  }

  /**
   * Export data to Excel format (XLSX)
   */
  async exportToExcel(
    data: any[],
    headers: string[],
    filename: string = 'export.xlsx'
  ): Promise<void> {
    try {
      // For now, we'll use CSV format as Excel can open CSV files
      // In a real application, you'd use a library like xlsx or exceljs
      const csvContent = this.convertToCSV(data, headers);
      this.downloadFile(csvContent, filename.replace('.xlsx', '.csv'), 'text/csv');

      console.log(
        'Note: Excel export currently generates CSV format. Implement xlsx library for true Excel support.'
      );
    } catch (error) {
      console.error('Excel export failed:', error);
      throw new Error('Failed to export Excel file');
    }
  }

  /**
   * Export data to JSON format
   */
  async exportToJSON(data: any, filename: string = 'export.json'): Promise<void> {
    try {
      const jsonContent = JSON.stringify(data, null, 2);
      this.downloadFile(jsonContent, filename, 'application/json');
    } catch (error) {
      console.error('JSON export failed:', error);
      throw new Error('Failed to export JSON file');
    }
  }

  /**
   * Export data to PDF format
   */
  async exportToPDF(
    data: any[],
    headers: string[],
    title: string = 'Report',
    filename: string = 'export.pdf'
  ): Promise<void> {
    try {
      // For now, we'll generate an HTML table and suggest PDF printing
      // In a real application, you'd use a library like jsPDF or Puppeteer
      const htmlContent = this.generateHTMLTable(data, headers, title);

      // Open in new window for printing to PDF
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.print();
      } else {
        throw new Error('Unable to open print window');
      }

      console.log(
        'Note: PDF export opens print dialog. Implement jsPDF library for direct PDF generation.'
      );
    } catch (error) {
      console.error('PDF export failed:', error);
      throw new Error('Failed to export PDF file');
    }
  }

  /**
   * Generate sales report
   */
  async generateSalesReport(options: ExportOptions): Promise<void> {
    try {
      // In a real application, this would fetch data from the API with filters
      const mockSalesData = await this.getMockSalesData(options);
      const headers = ['Date', 'Customer', 'Items', 'Total Amount', 'Payment Method'];

      const reportData = mockSalesData.map((sale: any) => ({
        Date: new Date(sale.sale_date).toLocaleDateString(),
        Customer: sale.customer?.name || 'Unknown',
        Items: sale.items?.length || 0,
        'Total Amount': `$${sale.total_amount?.toFixed(2) || '0.00'}`,
        'Payment Method': sale.payment_method || 'Unknown',
      }));

      const filename = options.filename || `sales-report-${new Date().toISOString().split('T')[0]}`;
      await this.exportData(reportData, headers, options.format, filename);
    } catch (error) {
      console.error('Sales report generation failed:', error);
      throw new Error('Failed to generate sales report');
    }
  }

  /**
   * Generate inventory report
   */
  async generateInventoryReport(options: ExportOptions): Promise<void> {
    try {
      const mockInventoryData = await this.getMockInventoryData(options);
      const headers = ['Title', 'Authors', 'Category', 'Stock', 'Price', 'Status'];

      const reportData = mockInventoryData.map((book: any) => ({
        Title: book.title,
        Authors: book.authors?.map((a: any) => a.name).join(', ') || 'Unknown',
        Category: book.categories?.map((c: any) => c.name).join(', ') || 'Uncategorized',
        Stock: book.stock_quantity || 0,
        Price: `$${book.price?.toFixed(2) || '0.00'}`,
        Status: (book.stock_quantity || 0) > 0 ? 'In Stock' : 'Out of Stock',
      }));

      const filename =
        options.filename || `inventory-report-${new Date().toISOString().split('T')[0]}`;
      await this.exportData(reportData, headers, options.format, filename);
    } catch (error) {
      console.error('Inventory report generation failed:', error);
      throw new Error('Failed to generate inventory report');
    }
  }

  /**
   * Generate customer report
   */
  async generateCustomerReport(options: ExportOptions): Promise<void> {
    try {
      const mockCustomerData = await this.getMockCustomerData(options);
      const headers = ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Last Order'];

      const reportData = mockCustomerData.map((customer: any) => ({
        Name: customer.name,
        Email: customer.email,
        Phone: customer.phone || 'N/A',
        'Total Orders': customer.total_orders || 0,
        'Total Spent': `$${customer.total_spent?.toFixed(2) || '0.00'}`,
        'Last Order': customer.last_order
          ? new Date(customer.last_order).toLocaleDateString()
          : 'Never',
      }));

      const filename =
        options.filename || `customer-report-${new Date().toISOString().split('T')[0]}`;
      await this.exportData(reportData, headers, options.format, filename);
    } catch (error) {
      console.error('Customer report generation failed:', error);
      throw new Error('Failed to generate customer report');
    }
  }

  /**
   * Generate financial summary report
   */
  async generateFinancialSummary(options: ExportOptions): Promise<void> {
    try {
      const summary = await this.getFinancialSummary(options);

      const reportData = [
        { Metric: 'Total Revenue', Value: `$${summary.totalRevenue.toFixed(2)}` },
        { Metric: 'Total Orders', Value: summary.totalOrders.toString() },
        { Metric: 'Average Order Value', Value: `$${summary.averageOrderValue.toFixed(2)}` },
        { Metric: 'Top Selling Book', Value: summary.topSellingBook },
        { Metric: 'Total Customers', Value: summary.totalCustomers.toString() },
        { Metric: 'Books in Stock', Value: summary.booksInStock.toString() },
        { Metric: 'Low Stock Items', Value: summary.lowStockItems.toString() },
      ];

      const headers = ['Metric', 'Value'];
      const filename =
        options.filename || `financial-summary-${new Date().toISOString().split('T')[0]}`;
      await this.exportData(reportData, headers, options.format, filename);
    } catch (error) {
      console.error('Financial summary generation failed:', error);
      throw new Error('Failed to generate financial summary');
    }
  }

  // Private helper methods
  private async exportData(
    data: any[],
    headers: string[],
    format: string,
    filename: string
  ): Promise<void> {
    switch (format) {
      case 'csv':
        await this.exportToCSV(data, headers, `${filename}.csv`);
        break;
      case 'excel':
        await this.exportToExcel(data, headers, `${filename}.xlsx`);
        break;
      case 'json':
        await this.exportToJSON(data, `${filename}.json`);
        break;
      case 'pdf':
        await this.exportToPDF(data, headers, filename, `${filename}.pdf`);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  private convertToCSV(data: any[], headers: string[]): string {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row =>
      headers
        .map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma or quote
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    );

    return [csvHeaders, ...csvRows].join('\n');
  }

  private generateHTMLTable(data: any[], headers: string[], title: string): string {
    const headerRow = headers
      .map(
        h =>
          `<th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">${h}</th>`
      )
      .join('');
    const dataRows = data
      .map(
        row =>
          `<tr>${headers.map(header => `<td style="border: 1px solid #ddd; padding: 8px;">${row[header] || ''}</td>`).join('')}</tr>`
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { text-align: left; }
            h1 { color: #333; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead><tr>${headerRow}</tr></thead>
            <tbody>${dataRows}</tbody>
          </table>
        </body>
      </html>
    `;
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  }

  // Mock data methods (replace with real API calls)
  private async getMockSalesData(options: ExportOptions): Promise<any[]> {
    // Mock sales data
    return [
      {
        id: 1,
        sale_date: '2025-11-15',
        customer: { name: 'John Doe' },
        items: [{ id: 1 }, { id: 2 }],
        total_amount: 45.99,
        payment_method: 'card',
      },
      {
        id: 2,
        sale_date: '2025-11-14',
        customer: { name: 'Jane Smith' },
        items: [{ id: 3 }],
        total_amount: 29.99,
        payment_method: 'cash',
      },
    ];
  }

  private async getMockInventoryData(options: ExportOptions): Promise<any[]> {
    return [
      {
        id: 1,
        title: 'The Great Gatsby',
        authors: [{ name: 'F. Scott Fitzgerald' }],
        categories: [{ name: 'Fiction' }],
        stock_quantity: 15,
        price: 14.99,
      },
      {
        id: 2,
        title: '1984',
        authors: [{ name: 'George Orwell' }],
        categories: [{ name: 'Fiction' }],
        stock_quantity: 8,
        price: 13.99,
      },
    ];
  }

  private async getMockCustomerData(options: ExportOptions): Promise<any[]> {
    return [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '(555) 123-4567',
        total_orders: 5,
        total_spent: 149.95,
        last_order: '2025-11-15',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: null,
        total_orders: 2,
        total_spent: 59.98,
        last_order: '2025-11-10',
      },
    ];
  }

  private async getFinancialSummary(options: ExportOptions): Promise<any> {
    return {
      totalRevenue: 12450.75,
      totalOrders: 156,
      averageOrderValue: 79.81,
      topSellingBook: 'The Great Gatsby',
      totalCustomers: 89,
      booksInStock: 1245,
      lowStockItems: 12,
    };
  }
}

export const exportService = new ExportService();
