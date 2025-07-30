import React, { useState } from 'react';
import {
  Plus,
  Search,
  Download,
  Eye,
  FileText,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Share2,
  Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 诊断报告类型定义
interface DiagnosticReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'incident' | 'custom';
  status: 'generating' | 'completed' | 'failed' | 'scheduled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  period: {
    startDate: string;
    endDate: string;
  };
  scope: {
    devices: string[];
    targets: string[];
    taskTypes: string[];
  };
  metrics: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    successRate: number;
    avgDuration: number;
    issuesFound: number;
    criticalIssues: number;
  };
  findings: {
    id: string;
    type: 'normal' | 'warning' | 'error' | 'critical';
    category: 'equipment' | 'process' | 'safety' | 'performance';
    title: string;
    description: string;
    recommendation: string;
    priority: number;
  }[];
  attachments: {
    id: string;
    name: string;
    type: 'image' | 'video' | 'document' | 'data';
    url: string;
    size: number;
  }[];
  generatedBy: string;
  generatedAt: string;
  lastModified: string;
  recipients: string[];
  template: string;
  format: 'pdf' | 'html' | 'excel' | 'word';
}

// Mock数据
const mockReports: DiagnosticReport[] = [
  {
    id: 'report-1',
    title: '2024年7月第3周巡检诊断报告',
    type: 'weekly',
    status: 'completed',
    priority: 'high',
    period: {
      startDate: '2024-07-15T00:00:00Z',
      endDate: '2024-07-21T23:59:59Z'
    },
    scope: {
      devices: ['device-1', 'device-2', 'device-3'],
      targets: ['target-1', 'target-2', 'target-3'],
      taskTypes: ['scheduled', 'emergency']
    },
    metrics: {
      totalTasks: 45,
      completedTasks: 42,
      failedTasks: 3,
      successRate: 93.3,
      avgDuration: 35.5,
      issuesFound: 8,
      criticalIssues: 2
    },
    findings: [
      {
        id: 'finding-1',
        type: 'critical',
        category: 'equipment',
        title: '主变压器A1温度异常',
        description: '主变压器A1在7月17日检测中发现温度持续升高，最高达到85°C，超出正常运行范围',
        recommendation: '建议立即停机检查冷却系统，检查油位和冷却风扇运行状态',
        priority: 1
      },
      {
        id: 'finding-2',
        type: 'warning',
        category: 'safety',
        title: '东区巡检路径照明不足',
        description: '东区巡检路径在夜间巡检时发现多处照明设备故障，影响巡检安全',
        recommendation: '更换故障照明设备，增加临时照明措施',
        priority: 2
      },
      {
        id: 'finding-3',
        type: 'error',
        category: 'process',
        title: '冷却塔振动检测异常',
        description: '冷却塔在运行过程中检测到异常振动，可能存在机械故障',
        recommendation: '安排专业技术人员进行详细检查，必要时停机维修',
        priority: 1
      }
    ],
    attachments: [
      {
        id: 'att-1',
        name: '温度趋势图.png',
        type: 'image',
        url: '/attachments/temp_trend.png',
        size: 245760
      },
      {
        id: 'att-2',
        name: '巡检视频记录.mp4',
        type: 'video',
        url: '/attachments/inspection_video.mp4',
        size: 15728640
      },
      {
        id: 'att-3',
        name: '详细数据表.xlsx',
        type: 'data',
        url: '/attachments/detailed_data.xlsx',
        size: 102400
      }
    ],
    generatedBy: '系统自动生成',
    generatedAt: '2024-07-21T18:00:00Z',
    lastModified: '2024-07-21T18:30:00Z',
    recipients: ['张工程师', '李主管', '王总工'],
    template: 'weekly_standard',
    format: 'pdf'
  },
  {
    id: 'report-2',
    title: '冷却塔紧急事件诊断报告',
    type: 'incident',
    status: 'completed',
    priority: 'critical',
    period: {
      startDate: '2024-07-17T07:00:00Z',
      endDate: '2024-07-17T09:30:00Z'
    },
    scope: {
      devices: ['device-2'],
      targets: ['target-2'],
      taskTypes: ['emergency']
    },
    metrics: {
      totalTasks: 1,
      completedTasks: 1,
      failedTasks: 0,
      successRate: 100,
      avgDuration: 90,
      issuesFound: 3,
      criticalIssues: 2
    },
    findings: [
      {
        id: 'finding-4',
        type: 'critical',
        category: 'equipment',
        title: '冷却塔异常振动',
        description: '检测到冷却塔运行时存在异常振动，振动幅度超出正常范围3倍',
        recommendation: '立即停机检查，联系设备厂商进行专业维修',
        priority: 1
      },
      {
        id: 'finding-5',
        type: 'critical',
        category: 'safety',
        title: '冷却水温度过高',
        description: '冷却水温度达到45°C，超出安全运行温度范围',
        recommendation: '检查冷却系统，增加冷却措施，监控温度变化',
        priority: 1
      }
    ],
    attachments: [
      {
        id: 'att-4',
        name: '振动分析报告.pdf',
        type: 'document',
        url: '/attachments/vibration_analysis.pdf',
        size: 512000
      }
    ],
    generatedBy: '张工程师',
    generatedAt: '2024-07-17T10:00:00Z',
    lastModified: '2024-07-17T10:15:00Z',
    recipients: ['李主管', '王总工', '陈厂长'],
    template: 'incident_urgent',
    format: 'pdf'
  },
  {
    id: 'report-3',
    title: '7月份月度综合诊断报告',
    type: 'monthly',
    status: 'generating',
    priority: 'medium',
    period: {
      startDate: '2024-07-01T00:00:00Z',
      endDate: '2024-07-31T23:59:59Z'
    },
    scope: {
      devices: ['device-1', 'device-2', 'device-3', 'device-4'],
      targets: ['target-1', 'target-2', 'target-3', 'target-4'],
      taskTypes: ['scheduled', 'instant', 'emergency', 'maintenance']
    },
    metrics: {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      successRate: 0,
      avgDuration: 0,
      issuesFound: 0,
      criticalIssues: 0
    },
    findings: [],
    attachments: [],
    generatedBy: '系统自动生成',
    generatedAt: '2024-07-31T23:00:00Z',
    lastModified: '2024-07-31T23:00:00Z',
    recipients: ['张工程师', '李主管', '王总工', '陈厂长'],
    template: 'monthly_comprehensive',
    format: 'pdf'
  }
];

