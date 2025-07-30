import React, { useState, useEffect } from 'react';
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Zap,
  Brain,
  Search,
  Filter,
  Download,
  Share,
  Eye,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Settings,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 高级诊断报告类型定义
interface AdvancedDiagnosticReport {
  id: string;
  title: string;
  type: 'comprehensive' | 'predictive' | 'comparative' | 'trend' | 'anomaly' | 'performance';
  category: 'device' | 'system' | 'process' | 'quality' | 'safety' | 'efficiency';
  status: 'generating' | 'completed' | 'failed' | 'scheduled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scope: {
    devices: string[];
    timeRange: {
      start: string;
      end: string;
      period: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
    };
    metrics: string[];
    filters: {
      field: string;
      operator: string;
      value: any;
    }[];
  };
  analysis: {
    aiInsights: {
      id: string;
      type: 'pattern' | 'anomaly' | 'prediction' | 'recommendation';
      confidence: number;
      description: string;
      impact: 'low' | 'medium' | 'high' | 'critical';
      evidence: string[];
      actions: string[];
    }[];
    statistics: {
      totalDataPoints: number;
      anomaliesDetected: number;
      patternsIdentified: number;
      predictionsGenerated: number;
      confidenceScore: number;
    };
    trends: {
      metric: string;
      direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
      changeRate: number;
      significance: number;
    }[];
    comparisons: {
      baseline: string;
      current: string;
      variance: number;
      significance: 'low' | 'medium' | 'high';
    }[];
  };
  findings: {
    id: string;
    category: 'critical' | 'warning' | 'info' | 'positive';
    title: string;
    description: string;
    severity: number;
    frequency: number;
    impact: string;
    recommendations: string[];
    relatedDevices: string[];
    evidence: {
      type: 'chart' | 'data' | 'image' | 'log';
      content: any;
      description: string;
    }[];
  }[];
  recommendations: {
    id: string;
    priority: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
    category: 'maintenance' | 'optimization' | 'replacement' | 'training' | 'process';
    title: string;
    description: string;
    expectedBenefit: string;
    estimatedCost: number;
    implementationTime: number;
    riskLevel: 'low' | 'medium' | 'high';
    dependencies: string[];
  }[];
  metadata: {
    generatedAt: string;
    generatedBy: string;
    dataSource: string[];
    processingTime: number;
    version: string;
    tags: string[];
    confidenceLevel: number;
  };
  sharing: {
    isPublic: boolean;
    sharedWith: string[];
    accessLevel: 'view' | 'comment' | 'edit';
    expirationDate?: string;
  };
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    recipients: string[];
    autoSend: boolean;
  };
}

