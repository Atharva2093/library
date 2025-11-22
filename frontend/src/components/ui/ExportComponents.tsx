'use client';

import React, { useState } from 'react';
import { exportService, type ExportOptions } from '@/lib/services/exportService';

interface ExportButtonProps {
  reportType: 'sales' | 'inventory' | 'customers' | 'financial';
  data?: any[];
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  reportType,
  data,
  label,
  className = '',
  disabled = false,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);

  const handleExport = async (format: 'csv' | 'excel' | 'json' | 'pdf') => {
    if (disabled || isExporting) return;

    try {
      setIsExporting(true);
      setShowFormatMenu(false);

      const options: ExportOptions = {
        format,
        filename: `${reportType}-report-${new Date().toISOString().split('T')[0]}`,
        includeHeaders: true,
      };

      switch (reportType) {
        case 'sales':
          await exportService.generateSalesReport(options);
          break;
        case 'inventory':
          await exportService.generateInventoryReport(options);
          break;
        case 'customers':
          await exportService.generateCustomerReport(options);
          break;
        case 'financial':
          await exportService.generateFinancialSummary(options);
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      // Show success notification (you could integrate with a toast system here)
      console.log(`${reportType} report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowFormatMenu(!showFormatMenu)}
        disabled={disabled || isExporting}
        className={`inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 ${className}`}
      >
        {isExporting ? (
          <>
            <svg
              className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg
              className="-ml-1 mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {label || 'Export'}
            <svg
              className="-mr-1 ml-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>

      {showFormatMenu && !isExporting && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu">
            <button
              onClick={() => handleExport('csv')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <div className="flex items-center">
                <span className="font-medium">CSV</span>
                <span className="ml-2 text-xs text-gray-500">Comma-separated values</span>
              </div>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <div className="flex items-center">
                <span className="font-medium">Excel</span>
                <span className="ml-2 text-xs text-gray-500">Spreadsheet format</span>
              </div>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <div className="flex items-center">
                <span className="font-medium">JSON</span>
                <span className="ml-2 text-xs text-gray-500">Structured data</span>
              </div>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              <div className="flex items-center">
                <span className="font-medium">PDF</span>
                <span className="ml-2 text-xs text-gray-500">Printable document</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {showFormatMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowFormatMenu(false)} />
      )}
    </div>
  );
};

interface QuickExportProps {
  reportType: 'sales' | 'inventory' | 'customers' | 'financial';
  format: 'csv' | 'excel' | 'json' | 'pdf';
  label?: string;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const QuickExportButton: React.FC<QuickExportProps> = ({
  reportType,
  format,
  label,
  className = '',
  disabled = false,
  variant = 'secondary',
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (disabled || isExporting) return;

    try {
      setIsExporting(true);

      const options: ExportOptions = {
        format,
        filename: `${reportType}-report-${new Date().toISOString().split('T')[0]}`,
        includeHeaders: true,
      };

      switch (reportType) {
        case 'sales':
          await exportService.generateSalesReport(options);
          break;
        case 'inventory':
          await exportService.generateInventoryReport(options);
          break;
        case 'customers':
          await exportService.generateCustomerReport(options);
          break;
        case 'financial':
          await exportService.generateFinancialSummary(options);
          break;
      }

      console.log(`${reportType} report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-green-600 hover:bg-green-700 text-white border-transparent';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white border-transparent';
      case 'outline':
        return 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white border-transparent';
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 ${getVariantClasses()} ${className}`}
    >
      {isExporting ? (
        <>
          <svg className="-ml-1 mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {label || `Export ${format.toUpperCase()}`}
        </>
      )}
    </button>
  );
};

interface DateRangeExportProps {
  reportType: 'sales' | 'inventory' | 'customers' | 'financial';
  onExport?: (options: ExportOptions) => void;
}

export const DateRangeExportForm: React.FC<DateRangeExportProps> = ({ reportType, onExport }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState<'csv' | 'excel' | 'json' | 'pdf'>('csv');
  const [filename, setFilename] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExporting) return;

    try {
      setIsExporting(true);

      const options: ExportOptions = {
        format,
        filename: filename || `${reportType}-report-${new Date().toISOString().split('T')[0]}`,
        includeHeaders: true,
        dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
      };

      if (onExport) {
        onExport(options);
      } else {
        // Default export logic
        switch (reportType) {
          case 'sales':
            await exportService.generateSalesReport(options);
            break;
          case 'inventory':
            await exportService.generateInventoryReport(options);
            break;
          case 'customers':
            await exportService.generateCustomerReport(options);
            break;
          case 'financial':
            await exportService.generateFinancialSummary(options);
            break;
        }
      }

      console.log(`${reportType} report exported successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-700">
            Export Format
          </label>
          <select
            id="format"
            value={format}
            onChange={e => setFormat(e.target.value as any)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          >
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="json">JSON</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        <div>
          <label htmlFor="filename" className="block text-sm font-medium text-gray-700">
            Filename (optional)
          </label>
          <input
            type="text"
            id="filename"
            value={filename}
            onChange={e => setFilename(e.target.value)}
            placeholder={`${reportType}-report-${new Date().toISOString().split('T')[0]}`}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isExporting}
          className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isExporting ? (
            <>
              <svg
                className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg
                className="-ml-1 mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export Report
            </>
          )}
        </button>
      </div>
    </form>
  );
};