// 报告生成表单组件
interface ReportFormProps {
  report?: DiagnosticReport;
  onSubmit: (report: Partial<DiagnosticReport>) => void;
  onCancel: () => void;
}

function ReportForm({ report, onSubmit, onCancel }: ReportFormProps) {
  const [formData, setFormData] = useState({
    title: report?.title || '',
    type: report?.type || 'custom',
    priority: report?.priority || 'medium',
    startDate: report?.period?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    endDate: report?.period?.endDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    template: report?.template || 'standard',
    format: report?.format || 'pdf',
    recipients: report?.recipients?.join(', ') || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const reportTypes = [
    { value: 'daily', label: '日报' },
    { value: 'weekly', label: '周报' },
    { value: 'monthly', label: '月报' },
    { value: 'incident', label: '事件报告' },
    { value: 'custom', label: '自定义' }
  ];

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '关键' }
  ];

  const templateOptions = [
    { value: 'standard', label: '标准模板' },
    { value: 'detailed', label: '详细模板' },
    { value: 'summary', label: '摘要模板' },
    { value: 'incident_urgent', label: '紧急事件模板' },
    { value: 'weekly_standard', label: '周报标准模板' },
    { value: 'monthly_comprehensive', label: '月报综合模板' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'html', label: 'HTML' },
    { value: 'excel', label: 'Excel' },
    { value: 'word', label: 'Word' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '报告标题不能为空';
    }
    if (!formData.startDate) {
      newErrors.startDate = '开始日期不能为空';
    }
    if (!formData.endDate) {
      newErrors.endDate = '结束日期不能为空';
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.dateRange = '开始日期不能晚于结束日期';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const reportData: Partial<DiagnosticReport> = {
      ...formData,
      period: {
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate + 'T23:59:59').toISOString()
      },
      recipients: formData.recipients.split(',').map(r => r.trim()).filter(Boolean),
      scope: report?.scope || { devices: [], targets: [], taskTypes: [] },
      metrics: report?.metrics || {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        successRate: 0,
        avgDuration: 0,
        issuesFound: 0,
        criticalIssues: 0
      },
      findings: report?.findings || [],
      attachments: report?.attachments || [],
      status: 'generating',
      generatedBy: report?.generatedBy || '当前用户',
      generatedAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
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
        <FormField label="报告标题" required error={errors.title}>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="请输入报告标题"
          />
        </FormField>

        <FormField label="报告类型">
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as DiagnosticReport['type'] })}
            options={reportTypes}
          />
        </FormField>

        <FormField label="优先级">
          <Select
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as DiagnosticReport['priority'] })}
            options={priorityOptions}
          />
        </FormField>

        <FormField label="报告模板">
          <Select
            value={formData.template}
            onChange={(value) => setFormData({ ...formData, template: value })}
            options={templateOptions}
          />
        </FormField>

        <FormField label="开始日期" required error={errors.startDate}>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </FormField>

        <FormField label="结束日期" required error={errors.endDate}>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </FormField>

        <FormField label="输出格式">
          <Select
            value={formData.format}
            onChange={(value) => setFormData({ ...formData, format: value as DiagnosticReport['format'] })}
            options={formatOptions}
          />
        </FormField>
      </div>

      {errors.dateRange && (
        <div className="text-red-600 text-sm">{errors.dateRange}</div>
      )}

      <FormField label="接收人">
        <Input
          value={formData.recipients}
          onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
          placeholder="请输入接收人，用逗号分隔"
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {report ? '更新' : '生成报告'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function DiagnosticReports() {
  const [reports, setReports] = useState<DiagnosticReport[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<DiagnosticReport | null>(null);
  
  // 模态框状态
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 筛选报告
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // 事件处理函数
  const handleGenerateReport = (reportData: Partial<DiagnosticReport>) => {
    setReports([reportData as DiagnosticReport, ...reports]);
    setShowGenerateModal(false);
    
    // 模拟报告生成过程
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === reportData.id 
          ? { 
              ...r, 
              status: 'completed',
              metrics: {
                totalTasks: Math.floor(Math.random() * 50) + 10,
                completedTasks: Math.floor(Math.random() * 45) + 8,
                failedTasks: Math.floor(Math.random() * 5),
                successRate: Math.floor(Math.random() * 20) + 80,
                avgDuration: Math.floor(Math.random() * 30) + 20,
                issuesFound: Math.floor(Math.random() * 10),
                criticalIssues: Math.floor(Math.random() * 3)
              }
            }
          : r
      ));
    }, 3000);
  };

  const handleDownloadReport = (report: DiagnosticReport) => {
    // 模拟下载
    console.log(`下载报告: ${report.title}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'generating': return Clock;
      case 'failed': return XCircle;
      case 'scheduled': return Calendar;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      daily: '日报',
      weekly: '周报',
      monthly: '月报',
      incident: '事件报告',
      custom: '自定义'
    };
    return typeMap[type] || type;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFindingIcon = (type: string) => {
    switch (type) {
      case 'critical': return XCircle;
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const getFindingColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'error': return 'text-orange-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">诊断报告</h1>
        <p className="text-gray-600 mt-1">生成和管理巡检诊断报告</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">报告总数</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">生成中</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'generating').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">关键问题</p>
                <p className="text-2xl font-bold text-red-600">
                  {reports.reduce((sum, r) => sum + r.metrics.criticalIssues, 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>诊断报告列表</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                统计分析
              </Button>
              <Button onClick={() => setShowGenerateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                生成报告
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
                  placeholder="搜索报告标题或生成者..."
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
                { value: 'daily', label: '日报' },
                { value: 'weekly', label: '周报' },
                { value: 'monthly', label: '月报' },
                { value: 'incident', label: '事件报告' },
                { value: 'custom', label: '自定义' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'completed', label: '已完成' },
                { value: 'generating', label: '生成中' },
                { value: 'failed', label: '失败' },
                { value: 'scheduled', label: '已计划' }
              ]}
            />
          </div>

          {/* 报告表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>报告信息</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>时间范围</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>关键指标</TableHead>
                <TableHead>问题数量</TableHead>
                <TableHead>生成时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => {
                const StatusIcon = getStatusIcon(report.status);
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-gray-500">
                            生成者: {report.generatedBy}
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
                      <div className="text-sm">
                        <div>{new Date(report.period.startDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">
                          至 {new Date(report.period.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`h-4 w-4 ${
                          report.status === 'completed' ? 'text-green-500' :
                          report.status === 'generating' ? 'text-yellow-500' :
                          report.status === 'failed' ? 'text-red-500' :
                          'text-gray-400'
                        }`} />
                        <StatusBadge status={report.status} />
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.status === 'completed' ? (
                        <div className="text-sm">
                          <div>成功率: {report.metrics.successRate}%</div>
                          <div className="text-gray-500">
                            {report.metrics.completedTasks}/{report.metrics.totalTasks} 任务
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">生成中...</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {report.status === 'completed' ? (
                        <div className="text-sm">
                          <div className="text-red-600">关键: {report.metrics.criticalIssues}</div>
                          <div className="text-gray-500">总计: {report.metrics.issuesFound}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatRelativeTime(report.generatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedReport(report);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === 'completed' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadReport(report)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 生成报告模态框 */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="生成诊断报告"
        size="lg"
      >
        <ReportForm
          onSubmit={handleGenerateReport}
          onCancel={() => setShowGenerateModal(false)}
        />
      </Modal>

      {/* 报告详情模态框 */}
      {selectedReport && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReport(null);
          }}
          title="报告详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">报告标题:</span> {selectedReport.title}</div>
                  <div><span className="text-gray-500">报告类型:</span> {getTypeLabel(selectedReport.type)}</div>
                  <div><span className="text-gray-500">生成者:</span> {selectedReport.generatedBy}</div>
                  <div><span className="text-gray-500">生成时间:</span> {formatRelativeTime(selectedReport.generatedAt)}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">统计指标</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">任务总数:</span> {selectedReport.metrics.totalTasks}</div>
                  <div><span className="text-gray-500">成功率:</span> {selectedReport.metrics.successRate}%</div>
                  <div><span className="text-gray-500">平均时长:</span> {selectedReport.metrics.avgDuration}分钟</div>
                  <div><span className="text-gray-500">发现问题:</span> {selectedReport.metrics.issuesFound}个</div>
                </div>
              </div>
            </div>

            {/* 主要发现 */}
            {selectedReport.findings.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">主要发现</h4>
                <div className="space-y-3">
                  {selectedReport.findings.map((finding) => {
                    const FindingIcon = getFindingIcon(finding.type);
                    return (
                      <div key={finding.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <FindingIcon className={`h-5 w-5 mt-0.5 ${getFindingColor(finding.type)}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">{finding.title}</h5>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                finding.type === 'critical' ? 'bg-red-100 text-red-800' :
                                finding.type === 'error' ? 'bg-orange-100 text-orange-800' :
                                finding.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {finding.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <strong>建议:</strong> {finding.recommendation}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 附件 */}
            {selectedReport.attachments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">相关附件</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedReport.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{attachment.name}</div>
                        <div className="text-xs text-gray-500">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            {selectedReport.status === 'completed' && (
              <Button onClick={() => handleDownloadReport(selectedReport)}>
                <Download className="h-4 w-4 mr-2" />
                下载报告
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default DiagnosticReports;