// Mock数据
const mockReports: AdvancedDiagnosticReport[] = [
  {
    id: 'report-1',
    title: '设备性能综合诊断报告',
    type: 'comprehensive',
    category: 'device',
    status: 'completed',
    priority: 'high',
    scope: {
      devices: ['device-1', 'device-2', 'device-3'],
      timeRange: {
        start: '2024-07-01T00:00:00Z',
        end: '2024-07-17T23:59:59Z',
        period: 'week'
      },
      metrics: ['temperature', 'vibration', 'efficiency', 'uptime'],
      filters: [
        { field: 'status', operator: 'equals', value: 'active' }
      ]
    },
    analysis: {
      aiInsights: [
        {
          id: 'insight-1',
          type: 'anomaly',
          confidence: 0.92,
          description: '设备-01在过去7天内温度波动异常，可能存在散热问题',
          impact: 'high',
          evidence: ['温度数据异常峰值', '散热风扇转速下降', '环境温度正常'],
          actions: ['检查散热系统', '清理散热器', '更换散热风扇']
        },
        {
          id: 'insight-2',
          type: 'prediction',
          confidence: 0.87,
          description: '基于当前趋势，设备-02预计在30天内需要维护',
          impact: 'medium',
          evidence: ['振动频率逐渐增加', '效率缓慢下降', '历史维护周期分析'],
          actions: ['安排预防性维护', '准备备件', '制定维护计划']
        }
      ],
      statistics: {
        totalDataPoints: 156789,
        anomaliesDetected: 23,
        patternsIdentified: 8,
        predictionsGenerated: 5,
        confidenceScore: 0.89
      },
      trends: [
        {
          metric: 'efficiency',
          direction: 'decreasing',
          changeRate: -2.3,
          significance: 0.85
        },
        {
          metric: 'uptime',
          direction: 'stable',
          changeRate: 0.1,
          significance: 0.12
        }
      ],
      comparisons: [
        {
          baseline: '上月同期',
          current: '本月',
          variance: -5.2,
          significance: 'high'
        }
      ]
    },
    findings: [
      {
        id: 'finding-1',
        category: 'critical',
        title: '设备-01温度异常',
        description: '设备-01在过去一周内出现多次温度超标，最高达到85°C，超出正常范围15°C',
        severity: 9,
        frequency: 12,
        impact: '可能导致设备损坏和生产中断',
        recommendations: ['立即检查散热系统', '暂停高负荷作业', '安排紧急维护'],
        relatedDevices: ['device-1'],
        evidence: [
          {
            type: 'chart',
            content: { chartType: 'line', data: [] },
            description: '温度变化趋势图'
          }
        ]
      },
      {
        id: 'finding-2',
        category: 'warning',
        title: '整体效率下降趋势',
        description: '所有设备的平均效率在过去两周内下降了2.3%',
        severity: 6,
        frequency: 1,
        impact: '影响生产效率和成本控制',
        recommendations: ['优化操作流程', '加强设备维护', '培训操作人员'],
        relatedDevices: ['device-1', 'device-2', 'device-3'],
        evidence: [
          {
            type: 'chart',
            content: { chartType: 'bar', data: [] },
            description: '效率对比图'
          }
        ]
      }
    ],
    recommendations: [
      {
        id: 'rec-1',
        priority: 'immediate',
        category: 'maintenance',
        title: '紧急散热系统维护',
        description: '立即对设备-01进行散热系统检查和维护',
        expectedBenefit: '防止设备损坏，恢复正常运行温度',
        estimatedCost: 5000,
        implementationTime: 4,
        riskLevel: 'low',
        dependencies: ['停机维护窗口', '备件准备']
      },
      {
        id: 'rec-2',
        priority: 'short_term',
        category: 'optimization',
        title: '效率优化计划',
        description: '制定并实施设备效率优化计划',
        expectedBenefit: '提升整体效率3-5%',
        estimatedCost: 15000,
        implementationTime: 14,
        riskLevel: 'medium',
        dependencies: ['人员培训', '流程优化']
      }
    ],
    metadata: {
      generatedAt: '2024-07-18T02:00:00Z',
      generatedBy: 'AI诊断系统',
      dataSource: ['设备传感器', '维护记录', '操作日志'],
      processingTime: 45.6,
      version: '2.1.0',
      tags: ['设备诊断', '性能分析', '预测维护'],
      confidenceLevel: 0.89
    },
    sharing: {
      isPublic: false,
      sharedWith: ['张工程师', '李主管', '维护团队'],
      accessLevel: 'view'
    },
    schedule: {
      enabled: true,
      frequency: 'weekly',
      time: '09:00',
      recipients: ['张工程师', '李主管'],
      autoSend: true
    }
  },
  {
    id: 'report-2',
    title: '预测性维护分析报告',
    type: 'predictive',
    category: 'device',
    status: 'completed',
    priority: 'medium',
    scope: {
      devices: ['device-2', 'device-4'],
      timeRange: {
        start: '2024-06-01T00:00:00Z',
        end: '2024-07-17T23:59:59Z',
        period: 'month'
      },
      metrics: ['vibration', 'temperature', 'current', 'efficiency'],
      filters: []
    },
    analysis: {
      aiInsights: [
        {
          id: 'insight-3',
          type: 'prediction',
          confidence: 0.94,
          description: '设备-02轴承预计在45天内需要更换',
          impact: 'high',
          evidence: ['振动频率异常', '温度升高趋势', '历史故障模式匹配'],
          actions: ['准备轴承备件', '安排维护窗口', '制定更换计划']
        }
      ],
      statistics: {
        totalDataPoints: 89456,
        anomaliesDetected: 15,
        patternsIdentified: 6,
        predictionsGenerated: 3,
        confidenceScore: 0.91
      },
      trends: [
        {
          metric: 'vibration',
          direction: 'increasing',
          changeRate: 8.5,
          significance: 0.92
        }
      ],
      comparisons: [
        {
          baseline: '正常基线',
          current: '当前状态',
          variance: 15.3,
          significance: 'high'
        }
      ]
    },
    findings: [
      {
        id: 'finding-3',
        category: 'warning',
        title: '轴承磨损加剧',
        description: '设备-02主轴承振动频率持续增加，磨损程度超出正常范围',
        severity: 7,
        frequency: 1,
        impact: '可能导致设备故障和计划外停机',
        recommendations: ['安排预防性维护', '准备备件', '监控振动趋势'],
        relatedDevices: ['device-2'],
        evidence: [
          {
            type: 'chart',
            content: { chartType: 'line', data: [] },
            description: '振动趋势分析'
          }
        ]
      }
    ],
    recommendations: [
      {
        id: 'rec-3',
        priority: 'short_term',
        category: 'maintenance',
        title: '轴承预防性更换',
        description: '在故障发生前更换设备-02主轴承',
        expectedBenefit: '避免计划外停机，延长设备寿命',
        estimatedCost: 8000,
        implementationTime: 8,
        riskLevel: 'low',
        dependencies: ['轴承采购', '维护人员安排']
      }
    ],
    metadata: {
      generatedAt: '2024-07-17T14:30:00Z',
      generatedBy: 'AI预测系统',
      dataSource: ['振动传感器', '温度监控', '维护历史'],
      processingTime: 32.1,
      version: '2.1.0',
      tags: ['预测维护', '轴承分析', '故障预防'],
      confidenceLevel: 0.91
    },
    sharing: {
      isPublic: false,
      sharedWith: ['维护团队'],
      accessLevel: 'edit'
    }
  },
  {
    id: 'report-3',
    title: '系统异常模式分析',
    type: 'anomaly',
    category: 'system',
    status: 'generating',
    priority: 'high',
    scope: {
      devices: ['all'],
      timeRange: {
        start: '2024-07-10T00:00:00Z',
        end: '2024-07-17T23:59:59Z',
        period: 'day'
      },
      metrics: ['all'],
      filters: []
    },
    analysis: {
      aiInsights: [],
      statistics: {
        totalDataPoints: 0,
        anomaliesDetected: 0,
        patternsIdentified: 0,
        predictionsGenerated: 0,
        confidenceScore: 0
      },
      trends: [],
      comparisons: []
    },
    findings: [],
    recommendations: [],
    metadata: {
      generatedAt: '2024-07-18T02:30:00Z',
      generatedBy: 'AI异常检测系统',
      dataSource: ['系统日志', '传感器数据', '操作记录'],
      processingTime: 0,
      version: '2.1.0',
      tags: ['异常检测', '模式分析', '系统诊断'],
      confidenceLevel: 0
    },
    sharing: {
      isPublic: false,
      sharedWith: [],
      accessLevel: 'view'
    }
  }
];

