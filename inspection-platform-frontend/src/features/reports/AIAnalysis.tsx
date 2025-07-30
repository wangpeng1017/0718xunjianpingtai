import React, { useState, useEffect } from 'react';
import {
  Brain,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  RefreshCw,
  Download,
  Activity,
  Target,
  Lightbulb,
  Search,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// AI分析类型定义
interface AIAnalysis {
  id: string;
  name: string;
  type: 'anomaly_detection' | 'predictive_maintenance' | 'pattern_recognition' | 'risk_assessment' | 'optimization';
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dataSource: {
    type: 'sensor_data' | 'image' | 'video' | 'historical' | 'mixed';
    period: {
      startDate: string;
      endDate: string;
    };
    devices: string[];
    targets: string[];
  };
  algorithm: {
    model: string;
    version: string;
    confidence: number;
    accuracy: number;
  };
  results: {
    insights: {
      id: string;
      type: 'anomaly' | 'trend' | 'prediction' | 'recommendation';
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      description: string;
      confidence: number;
      impact: string;
      recommendation: string;
      evidence: string[];
    }[];
    metrics: {
      totalDataPoints: number;
      anomaliesDetected: number;
      patternsFound: number;
      predictionsGenerated: number;
      confidenceScore: number;
    };
  };
  execution: {
    startedAt: string;
    completedAt?: string;
    duration?: number;
    progress: number;
    currentStage: string;
  };
  createdAt: string;
  createdBy: string;
}

// Mock数据
const mockAnalyses: AIAnalysis[] = [
  {
    id: 'ai-1',
    name: '变压器温度异常检测',
    type: 'anomaly_detection',
    status: 'completed',
    priority: 'high',
    dataSource: {
      type: 'sensor_data',
      period: {
        startDate: '2024-07-10T00:00:00Z',
        endDate: '2024-07-17T23:59:59Z'
      },
      devices: ['device-1'],
      targets: ['target-1']
    },
    algorithm: {
      model: 'LSTM-Autoencoder',
      version: 'v2.1',
      confidence: 94.5,
      accuracy: 92.3
    },
    results: {
      insights: [
        {
          id: 'insight-1',
          type: 'anomaly',
          severity: 'critical',
          title: '主变压器A1温度异常模式',
          description: '检测到主变压器A1在7月15-17日期间存在异常温度升高模式，温度波动超出正常范围15%',
          confidence: 96.8,
          impact: '可能导致设备过热损坏，影响供电稳定性',
          recommendation: '建议立即检查冷却系统，增加监控频率，考虑降低负载',
          evidence: ['温度传感器数据', '历史对比分析', '负载相关性分析']
        },
        {
          id: 'insight-2',
          type: 'trend',
          severity: 'medium',
          title: '温度上升趋势',
          description: '过去7天内，变压器平均温度呈现缓慢上升趋势，每日增长0.5°C',
          confidence: 89.2,
          impact: '长期趋势可能影响设备寿命',
          recommendation: '制定预防性维护计划，监控冷却系统性能',
          evidence: ['趋势分析', '季节性对比', '负载历史']
        }
      ],
      metrics: {
        totalDataPoints: 10080,
        anomaliesDetected: 23,
        patternsFound: 5,
        predictionsGenerated: 0,
        confidenceScore: 94.5
      }
    },
    execution: {
      startedAt: '2024-07-17T08:00:00Z',
      completedAt: '2024-07-17T08:15:00Z',
      duration: 15,
      progress: 100,
      currentStage: '分析完成'
    },
    createdAt: '2024-07-17T07:55:00Z',
    createdBy: '张工程师'
  },
  {
    id: 'ai-2',
    name: '设备预测性维护分析',
    type: 'predictive_maintenance',
    status: 'running',
    priority: 'medium',
    dataSource: {
      type: 'mixed',
      period: {
        startDate: '2024-06-01T00:00:00Z',
        endDate: '2024-07-17T23:59:59Z'
      },
      devices: ['device-1', 'device-2', 'device-3'],
      targets: ['target-1', 'target-2', 'target-3']
    },
    algorithm: {
      model: 'Random Forest',
      version: 'v1.8',
      confidence: 87.3,
      accuracy: 85.6
    },
    results: {
      insights: [],
      metrics: {
        totalDataPoints: 0,
        anomaliesDetected: 0,
        patternsFound: 0,
        predictionsGenerated: 0,
        confidenceScore: 0
      }
    },
    execution: {
      startedAt: '2024-07-17T09:00:00Z',
      progress: 65,
      currentStage: '特征提取中'
    },
    createdAt: '2024-07-17T08:45:00Z',
    createdBy: '李技术员'
  }
];

function AIAnalysis() {
  const [analyses, setAnalyses] = useState<AIAnalysis[]>(mockAnalyses);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AIAnalysis | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 自动更新运行中的分析进度
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalyses(prev => prev.map(analysis => {
        if (analysis.status === 'running') {
          const newProgress = Math.min(analysis.execution.progress + Math.random() * 5, 100);
          const stages = ['数据预处理', '特征提取中', '模型训练', '结果生成', '分析完成'];
          const currentStageIndex = Math.floor((newProgress / 100) * (stages.length - 1));

          return {
            ...analysis,
            execution: {
              ...analysis.execution,
              progress: newProgress,
              currentStage: stages[currentStageIndex],
              ...(newProgress >= 100 && {
                completedAt: new Date().toISOString(),
                duration: Math.floor((new Date().getTime() - new Date(analysis.execution.startedAt).getTime()) / 60000)
              })
            },
            ...(newProgress >= 100 && { status: 'completed' as const })
          };
        }
        return analysis;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 筛选分析
  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = analysis.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || analysis.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || analysis.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'anomaly_detection': return AlertTriangle;
      case 'predictive_maintenance': return TrendingUp;
      case 'pattern_recognition': return Eye;
      case 'risk_assessment': return Target;
      case 'optimization': return Zap;
      default: return Brain;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      anomaly_detection: '异常检测',
      predictive_maintenance: '预测维护',
      pattern_recognition: '模式识别',
      risk_assessment: '风险评估',
      optimization: '优化分析'
    };
    return typeMap[type] || type;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return AlertTriangle;
      case 'trend': return TrendingUp;
      case 'prediction': return Eye;
      case 'recommendation': return Lightbulb;
      default: return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI分析</h1>
        <p className="text-gray-600 mt-1">智能分析和洞察发现</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">分析总数</p>
                <p className="text-2xl font-bold">{analyses.length}</p>
              </div>
              <Brain className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">运行中</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {analyses.filter(a => a.status === 'running').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-green-600">
                  {analyses.filter(a => a.status === 'completed').length}
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
                <p className="text-sm text-gray-600">平均置信度</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(analyses.reduce((sum, a) => sum + a.algorithm.confidence, 0) / analyses.length).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI分析列表</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                模型设置
              </Button>
              <Button>
                <Brain className="h-4 w-4 mr-2" />
                新建分析
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
                  placeholder="搜索分析名称..."
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
                { value: 'anomaly_detection', label: '异常检测' },
                { value: 'predictive_maintenance', label: '预测维护' },
                { value: 'pattern_recognition', label: '模式识别' },
                { value: 'risk_assessment', label: '风险评估' },
                { value: 'optimization', label: '优化分析' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'running', label: '运行中' },
                { value: 'completed', label: '已完成' },
                { value: 'failed', label: '失败' },
                { value: 'scheduled', label: '已调度' }
              ]}
            />
          </div>

          {/* 分析表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>分析信息</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>算法模型</TableHead>
                <TableHead>置信度</TableHead>
                <TableHead>执行进度</TableHead>
                <TableHead>洞察数量</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnalyses.map((analysis) => {
                const TypeIcon = getTypeIcon(analysis.type);
                return (
                  <TableRow key={analysis.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <TypeIcon className={`h-5 w-5 ${
                          analysis.status === 'completed' ? 'text-green-500' :
                          analysis.status === 'running' ? 'text-yellow-500' :
                          analysis.status === 'failed' ? 'text-red-500' :
                          'text-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium">{analysis.name}</div>
                          <div className="text-sm text-gray-500">
                            by {analysis.createdBy}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getTypeLabel(analysis.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={analysis.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{analysis.algorithm.model}</div>
                        <div className="text-gray-500">{analysis.algorithm.version}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              analysis.algorithm.confidence >= 90 ? 'bg-green-500' :
                              analysis.algorithm.confidence >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${analysis.algorithm.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm">{analysis.algorithm.confidence}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {analysis.status === 'running' ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>进度</span>
                            <span>{analysis.execution.progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${analysis.execution.progress}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            {analysis.execution.currentStage}
                          </div>
                        </div>
                      ) : analysis.status === 'completed' ? (
                        <div className="text-sm text-green-600">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          已完成
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {analysis.status === 'completed' ? (
                        <div className="text-sm">
                          <div className="font-medium">{analysis.results.insights.length}</div>
                          <div className="text-gray-500">
                            {analysis.results.insights.filter(i => i.severity === 'critical').length} 关键
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatRelativeTime(analysis.createdAt)}</div>
                        {analysis.execution.duration && (
                          <div className="text-gray-500">
                            耗时: {analysis.execution.duration}分钟
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAnalysis(analysis);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {analysis.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
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

      {/* 分析详情模态框 */}
      {selectedAnalysis && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedAnalysis(null);
          }}
          title="AI分析详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">分析名称:</span> {selectedAnalysis.name}</div>
                  <div><span className="text-gray-500">分析类型:</span> {getTypeLabel(selectedAnalysis.type)}</div>
                  <div><span className="text-gray-500">优先级:</span> {selectedAnalysis.priority}</div>
                  <div><span className="text-gray-500">创建者:</span> {selectedAnalysis.createdBy}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">算法信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">模型:</span> {selectedAnalysis.algorithm.model}</div>
                  <div><span className="text-gray-500">版本:</span> {selectedAnalysis.algorithm.version}</div>
                  <div><span className="text-gray-500">置信度:</span> {selectedAnalysis.algorithm.confidence}%</div>
                  <div><span className="text-gray-500">准确率:</span> {selectedAnalysis.algorithm.accuracy}%</div>
                </div>
              </div>
            </div>

            {/* 数据源信息 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">数据源</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">数据类型:</span>
                  <div className="font-medium">{selectedAnalysis.dataSource.type}</div>
                </div>
                <div>
                  <span className="text-gray-500">设备数量:</span>
                  <div className="font-medium">{selectedAnalysis.dataSource.devices.length}</div>
                </div>
                <div>
                  <span className="text-gray-500">目标数量:</span>
                  <div className="font-medium">{selectedAnalysis.dataSource.targets.length}</div>
                </div>
                <div>
                  <span className="text-gray-500">时间范围:</span>
                  <div className="font-medium">
                    {Math.ceil((new Date(selectedAnalysis.dataSource.period.endDate).getTime() -
                               new Date(selectedAnalysis.dataSource.period.startDate).getTime()) / (1000 * 60 * 60 * 24))}天
                  </div>
                </div>
              </div>
            </div>

            {/* 分析结果 */}
            {selectedAnalysis.status === 'completed' && selectedAnalysis.results.insights.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">分析洞察</h4>
                <div className="space-y-3">
                  {selectedAnalysis.results.insights.map((insight) => {
                    const InsightIcon = getInsightIcon(insight.type);
                    return (
                      <div key={insight.id} className={`border rounded-lg p-4 ${getSeverityColor(insight.severity)}`}>
                        <div className="flex items-start space-x-3">
                          <InsightIcon className="h-5 w-5 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">{insight.title}</h5>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs">置信度: {insight.confidence}%</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  insight.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                  insight.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                  insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {insight.severity}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm mt-1">{insight.description}</p>
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                              <strong>影响:</strong> {insight.impact}
                            </div>
                            <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                              <strong>建议:</strong> {insight.recommendation}
                            </div>
                            {insight.evidence.length > 0 && (
                              <div className="mt-2">
                                <strong className="text-sm">证据:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {insight.evidence.map((evidence, index) => (
                                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                      {evidence}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 分析指标 */}
            {selectedAnalysis.status === 'completed' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">分析指标</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-blue-600 font-medium">数据点</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {selectedAnalysis.results.metrics.totalDataPoints.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-red-600 font-medium">异常检测</div>
                    <div className="text-2xl font-bold text-red-800">
                      {selectedAnalysis.results.metrics.anomaliesDetected}
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-medium">模式发现</div>
                    <div className="text-2xl font-bold text-green-800">
                      {selectedAnalysis.results.metrics.patternsFound}
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-purple-600 font-medium">预测生成</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {selectedAnalysis.results.metrics.predictionsGenerated}
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="text-yellow-600 font-medium">置信分数</div>
                    <div className="text-2xl font-bold text-yellow-800">
                      {selectedAnalysis.results.metrics.confidenceScore}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 执行信息 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">执行信息</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">开始时间:</span>
                  <div className="font-medium">{formatRelativeTime(selectedAnalysis.execution.startedAt)}</div>
                </div>
                {selectedAnalysis.execution.completedAt && (
                  <div>
                    <span className="text-gray-500">完成时间:</span>
                    <div className="font-medium">{formatRelativeTime(selectedAnalysis.execution.completedAt)}</div>
                  </div>
                )}
                {selectedAnalysis.execution.duration && (
                  <div>
                    <span className="text-gray-500">执行时长:</span>
                    <div className="font-medium">{selectedAnalysis.execution.duration}分钟</div>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">当前阶段:</span>
                  <div className="font-medium">{selectedAnalysis.execution.currentStage}</div>
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            {selectedAnalysis.status === 'completed' && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                导出结果
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default AIAnalysis;
