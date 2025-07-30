import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Share,
  Save,
  Edit,
  Trash2,
  Eye,
  Plus,
  Settings,
  RefreshCw,
  Search,
  Clock,
  Target,
  Users,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 自定义报表类型定义
interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: 'dashboard' | 'chart' | 'table' | 'summary';
  category: 'operational' | 'performance' | 'maintenance' | 'financial' | 'compliance';
  status: 'draft' | 'published' | 'archived';
  visibility: 'private' | 'team' | 'public';
  dataSource: {
    tables: string[];
    dateRange: {
      type: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'custom';
      startDate?: string;
      endDate?: string;
    };
    filters: {
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
      value: string | number | string[];
    }[];
    groupBy: string[];
    orderBy: {
      field: string;
      direction: 'asc' | 'desc';
    }[];
  };
  visualization: {
    chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'heatmap';
    xAxis: string;
    yAxis: string[];
    colors: string[];
    showLegend: boolean;
    showGrid: boolean;
    aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  };
  layout: {
    columns: number;
    rows: number;
    widgets: {
      id: string;
      type: 'metric' | 'chart' | 'table' | 'text';
      position: { x: number; y: number; w: number; h: number };
      config: any;
    }[];
  };
  schedule: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    recipients: string[];
    format: 'pdf' | 'excel' | 'email';
  };
  permissions: {
    owner: string;
    editors: string[];
    viewers: string[];
  };
  metrics: {
    viewCount: number;
    lastViewed: string;
    exportCount: number;
    shareCount: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Mock数据
const mockReports: CustomReport[] = [
  {
    id: 'report-1',
    name: '设备运行效率分析',
    description: '分析各设备的运行效率和故障率，提供设备优化建议',
    type: 'dashboard',
    category: 'performance',
    status: 'published',
    visibility: 'team',
    dataSource: {
      tables: ['devices', 'tasks', 'exceptions'],
      dateRange: {
        type: 'last_30_days'
      },
      filters: [
        {
          field: 'device_status',
          operator: 'equals',
          value: 'active'
        }
      ],
      groupBy: ['device_id', 'device_type'],
      orderBy: [
        {
          field: 'efficiency_score',
          direction: 'desc'
        }
      ]
    },
    visualization: {
      chartType: 'bar',
      xAxis: 'device_name',
      yAxis: ['efficiency_score', 'uptime_percentage'],
      colors: ['#3B82F6', '#10B981'],
      showLegend: true,
      showGrid: true,
      aggregation: 'avg'
    },
    layout: {
      columns: 12,
      rows: 8,
      widgets: [
        {
          id: 'widget-1',
          type: 'metric',
          position: { x: 0, y: 0, w: 3, h: 2 },
          config: { title: '总设备数', value: 15, trend: '+2' }
        },
        {
          id: 'widget-2',
          type: 'chart',
          position: { x: 3, y: 0, w: 9, h: 4 },
          config: { title: '设备效率对比', type: 'bar' }
        }
      ]
    },
    schedule: {
      enabled: true,
      frequency: 'weekly',
      time: '09:00',
      recipients: ['张工程师', '李主管'],
      format: 'pdf'
    },
    permissions: {
      owner: '张工程师',
      editors: ['李技术员'],
      viewers: ['王分析师', '刘维护员']
    },
    metrics: {
      viewCount: 45,
      lastViewed: '2024-07-17T10:30:00Z',
      exportCount: 8,
      shareCount: 3
    },
    createdAt: '2024-07-01T09:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z',
    createdBy: '张工程师'
  },
  {
    id: 'report-2',
    name: '巡检任务完成率统计',
    description: '统计各时间段的巡检任务完成情况和质量指标',
    type: 'chart',
    category: 'operational',
    status: 'published',
    visibility: 'public',
    dataSource: {
      tables: ['tasks', 'schedules'],
      dateRange: {
        type: 'last_7_days'
      },
      filters: [],
      groupBy: ['date', 'task_type'],
      orderBy: [
        {
          field: 'date',
          direction: 'asc'
        }
      ]
    },
    visualization: {
      chartType: 'line',
      xAxis: 'date',
      yAxis: ['completion_rate', 'quality_score'],
      colors: ['#8B5CF6', '#F59E0B'],
      showLegend: true,
      showGrid: true,
      aggregation: 'avg'
    },
    layout: {
      columns: 12,
      rows: 6,
      widgets: [
        {
          id: 'widget-3',
          type: 'chart',
          position: { x: 0, y: 0, w: 12, h: 6 },
          config: { title: '任务完成率趋势', type: 'line' }
        }
      ]
    },
    schedule: {
      enabled: false,
      frequency: 'daily',
      time: '08:00',
      recipients: [],
      format: 'email'
    },
    permissions: {
      owner: '李技术员',
      editors: [],
      viewers: ['所有用户']
    },
    metrics: {
      viewCount: 128,
      lastViewed: '2024-07-17T11:15:00Z',
      exportCount: 15,
      shareCount: 7
    },
    createdAt: '2024-07-05T10:00:00Z',
    updatedAt: '2024-07-16T16:45:00Z',
    createdBy: '李技术员'
  },
  {
    id: 'report-3',
    name: '维护成本分析',
    description: '分析设备维护成本和预算使用情况',
    type: 'table',
    category: 'financial',
    status: 'draft',
    visibility: 'private',
    dataSource: {
      tables: ['maintenance', 'costs', 'budgets'],
      dateRange: {
        type: 'custom',
        startDate: '2024-06-01',
        endDate: '2024-07-17'
      },
      filters: [
        {
          field: 'cost_type',
          operator: 'equals',
          value: 'maintenance'
        }
      ],
      groupBy: ['device_category', 'month'],
      orderBy: [
        {
          field: 'total_cost',
          direction: 'desc'
        }
      ]
    },
    visualization: {
      chartType: 'pie',
      xAxis: 'device_category',
      yAxis: ['total_cost'],
      colors: ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6'],
      showLegend: true,
      showGrid: false,
      aggregation: 'sum'
    },
    layout: {
      columns: 12,
      rows: 8,
      widgets: [
        {
          id: 'widget-4',
          type: 'table',
          position: { x: 0, y: 0, w: 12, h: 8 },
          config: { title: '维护成本明细', showPagination: true }
        }
      ]
    },
    schedule: {
      enabled: false,
      frequency: 'monthly',
      time: '09:00',
      recipients: [],
      format: 'excel'
    },
    permissions: {
      owner: '王分析师',
      editors: [],
      viewers: []
    },
    metrics: {
      viewCount: 12,
      lastViewed: '2024-07-16T15:20:00Z',
      exportCount: 2,
      shareCount: 0
    },
    createdAt: '2024-07-10T11:30:00Z',
    updatedAt: '2024-07-16T15:20:00Z',
    createdBy: '王分析师'
  }
];

// 报表表单组件
interface ReportFormProps {
  report?: CustomReport;
  onSubmit: (report: Partial<CustomReport>) => void;
  onCancel: () => void;
}

function ReportForm({ report, onSubmit, onCancel }: ReportFormProps) {
  const [formData, setFormData] = useState({
    name: report?.name || '',
    description: report?.description || '',
    type: report?.type || 'dashboard',
    category: report?.category || 'operational',
    visibility: report?.visibility || 'team',
    chartType: report?.visualization?.chartType || 'bar',
    dateRangeType: report?.dataSource?.dateRange?.type || 'last_30_days'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const typeOptions = [
    { value: 'dashboard', label: '仪表板' },
    { value: 'chart', label: '图表' },
    { value: 'table', label: '表格' },
    { value: 'summary', label: '摘要' }
  ];

  const categoryOptions = [
    { value: 'operational', label: '运营' },
    { value: 'performance', label: '性能' },
    { value: 'maintenance', label: '维护' },
    { value: 'financial', label: '财务' },
    { value: 'compliance', label: '合规' }
  ];

  const visibilityOptions = [
    { value: 'private', label: '私有' },
    { value: 'team', label: '团队' },
    { value: 'public', label: '公开' }
  ];

  const chartTypeOptions = [
    { value: 'bar', label: '柱状图' },
    { value: 'line', label: '折线图' },
    { value: 'pie', label: '饼图' },
    { value: 'area', label: '面积图' },
    { value: 'scatter', label: '散点图' },
    { value: 'heatmap', label: '热力图' }
  ];

  const dateRangeOptions = [
    { value: 'last_7_days', label: '最近7天' },
    { value: 'last_30_days', label: '最近30天' },
    { value: 'last_90_days', label: '最近90天' },
    { value: 'custom', label: '自定义' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '报表名称不能为空';
    }
    if (!formData.description.trim()) {
      newErrors.description = '报表描述不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const reportData: Partial<CustomReport> = {
      ...formData,
      dataSource: {
        tables: report?.dataSource?.tables || ['tasks'],
        dateRange: {
          type: formData.dateRangeType as any
        },
        filters: report?.dataSource?.filters || [],
        groupBy: report?.dataSource?.groupBy || [],
        orderBy: report?.dataSource?.orderBy || []
      },
      visualization: {
        chartType: formData.chartType as any,
        xAxis: report?.visualization?.xAxis || 'date',
        yAxis: report?.visualization?.yAxis || ['count'],
        colors: report?.visualization?.colors || ['#3B82F6'],
        showLegend: true,
        showGrid: true,
        aggregation: report?.visualization?.aggregation || 'count'
      },
      layout: report?.layout || {
        columns: 12,
        rows: 8,
        widgets: []
      },
      schedule: report?.schedule || {
        enabled: false,
        frequency: 'weekly',
        time: '09:00',
        recipients: [],
        format: 'pdf'
      },
      permissions: report?.permissions || {
        owner: '当前用户',
        editors: [],
        viewers: []
      },
      metrics: report?.metrics || {
        viewCount: 0,
        lastViewed: new Date().toISOString(),
        exportCount: 0,
        shareCount: 0
      },
      status: 'draft',
      createdBy: report?.createdBy || '当前用户',
      createdAt: report?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (report) {
      reportData.id = report.id;
    } else {
      reportData.id = `report-${Date.now()}`;
    }

    onSubmit(reportData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="报表名称" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入报表名称"
          />
        </FormField>

        <FormField label="报表类型">
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as CustomReport['type'] })}
            options={typeOptions}
          />
        </FormField>

        <FormField label="报表分类">
          <Select
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as CustomReport['category'] })}
            options={categoryOptions}
          />
        </FormField>

        <FormField label="可见性">
          <Select
            value={formData.visibility}
            onChange={(value) => setFormData({ ...formData, visibility: value as CustomReport['visibility'] })}
            options={visibilityOptions}
          />
        </FormField>

        <FormField label="图表类型">
          <Select
            value={formData.chartType}
            onChange={(value) => setFormData({ ...formData, chartType: value })}
            options={chartTypeOptions}
          />
        </FormField>

        <FormField label="时间范围">
          <Select
            value={formData.dateRangeType}
            onChange={(value) => setFormData({ ...formData, dateRangeType: value })}
            options={dateRangeOptions}
          />
        </FormField>
      </div>

      <FormField label="报表描述" required error={errors.description}>
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请描述报表的用途和内容"
          rows={3}
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {report ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function CustomReports() {
  const [reports, setReports] = useState<CustomReport[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);
  
  // 模态框状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 筛选报表
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  // 事件处理函数
  const handleCreateReport = (reportData: Partial<CustomReport>) => {
    setReports([reportData as CustomReport, ...reports]);
    setShowCreateModal(false);
  };

  const handleUpdateReport = (reportData: Partial<CustomReport>) => {
    if (selectedReport?.id) {
      setReports(reports.map(r => 
        r.id === selectedReport.id ? { ...r, ...reportData } : r
      ));
      setShowEditModal(false);
      setSelectedReport(null);
    }
  };

  const handleViewReport = (reportId: string) => {
    setReports(reports.map(r => 
      r.id === reportId 
        ? { 
            ...r, 
            metrics: { 
              ...r.metrics, 
              viewCount: r.metrics.viewCount + 1,
              lastViewed: new Date().toISOString()
            }
          }
        : r
    ));
  };

  const handleExportReport = (reportId: string) => {
    setReports(reports.map(r => 
      r.id === reportId 
        ? { 
            ...r, 
            metrics: { 
              ...r.metrics, 
              exportCount: r.metrics.exportCount + 1
            }
          }
        : r
    ));
    console.log(`导出报表: ${reportId}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dashboard': return BarChart3;
      case 'chart': return LineChart;
      case 'table': return Database;
      case 'summary': return Target;
      default: return BarChart3;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      dashboard: '仪表板',
      chart: '图表',
      table: '表格',
      summary: '摘要'
    };
    return typeMap[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      operational: '运营',
      performance: '性能',
      maintenance: '维护',
      financial: '财务',
      compliance: '合规'
    };
    return categoryMap[category] || category;
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'team': return 'bg-blue-100 text-blue-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">自定义报表</h1>
        <p className="text-gray-600 mt-1">创建和管理个性化统计报表</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">报表总数</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已发布</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'published').length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总浏览量</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reports.reduce((sum, r) => sum + r.metrics.viewCount, 0)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">导出次数</p>
                <p className="text-2xl font-bold text-orange-600">
                  {reports.reduce((sum, r) => sum + r.metrics.exportCount, 0)}
                </p>
              </div>
              <Download className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>自定义报表列表</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                模板管理
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建报表
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索报表名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'dashboard', label: '仪表板' },
                { value: 'chart', label: '图表' },
                { value: 'table', label: '表格' },
                { value: 'summary', label: '摘要' }
              ]}
            />
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'all', label: '全部分类' },
                { value: 'operational', label: '运营' },
                { value: 'performance', label: '性能' },
                { value: 'maintenance', label: '维护' },
                { value: 'financial', label: '财务' },
                { value: 'compliance', label: '合规' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'draft', label: '草稿' },
                { value: 'published', label: '已发布' },
                { value: 'archived', label: '已归档' }
              ]}
            />
          </div>

          {/* 报表表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>报表信息</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>可见性</TableHead>
                <TableHead>浏览量</TableHead>
                <TableHead>最后更新</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => {
                const TypeIcon = getTypeIcon(report.type);
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <TypeIcon className={`h-5 w-5 ${
                          report.status === 'published' ? 'text-green-500' :
                          report.status === 'draft' ? 'text-yellow-500' :
                          'text-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium">{report.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {report.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getTypeLabel(report.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {getCategoryLabel(report.category)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getVisibilityColor(report.visibility)}`}>
                        {report.visibility}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{report.metrics.viewCount}</div>
                        <div className="text-gray-500">
                          导出: {report.metrics.exportCount}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatRelativeTime(report.updatedAt)}</div>
                        <div className="text-gray-500">by {report.createdBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetailModal(true);
                            handleViewReport(report.id);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {report.status === 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportReport(report.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Share className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 创建报表模态框 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建自定义报表"
        size="lg"
      >
        <ReportForm
          onSubmit={handleCreateReport}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* 编辑报表模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedReport(null);
        }}
        title="编辑自定义报表"
        size="lg"
      >
        <ReportForm
          report={selectedReport || undefined}
          onSubmit={handleUpdateReport}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedReport(null);
          }}
        />
      </Modal>

      {/* 报表详情模态框 */}
      {selectedReport && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReport(null);
          }}
          title="报表详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">报表名称:</span> {selectedReport.name}</div>
                  <div><span className="text-gray-500">报表类型:</span> {getTypeLabel(selectedReport.type)}</div>
                  <div><span className="text-gray-500">分类:</span> {getCategoryLabel(selectedReport.category)}</div>
                  <div><span className="text-gray-500">可见性:</span> {selectedReport.visibility}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">数据源</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">数据表:</span> {selectedReport.dataSource.tables.join(', ')}</div>
                  <div><span className="text-gray-500">时间范围:</span> {selectedReport.dataSource.dateRange.type}</div>
                  <div><span className="text-gray-500">分组字段:</span> {selectedReport.dataSource.groupBy.join(', ') || '无'}</div>
                  <div><span className="text-gray-500">筛选条件:</span> {selectedReport.dataSource.filters.length} 个</div>
                </div>
              </div>
            </div>

            {/* 可视化配置 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">可视化配置</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">图表类型:</span>
                  <div className="font-medium">{selectedReport.visualization.chartType}</div>
                </div>
                <div>
                  <span className="text-gray-500">X轴:</span>
                  <div className="font-medium">{selectedReport.visualization.xAxis}</div>
                </div>
                <div>
                  <span className="text-gray-500">Y轴:</span>
                  <div className="font-medium">{selectedReport.visualization.yAxis.join(', ')}</div>
                </div>
                <div>
                  <span className="text-gray-500">聚合方式:</span>
                  <div className="font-medium">{selectedReport.visualization.aggregation}</div>
                </div>
              </div>
            </div>

            {/* 布局信息 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">布局配置</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">网格列数:</span>
                  <div className="font-medium">{selectedReport.layout.columns}</div>
                </div>
                <div>
                  <span className="text-gray-500">网格行数:</span>
                  <div className="font-medium">{selectedReport.layout.rows}</div>
                </div>
                <div>
                  <span className="text-gray-500">组件数量:</span>
                  <div className="font-medium">{selectedReport.layout.widgets.length}</div>
                </div>
              </div>
            </div>

            {/* 调度设置 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">调度设置</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">自动调度:</span>
                  <div className="font-medium">{selectedReport.schedule.enabled ? '启用' : '禁用'}</div>
                </div>
                {selectedReport.schedule.enabled && (
                  <>
                    <div>
                      <span className="text-gray-500">频率:</span>
                      <div className="font-medium">{selectedReport.schedule.frequency}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">时间:</span>
                      <div className="font-medium">{selectedReport.schedule.time}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">格式:</span>
                      <div className="font-medium">{selectedReport.schedule.format}</div>
                    </div>
                  </>
                )}
              </div>
              {selectedReport.schedule.enabled && selectedReport.schedule.recipients.length > 0 && (
                <div className="mt-2">
                  <span className="text-gray-500 text-sm">接收人:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedReport.schedule.recipients.map((recipient, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {recipient}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 权限设置 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">权限设置</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">所有者:</span>
                  <span className="text-sm font-medium">{selectedReport.permissions.owner}</span>
                </div>
                {selectedReport.permissions.editors.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <Edit className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-500">编辑者:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedReport.permissions.editors.map((editor, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {editor}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {selectedReport.permissions.viewers.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <Eye className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-500">查看者:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedReport.permissions.viewers.map((viewer, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                            {viewer}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 使用统计 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">使用统计</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-medium">浏览次数</div>
                  <div className="text-2xl font-bold text-blue-800">{selectedReport.metrics.viewCount}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-medium">导出次数</div>
                  <div className="text-2xl font-bold text-green-800">{selectedReport.metrics.exportCount}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-purple-600 font-medium">分享次数</div>
                  <div className="text-2xl font-bold text-purple-800">{selectedReport.metrics.shareCount}</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-yellow-600 font-medium">最后查看</div>
                  <div className="text-sm font-bold text-yellow-800">
                    {formatRelativeTime(selectedReport.metrics.lastViewed)}
                  </div>
                </div>
              </div>
            </div>

            {/* 报表预览 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">报表预览</h4>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">报表预览功能</p>
                <p className="text-sm text-gray-400 mt-2">显示报表的实际渲染效果</p>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleExportReport(selectedReport.id)}>
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
              <Button>
                <Share className="h-4 w-4 mr-2" />
                分享
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default CustomReports;