function AdvancedDiagnostics() {
  const [reports, setReports] = useState<AdvancedDiagnosticReport[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<AdvancedDiagnosticReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 自动更新报告状态
  useEffect(() => {
    const interval = setInterval(() => {
      setReports(prev => prev.map(report => {
        if (report.status === 'generating') {
          // 模拟报告生成进度
          const progress = Math.random();
          if (progress > 0.8) {
            return {
              ...report,
              status: 'completed',
              metadata: {
                ...report.metadata,
                processingTime: Math.random() * 60 + 20
              }
            };
          }
        }
        return report;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 筛选报告
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'comprehensive': return FileText;
      case 'predictive': return TrendingUp;
      case 'comparative': return BarChart3;
      case 'trend': return Activity;
      case 'anomaly': return AlertTriangle;
      case 'performance': return Target;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      comprehensive: '综合诊断',
      predictive: '预测分析',
      comparative: '对比分析',
      trend: '趋势分析',
      anomaly: '异常检测',
      performance: '性能分析'
    };
    return typeMap[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      device: '设备',
      system: '系统',
      process: '流程',
      quality: '质量',
      safety: '安全',
      efficiency: '效率'
    };
    return categoryMap[category] || category;
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

  const getFindingIcon = (category: string) => {
    switch (category) {
      case 'critical': return XCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Clock;
      case 'positive': return CheckCircle;
      default: return Clock;
    }
  };

  const getFindingColor = (category: string) => {
    switch (category) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      case 'positive': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">高级诊断报告</h1>
          <p className="text-gray-600 mt-1">AI驱动的深度诊断分析和预测</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            配置
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            生成报告
          </Button>
        </div>
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
                <p className="text-sm text-gray-600">AI洞察</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reports.reduce((sum, r) => sum + r.analysis.aiInsights.length, 0)}
                </p>
              </div>
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">关键发现</p>
                <p className="text-2xl font-bold text-red-600">
                  {reports.reduce((sum, r) => sum + r.findings.filter(f => f.category === 'critical').length, 0)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均置信度</p>
                <p className="text-2xl font-bold text-green-600">
                  {(reports.reduce((sum, r) => sum + r.metadata.confidenceLevel, 0) / reports.length * 100).toFixed(0)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
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
                <Download className="h-4 w-4 mr-2" />
                批量导出
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                调度管理
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
                  placeholder="搜索报告标题或标签..."
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
                { value: 'comprehensive', label: '综合诊断' },
                { value: 'predictive', label: '预测分析' },
                { value: 'comparative', label: '对比分析' },
                { value: 'trend', label: '趋势分析' },
                { value: 'anomaly', label: '异常检测' },
                { value: 'performance', label: '性能分析' }
              ]}
            />
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'all', label: '全部分类' },
                { value: 'device', label: '设备' },
                { value: 'system', label: '系统' },
                { value: 'process', label: '流程' },
                { value: 'quality', label: '质量' },
                { value: 'safety', label: '安全' },
                { value: 'efficiency', label: '效率' }
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
                { value: 'scheduled', label: '已调度' }
              ]}
            />
          </div>

          {/* 报告表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>报告信息</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>AI洞察</TableHead>
                <TableHead>生成时间</TableHead>
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
                          report.status === 'completed' ? 'text-green-500' :
                          report.status === 'generating' ? 'text-blue-500' :
                          report.status === 'failed' ? 'text-red-500' :
                          'text-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium">{report.title}</div>
                          <div className="text-sm text-gray-500">
                            {report.metadata.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs mr-1">
                                {tag}
                              </span>
                            ))}
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
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{report.analysis.aiInsights.length} 个洞察</div>
                        <div className="text-gray-500">
                          置信度: {(report.metadata.confidenceLevel * 100).toFixed(0)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatRelativeTime(report.metadata.generatedAt)}</div>
                        <div className="text-gray-500">by {report.metadata.generatedBy}</div>
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
                              className="text-green-600 hover:text-green-700"
                            >
                              <Download className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
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

      {/* 报告详情模态框 */}
      {selectedReport && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReport(null);
          }}
          title="诊断报告详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 报告概览 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">报告标题:</span> {selectedReport.title}</div>
                  <div><span className="text-gray-500">报告类型:</span> {getTypeLabel(selectedReport.type)}</div>
                  <div><span className="text-gray-500">分析分类:</span> {getCategoryLabel(selectedReport.category)}</div>
                  <div><span className="text-gray-500">优先级:</span> {selectedReport.priority}</div>
                  <div><span className="text-gray-500">状态:</span> {selectedReport.status}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">分析统计</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">数据点:</span> {selectedReport.analysis.statistics.totalDataPoints.toLocaleString()}</div>
                  <div><span className="text-gray-500">异常检测:</span> {selectedReport.analysis.statistics.anomaliesDetected}</div>
                  <div><span className="text-gray-500">模式识别:</span> {selectedReport.analysis.statistics.patternsIdentified}</div>
                  <div><span className="text-gray-500">预测生成:</span> {selectedReport.analysis.statistics.predictionsGenerated}</div>
                  <div><span className="text-gray-500">置信度:</span> {(selectedReport.metadata.confidenceLevel * 100).toFixed(1)}%</div>
                </div>
              </div>
            </div>

            {/* AI洞察 */}
            {selectedReport.analysis.aiInsights.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">AI洞察</h4>
                <div className="space-y-3">
                  {selectedReport.analysis.aiInsights.map((insight) => (
                    <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${
                      insight.impact === 'critical' ? 'bg-red-50 border-red-400' :
                      insight.impact === 'high' ? 'bg-orange-50 border-orange-400' :
                      insight.impact === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Brain className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">{insight.type === 'pattern' ? '模式识别' :
                                                           insight.type === 'anomaly' ? '异常检测' :
                                                           insight.type === 'prediction' ? '预测分析' :
                                                           '建议推荐'}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              置信度: {(insight.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{insight.description}</p>

                          <div className="space-y-2">
                            <div>
                              <span className="text-xs font-medium text-gray-500">证据:</span>
                              <ul className="text-xs text-gray-600 ml-4 mt-1">
                                {insight.evidence.map((evidence, index) => (
                                  <li key={index} className="list-disc">{evidence}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="text-xs font-medium text-gray-500">建议行动:</span>
                              <ul className="text-xs text-gray-600 ml-4 mt-1">
                                {insight.actions.map((action, index) => (
                                  <li key={index} className="list-disc">{action}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 关键发现 */}
            {selectedReport.findings.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">关键发现</h4>
                <div className="space-y-3">
                  {selectedReport.findings.map((finding) => {
                    const FindingIcon = getFindingIcon(finding.category);
                    return (
                      <div key={finding.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <FindingIcon className={`h-5 w-5 mt-0.5 ${getFindingColor(finding.category)}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{finding.title}</h5>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  严重度: {finding.severity}/10
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  频次: {finding.frequency}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{finding.description}</p>
                            <p className="text-sm text-gray-600 mb-3">
                              <span className="font-medium">影响:</span> {finding.impact}
                            </p>

                            <div className="space-y-2">
                              <div>
                                <span className="text-xs font-medium text-gray-500">相关设备:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {finding.relatedDevices.map((device, index) => (
                                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                      {device}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="text-xs font-medium text-gray-500">建议措施:</span>
                                <ul className="text-xs text-gray-600 ml-4 mt-1">
                                  {finding.recommendations.map((rec, index) => (
                                    <li key={index} className="list-disc">{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 改进建议 */}
            {selectedReport.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">改进建议</h4>
                <div className="space-y-3">
                  {selectedReport.recommendations.map((rec) => (
                    <div key={rec.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-medium">{rec.title}</h5>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            rec.priority === 'immediate' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'short_term' ? 'bg-orange-100 text-orange-800' :
                            rec.priority === 'medium_term' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rec.priority === 'immediate' ? '立即' :
                             rec.priority === 'short_term' ? '短期' :
                             rec.priority === 'medium_term' ? '中期' : '长期'}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                            {rec.category}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{rec.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">预期收益:</span>
                          <div className="font-medium">{rec.expectedBenefit}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">预估成本:</span>
                          <div className="font-medium">¥{rec.estimatedCost.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">实施时间:</span>
                          <div className="font-medium">{rec.implementationTime}天</div>
                        </div>
                        <div>
                          <span className="text-gray-500">风险等级:</span>
                          <div className={`font-medium ${
                            rec.riskLevel === 'high' ? 'text-red-600' :
                            rec.riskLevel === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {rec.riskLevel}
                          </div>
                        </div>
                      </div>

                      {rec.dependencies.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs font-medium text-gray-500">依赖条件:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rec.dependencies.map((dep, index) => (
                              <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 元数据 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">报告元数据</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">生成时间:</span>
                  <div className="font-medium">{new Date(selectedReport.metadata.generatedAt).toLocaleString('zh-CN')}</div>
                </div>
                <div>
                  <span className="text-gray-500">生成者:</span>
                  <div className="font-medium">{selectedReport.metadata.generatedBy}</div>
                </div>
                <div>
                  <span className="text-gray-500">处理时间:</span>
                  <div className="font-medium">{selectedReport.metadata.processingTime.toFixed(1)}秒</div>
                </div>
                <div>
                  <span className="text-gray-500">版本:</span>
                  <div className="font-medium">{selectedReport.metadata.version}</div>
                </div>
                <div>
                  <span className="text-gray-500">数据源:</span>
                  <div className="font-medium">{selectedReport.metadata.dataSource.length}个</div>
                </div>
                <div>
                  <span className="text-gray-500">置信水平:</span>
                  <div className="font-medium">{(selectedReport.metadata.confidenceLevel * 100).toFixed(1)}%</div>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-gray-500 text-sm">标签:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedReport.metadata.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            <div className="flex space-x-2">
              {selectedReport.status === 'completed' && (
                <>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    导出
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    分享
                  </Button>
                </>
              )}
              <Button>
                <Eye className="h-4 w-4 mr-2" />
                查看完整报告
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default AdvancedDiagnostics;
