'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  TreemapChart,
  KPICard,
} from '@/components/ui/ChartComponents';
import AnalyticsService from '@/lib/services/analyticsService';
import type { BusinessInsight, PredictiveModel, DateRange, KPIMetric } from '@/lib/types/analytics';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  Brain,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Eye,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';

const analyticsService = new AnalyticsService();

interface BusinessIntelligenceReportsProps {
  dateRange?: DateRange;
}

const BusinessIntelligenceReports: React.FC<BusinessIntelligenceReportsProps> = ({
  dateRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
    label: 'Last 30 Days',
  },
}) => {
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [predictions, setPredictions] = useState<PredictiveModel[]>([]);
  const [kpis, setKpis] = useState<KPIMetric[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all');
  const [selectedPredictionModel, setSelectedPredictionModel] = useState<string>('all');

  const insightTypes = [
    { value: 'all', label: 'All Insights' },
    { value: 'sales', label: 'Sales Insights' },
    { value: 'customer', label: 'Customer Insights' },
    { value: 'inventory', label: 'Inventory Insights' },
    { value: 'financial', label: 'Financial Insights' },
    { value: 'operational', label: 'Operational Insights' },
  ];

  const predictionModels = [
    { value: 'all', label: 'All Models' },
    { value: 'sales_forecast', label: 'Sales Forecast' },
    { value: 'demand_prediction', label: 'Demand Prediction' },
    { value: 'customer_lifetime_value', label: 'Customer LTV' },
    { value: 'churn_prediction', label: 'Churn Risk' },
    { value: 'inventory_optimization', label: 'Inventory Optimization' },
  ];

  useEffect(() => {
    loadBusinessIntelligence();
  }, [dateRange, selectedInsightType, selectedPredictionModel]);

  const loadBusinessIntelligence = async () => {
    setIsLoading(true);
    try {
      const [businessInsights, predictiveModels, kpiData] = await Promise.all([
        analyticsService.getBusinessInsights(),
        analyticsService.getPredictiveModels(),
        analyticsService.getKPIs(dateRange),
      ]);

      // Filter insights
      const filteredInsights =
        selectedInsightType === 'all'
          ? businessInsights
          : businessInsights.filter(insight => insight.category === selectedInsightType);

      // Filter predictions
      const filteredPredictions =
        selectedPredictionModel === 'all'
          ? predictiveModels
          : predictiveModels.filter(model => model.type === selectedPredictionModel);

      setInsights(filteredInsights);
      setPredictions(filteredPredictions);
      setKpis(kpiData.kpis);
    } catch (error) {
      console.error('Failed to load business intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: string, priority: string) => {
    if (priority === 'high') return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (priority === 'medium') return <Eye className="h-5 w-5 text-yellow-500" />;
    return <CheckCircle className="h-5 w-5 text-green-500" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.9) return 'text-green-600';
    if (accuracy >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportReport = () => {
    const report = {
      insights,
      predictions,
      kpis,
      filters: {
        insightType: selectedInsightType,
        predictionModel: selectedPredictionModel,
        dateRange,
      },
      generatedAt: new Date(),
      metadata: {
        totalInsights: insights.length,
        totalPredictions: predictions.length,
        averageAccuracy: predictions.reduce((acc, p) => acc + p.accuracy, 0) / predictions.length,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-intelligence-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Business Intelligence Reports</h2>
          <p className="mt-2 text-sm text-gray-700">
            AI-powered insights and predictive analytics for strategic decision making
          </p>
        </div>

        <div className="mt-4 flex items-center space-x-4 sm:mt-0">
          <button
            onClick={exportReport}
            className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-white p-4 shadow">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Insights:</label>
            <select
              value={selectedInsightType}
              onChange={e => setSelectedInsightType(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {insightTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Predictions:</label>
            <select
              value={selectedPredictionModel}
              onChange={e => setSelectedPredictionModel(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {predictionModels.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            <Lightbulb className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Insights</p>
              <p className="text-2xl font-semibold text-gray-900">{insights.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">AI Models</p>
              <p className="text-2xl font-semibold text-gray-900">{predictions.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg Accuracy</p>
              <p className="text-2xl font-semibold text-gray-900">
                {predictions.length > 0
                  ? `${((predictions.reduce((acc, p) => acc + p.accuracy, 0) / predictions.length) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">High Priority</p>
              <p className="text-2xl font-semibold text-gray-900">
                {insights.filter(i => i.priority === 'high').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Business Insights */}
        <div className="rounded-lg border bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Business Insights</h3>
            <p className="text-sm text-gray-600">AI-generated actionable insights</p>
          </div>
          <div className="p-6">
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {insights.map(insight => (
                <div
                  key={insight.id}
                  className={`rounded-lg border p-4 ${getPriorityColor(insight.priority)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getInsightIcon(insight.category, insight.priority)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <p className="mt-1 text-sm text-gray-700">{insight.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>Category: {insight.category}</span>
                          <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(insight.priority)}`}
                    >
                      {insight.priority}
                    </span>
                  </div>

                  {insight.recommendations && insight.recommendations.length > 0 && (
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <p className="mb-2 text-xs font-medium text-gray-700">Recommended Actions:</p>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {insight.recommendations.slice(0, 3).map((rec, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="mr-2 mt-2 inline-block h-1 w-1 flex-shrink-0 rounded-full bg-gray-400"></span>
                            {rec.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}

              {insights.length === 0 && (
                <div className="py-8 text-center">
                  <Lightbulb className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">No insights available for the selected filters</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Predictive Models */}
        <div className="rounded-lg border bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Predictive Analytics</h3>
            <p className="text-sm text-gray-600">ML-powered forecasting and predictions</p>
          </div>
          <div className="p-6">
            <div className="max-h-96 space-y-4 overflow-y-auto">
              {predictions.map(model => (
                <div
                  key={model.id}
                  className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{model.name}</h4>
                      <p className="text-sm text-gray-600">{model.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getAccuracyColor(model.accuracy)}`}>
                        {(model.accuracy * 100).toFixed(1)}%
                      </span>
                      <Brain className="h-4 w-4 text-purple-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium">{model.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`ml-2 font-medium ${
                          model.status === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`}
                      >
                        {model.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Training:</span>
                      <span className="ml-2 font-medium">
                        {model.lastTraining.toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Next Update:</span>
                      <span className="ml-2 font-medium">
                        {model.nextUpdate
                          ? new Date(model.nextUpdate).toLocaleDateString()
                          : 'Not scheduled'}
                      </span>
                    </div>
                  </div>

                  {model.predictions && Object.keys(model.predictions).length > 0 && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="mb-2 text-xs font-medium text-gray-700">Key Predictions:</p>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(model.predictions)
                          .slice(0, 2)
                          .map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">{key.replace(/_/g, ' ')}</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {predictions.length === 0 && (
                <div className="py-8 text-center">
                  <Brain className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-gray-500">No predictions available for the selected filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trends */}
      {kpis.length > 0 && (
        <div className="rounded-lg border bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
            <p className="text-sm text-gray-600">Key metrics and trend analysis</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {kpis.slice(0, 4).map(kpi => (
                <KPICard
                  key={kpi.id}
                  title={kpi.name}
                  value={kpi.metric.value}
                  change={kpi.metric.changePercentage}
                  trend={kpi.metric.trend}
                  format={kpi.format === 'duration' ? 'number' : kpi.format}
                  icon={<Activity className="h-6 w-6" />}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-lg border bg-white p-8 shadow">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-600">Generating business intelligence...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessIntelligenceReports;
