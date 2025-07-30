import React, { useState, useEffect } from 'react';
import {
  Workflow,
  GitBranch,
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  ArrowDown,
  Zap,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 任务工作流类型定义
interface TaskWorkflow {
  id: string;
  name: string;
  description: string;
  category: 'inspection' | 'maintenance' | 'emergency' | 'compliance';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  version: string;
  steps: WorkflowStep[];
  triggers: {
    type: 'manual' | 'scheduled' | 'event' | 'condition';
    config: any;
  }[];
  variables: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date';
    defaultValue?: any;
    required: boolean;
  }[];
  permissions: {
    execute: string[];
    modify: string[];
    view: string[];
  };
  metrics: {
    totalExecutions: number;
    successRate: number;
    avgDuration: number;
    lastExecuted?: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'task' | 'decision' | 'parallel' | 'wait' | 'notification' | 'approval';
  description: string;
  position: { x: number; y: number };
  config: {
    assignee?: string;
    estimatedDuration?: number;
    conditions?: any[];
    approvers?: string[];
    template?: string;
    timeout?: number;
  };
  connections: {
    stepId: string;
    condition?: string;
    label?: string;
  }[];
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  result?: any;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep?: string;
  progress: number;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  executedBy: string;
  variables: Record<string, any>;
  stepResults: Record<string, any>;
  logs: {
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    stepId?: string;
  }[];
}

// Mock数据
const mockWorkflows: TaskWorkflow[] = [
  {
    id: 'workflow-1',
    name: '标准巡检工作流',
    description: '标准的设备巡检工作流程，包含准备、执行、验证和报告阶段',
    category: 'inspection',
    status: 'active',
    version: 'v1.2',
    steps: [
      {
        id: 'step-1',
        name: '任务准备',
        type: 'task',
        description: '检查设备状态，准备巡检工具',
        position: { x: 100, y: 100 },
        config: {
          assignee: 'operator',
          estimatedDuration: 10
        },
        connections: [{ stepId: 'step-2' }]
      },
      {
        id: 'step-2',
        name: '安全检查',
        type: 'approval',
        description: '安全员确认现场安全条件',
        position: { x: 300, y: 100 },
        config: {
          approvers: ['safety_officer'],
          timeout: 30
        },
        connections: [
          { stepId: 'step-3', condition: 'approved', label: '通过' },
          { stepId: 'step-end', condition: 'rejected', label: '拒绝' }
        ]
      },
      {
        id: 'step-3',
        name: '执行巡检',
        type: 'task',
        description: '执行具体的巡检任务',
        position: { x: 500, y: 100 },
        config: {
          assignee: 'operator',
          estimatedDuration: 45
        },
        connections: [{ stepId: 'step-4' }]
      },
      {
        id: 'step-4',
        name: '结果验证',
        type: 'decision',
        description: '验证巡检结果是否符合标准',
        position: { x: 700, y: 100 },
        config: {
          conditions: [
            { field: 'quality_score', operator: '>=', value: 80 }
          ]
        },
        connections: [
          { stepId: 'step-5', condition: 'pass', label: '合格' },
          { stepId: 'step-3', condition: 'fail', label: '重新执行' }
        ]
      },
      {
        id: 'step-5',
        name: '生成报告',
        type: 'task',
        description: '生成巡检报告',
        position: { x: 900, y: 100 },
        config: {
          assignee: 'system',
          estimatedDuration: 5
        },
        connections: [{ stepId: 'step-end' }]
      },
      {
        id: 'step-end',
        name: '流程结束',
        type: 'task',
        description: '工作流结束',
        position: { x: 1100, y: 100 },
        config: {},
        connections: []
      }
    ],
    triggers: [
      {
        type: 'scheduled',
        config: {
          cron: '0 9 * * 1-5',
          timezone: 'Asia/Shanghai'
        }
      },
      {
        type: 'event',
        config: {
          eventType: 'device_alert',
          conditions: { severity: 'high' }
        }
      }
    ],
    variables: [
      {
        name: 'device_id',
        type: 'string',
        required: true
      },
      {
        name: 'inspection_type',
        type: 'string',
        defaultValue: 'routine',
        required: true
      },
      {
        name: 'quality_threshold',
        type: 'number',
        defaultValue: 80,
        required: false
      }
    ],
    permissions: {
      execute: ['operator', 'engineer'],
      modify: ['admin', 'workflow_designer'],
      view: ['all']
    },
    metrics: {
      totalExecutions: 156,
      successRate: 94.2,
      avgDuration: 65,
      lastExecuted: '2024-07-17T09:30:00Z'
    },
    createdAt: '2024-06-01T10:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z',
    createdBy: '张工程师'
  },
  {
    id: 'workflow-2',
    name: '紧急响应工作流',
    description: '设备异常时的紧急响应处理流程',
    category: 'emergency',
    status: 'active',
    version: 'v2.0',
    steps: [
      {
        id: 'step-1',
        name: '异常确认',
        type: 'task',
        description: '确认异常情况和严重程度',
        position: { x: 100, y: 100 },
        config: {
          assignee: 'on_duty_engineer',
          estimatedDuration: 5
        },
        connections: [{ stepId: 'step-2' }]
      },
      {
        id: 'step-2',
        name: '风险评估',
        type: 'decision',
        description: '评估风险等级',
        position: { x: 300, y: 100 },
        config: {
          conditions: [
            { field: 'risk_level', operator: '>=', value: 'high' }
          ]
        },
        connections: [
          { stepId: 'step-3', condition: 'high_risk', label: '高风险' },
          { stepId: 'step-5', condition: 'low_risk', label: '低风险' }
        ]
      },
      {
        id: 'step-3',
        name: '紧急通知',
        type: 'notification',
        description: '通知相关人员',
        position: { x: 500, y: 50 },
        config: {
          template: 'emergency_alert',
          timeout: 2
        },
        connections: [{ stepId: 'step-4' }]
      },
      {
        id: 'step-4',
        name: '现场处置',
        type: 'task',
        description: '现场紧急处置',
        position: { x: 700, y: 50 },
        config: {
          assignee: 'emergency_team',
          estimatedDuration: 30
        },
        connections: [{ stepId: 'step-6' }]
      },
      {
        id: 'step-5',
        name: '常规处理',
        type: 'task',
        description: '按常规流程处理',
        position: { x: 500, y: 150 },
        config: {
          assignee: 'operator',
          estimatedDuration: 20
        },
        connections: [{ stepId: 'step-6' }]
      },
      {
        id: 'step-6',
        name: '结果记录',
        type: 'task',
        description: '记录处理结果',
        position: { x: 900, y: 100 },
        config: {
          assignee: 'system',
          estimatedDuration: 3
        },
        connections: []
      }
    ],
    triggers: [
      {
        type: 'event',
        config: {
          eventType: 'device_exception',
          conditions: { severity: ['critical', 'high'] }
        }
      }
    ],
    variables: [
      {
        name: 'exception_id',
        type: 'string',
        required: true
      },
      {
        name: 'device_id',
        type: 'string',
        required: true
      },
      {
        name: 'risk_level',
        type: 'string',
        required: true
      }
    ],
    permissions: {
      execute: ['engineer', 'emergency_team'],
      modify: ['admin'],
      view: ['all']
    },
    metrics: {
      totalExecutions: 23,
      successRate: 100,
      avgDuration: 25,
      lastExecuted: '2024-07-16T15:45:00Z'
    },
    createdAt: '2024-06-15T09:00:00Z',
    updatedAt: '2024-07-10T11:20:00Z',
    createdBy: '李主管'
  }
];

const mockExecutions: WorkflowExecution[] = [
  {
    id: 'exec-1',
    workflowId: 'workflow-1',
    workflowName: '标准巡检工作流',
    status: 'running',
    currentStep: 'step-3',
    progress: 60,
    startedAt: '2024-07-17T09:00:00Z',
    executedBy: '张工程师',
    variables: {
      device_id: 'device-1',
      inspection_type: 'routine',
      quality_threshold: 80
    },
    stepResults: {
      'step-1': { status: 'completed', duration: 8 },
      'step-2': { status: 'completed', approved: true, duration: 5 }
    },
    logs: [
      {
        timestamp: '2024-07-17T09:00:00Z',
        level: 'info',
        message: '工作流开始执行',
        stepId: 'step-1'
      },
      {
        timestamp: '2024-07-17T09:08:00Z',
        level: 'info',
        message: '任务准备完成',
        stepId: 'step-1'
      },
      {
        timestamp: '2024-07-17T09:13:00Z',
        level: 'info',
        message: '安全检查通过',
        stepId: 'step-2'
      },
      {
        timestamp: '2024-07-17T09:13:30Z',
        level: 'info',
        message: '开始执行巡检',
        stepId: 'step-3'
      }
    ]
  },
  {
    id: 'exec-2',
    workflowId: 'workflow-2',
    workflowName: '紧急响应工作流',
    status: 'completed',
    progress: 100,
    startedAt: '2024-07-16T15:30:00Z',
    completedAt: '2024-07-16T16:00:00Z',
    duration: 30,
    executedBy: '李工程师',
    variables: {
      exception_id: 'exc-001',
      device_id: 'device-2',
      risk_level: 'high'
    },
    stepResults: {
      'step-1': { status: 'completed', duration: 3 },
      'step-2': { status: 'completed', risk_assessment: 'high', duration: 2 },
      'step-3': { status: 'completed', notified: ['张主管', '王技术员'], duration: 1 },
      'step-4': { status: 'completed', resolution: '更换故障部件', duration: 20 },
      'step-6': { status: 'completed', report_id: 'rpt-001', duration: 4 }
    },
    logs: [
      {
        timestamp: '2024-07-16T15:30:00Z',
        level: 'info',
        message: '紧急响应工作流启动'
      },
      {
        timestamp: '2024-07-16T15:33:00Z',
        level: 'info',
        message: '异常确认完成，风险等级：高'
      },
      {
        timestamp: '2024-07-16T15:35:00Z',
        level: 'info',
        message: '紧急通知已发送'
      },
      {
        timestamp: '2024-07-16T15:55:00Z',
        level: 'info',
        message: '现场处置完成'
      },
      {
        timestamp: '2024-07-16T16:00:00Z',
        level: 'info',
        message: '工作流执行完成'
      }
    ]
  }
];

function TaskWorkflow() {
  const [workflows, setWorkflows] = useState<TaskWorkflow[]>(mockWorkflows);
  const [executions, setExecutions] = useState<WorkflowExecution[]>(mockExecutions);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<TaskWorkflow | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [activeTab, setActiveTab] = useState<'workflows' | 'executions'>('workflows');
  
  // 模态框状态
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);

  // 自动更新执行状态
  useEffect(() => {
    const interval = setInterval(() => {
      setExecutions(prev => prev.map(execution => {
        if (execution.status === 'running') {
          const newProgress = Math.min(execution.progress + Math.random() * 10, 100);
          return {
            ...execution,
            progress: newProgress,
            ...(newProgress >= 100 && {
              status: 'completed',
              completedAt: new Date().toISOString(),
              duration: Math.floor((new Date().getTime() - new Date(execution.startedAt).getTime()) / 60000)
            })
          };
        }
        return execution;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 筛选工作流
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || workflow.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 筛选执行记录
  const filteredExecutions = executions.filter(execution => {
    const matchesSearch = execution.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         execution.executedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || execution.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'inspection': return Eye;
      case 'maintenance': return Settings;
      case 'emergency': return AlertTriangle;
      case 'compliance': return CheckCircle;
      default: return Workflow;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      inspection: '巡检',
      maintenance: '维护',
      emergency: '紧急',
      compliance: '合规'
    };
    return categoryMap[category] || category;
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return Play;
      case 'decision': return GitBranch;
      case 'parallel': return Users;
      case 'wait': return Clock;
      case 'notification': return AlertTriangle;
      case 'approval': return CheckCircle;
      default: return Square;
    }
  };

  const getStepTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      task: '任务',
      decision: '决策',
      parallel: '并行',
      wait: '等待',
      notification: '通知',
      approval: '审批'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">任务工作流</h1>
        <p className="text-gray-600 mt-1">设计和管理任务执行工作流程</p>
      </div>

      {/* 标签页切换 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('workflows')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'workflows'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          工作流模板
        </button>
        <button
          onClick={() => setActiveTab('executions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'executions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          执行记录
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">工作流总数</p>
                <p className="text-2xl font-bold">{workflows.length}</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃工作流</p>
                <p className="text-2xl font-bold text-green-600">
                  {workflows.filter(w => w.status === 'active').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">执行中</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {executions.filter(e => e.status === 'running').length}
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
                <p className="text-sm text-gray-600">平均成功率</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(workflows.reduce((sum, w) => sum + w.metrics.successRate, 0) / workflows.length).toFixed(1)}%
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
            <CardTitle>
              {activeTab === 'workflows' ? '工作流模板' : '执行记录'}
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              {activeTab === 'workflows' && (
                <>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    设计器
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    创建工作流
                  </Button>
                </>
              )}
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
                  placeholder={activeTab === 'workflows' ? "搜索工作流名称或描述..." : "搜索执行记录..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {activeTab === 'workflows' && (
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'all', label: '全部分类' },
                  { value: 'inspection', label: '巡检' },
                  { value: 'maintenance', label: '维护' },
                  { value: 'emergency', label: '紧急' },
                  { value: 'compliance', label: '合规' }
                ]}
              />
            )}
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={
                activeTab === 'workflows'
                  ? [
                      { value: 'all', label: '全部状态' },
                      { value: 'draft', label: '草稿' },
                      { value: 'active', label: '活跃' },
                      { value: 'paused', label: '暂停' },
                      { value: 'archived', label: '归档' }
                    ]
                  : [
                      { value: 'all', label: '全部状态' },
                      { value: 'running', label: '运行中' },
                      { value: 'completed', label: '已完成' },
                      { value: 'failed', label: '失败' },
                      { value: 'cancelled', label: '已取消' }
                    ]
              }
            />
          </div>

          {/* 工作流表格 */}
          {activeTab === 'workflows' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工作流信息</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>步骤数</TableHead>
                  <TableHead>执行统计</TableHead>
                  <TableHead>最后更新</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkflows.map((workflow) => {
                  const CategoryIcon = getCategoryIcon(workflow.category);
                  return (
                    <TableRow key={workflow.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <CategoryIcon className={`h-5 w-5 ${
                            workflow.status === 'active' ? 'text-green-500' :
                            workflow.status === 'paused' ? 'text-yellow-500' :
                            'text-gray-400'
                          }`} />
                          <div>
                            <div className="font-medium">{workflow.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {workflow.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {getCategoryLabel(workflow.category)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{workflow.version}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={workflow.status} />
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{workflow.steps.length} 步骤</div>
                          <div className="text-gray-500">
                            {workflow.triggers.length} 触发器
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{workflow.metrics.totalExecutions} 次</div>
                          <div className="text-gray-500">
                            成功率: {workflow.metrics.successRate}%
                          </div>
                          <div className="text-gray-500">
                            平均: {workflow.metrics.avgDuration}分钟
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatRelativeTime(workflow.updatedAt)}</div>
                          <div className="text-gray-500">by {workflow.createdBy}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedWorkflow(workflow);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {workflow.status === 'active' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
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
          )}

          {/* 执行记录表格 */}
          {activeTab === 'executions' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>执行信息</TableHead>
                  <TableHead>工作流</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>执行时间</TableHead>
                  <TableHead>执行人</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutions.map((execution) => {
                  return (
                    <TableRow key={execution.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Workflow className={`h-5 w-5 ${
                            execution.status === 'running' ? 'text-blue-500' :
                            execution.status === 'completed' ? 'text-green-500' :
                            execution.status === 'failed' ? 'text-red-500' :
                            'text-gray-400'
                          }`} />
                          <div>
                            <div className="font-medium">执行 #{execution.id.slice(-6)}</div>
                            <div className="text-sm text-gray-500">
                              {execution.currentStep && `当前: ${execution.currentStep}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{execution.workflowName}</div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={execution.status} />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>进度</span>
                            <span>{execution.progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                execution.status === 'completed' ? 'bg-green-500' :
                                execution.status === 'failed' ? 'bg-red-500' :
                                'bg-blue-500'
                              }`}
                              style={{ width: `${execution.progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>开始: {formatRelativeTime(execution.startedAt)}</div>
                          {execution.completedAt && (
                            <div className="text-gray-500">
                              完成: {formatRelativeTime(execution.completedAt)}
                            </div>
                          )}
                          {execution.duration && (
                            <div className="text-gray-500">
                              耗时: {execution.duration}分钟
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{execution.executedBy}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedExecution(execution);
                              setShowExecutionModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {execution.status === 'running' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 工作流详情模态框 */}
      {selectedWorkflow && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedWorkflow(null);
          }}
          title="工作流详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">工作流名称:</span> {selectedWorkflow.name}</div>
                  <div><span className="text-gray-500">分类:</span> {getCategoryLabel(selectedWorkflow.category)}</div>
                  <div><span className="text-gray-500">版本:</span> {selectedWorkflow.version}</div>
                  <div><span className="text-gray-500">状态:</span> {selectedWorkflow.status}</div>
                  <div><span className="text-gray-500">创建者:</span> {selectedWorkflow.createdBy}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">执行统计</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">总执行次数:</span> {selectedWorkflow.metrics.totalExecutions}</div>
                  <div><span className="text-gray-500">成功率:</span> {selectedWorkflow.metrics.successRate}%</div>
                  <div><span className="text-gray-500">平均时长:</span> {selectedWorkflow.metrics.avgDuration}分钟</div>
                  {selectedWorkflow.metrics.lastExecuted && (
                    <div><span className="text-gray-500">最后执行:</span> {formatRelativeTime(selectedWorkflow.metrics.lastExecuted)}</div>
                  )}
                </div>
              </div>
            </div>

            {/* 工作流步骤 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">工作流步骤</h4>
              <div className="space-y-3">
                {selectedWorkflow.steps.map((step, index) => {
                  const StepIcon = getStepTypeIcon(step.type);
                  return (
                    <div key={step.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <StepIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{step.name}</div>
                        <div className="text-sm text-gray-500">{step.description}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          类型: {getStepTypeLabel(step.type)}
                          {step.config.estimatedDuration && ` • 预计: ${step.config.estimatedDuration}分钟`}
                          {step.config.assignee && ` • 负责人: ${step.config.assignee}`}
                        </div>
                      </div>
                      {step.connections.length > 0 && (
                        <div className="text-xs text-gray-400">
                          → {step.connections.length} 个连接
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 触发器配置 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">触发器</h4>
              <div className="space-y-2">
                {selectedWorkflow.triggers.map((trigger, index) => (
                  <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-800">
                      {trigger.type === 'scheduled' ? '定时触发' :
                       trigger.type === 'event' ? '事件触发' :
                       trigger.type === 'manual' ? '手动触发' :
                       '条件触发'}
                    </div>
                    <div className="text-sm text-yellow-600 mt-1">
                      {JSON.stringify(trigger.config, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 变量定义 */}
            {selectedWorkflow.variables.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">变量定义</h4>
                <div className="space-y-2">
                  {selectedWorkflow.variables.map((variable, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{variable.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({variable.type})</span>
                        {variable.required && (
                          <span className="text-xs text-red-600 ml-1">*必填</span>
                        )}
                      </div>
                      {variable.defaultValue && (
                        <div className="text-sm text-gray-600">
                          默认: {variable.defaultValue}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 权限设置 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">权限设置</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">执行权限:</span>
                  <div className="mt-1">
                    {selectedWorkflow.permissions.execute.map((role, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-1">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">修改权限:</span>
                  <div className="mt-1">
                    {selectedWorkflow.permissions.modify.map((role, index) => (
                      <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs mr-1">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">查看权限:</span>
                  <div className="mt-1">
                    {selectedWorkflow.permissions.view.map((role, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            <div className="flex space-x-2">
              {selectedWorkflow.status === 'active' && (
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  执行工作流
                </Button>
              )}
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}

      {/* 执行详情模态框 */}
      {selectedExecution && (
        <Modal
          isOpen={showExecutionModal}
          onClose={() => {
            setShowExecutionModal(false);
            setSelectedExecution(null);
          }}
          title="执行详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 执行信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">执行信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">执行ID:</span> {selectedExecution.id}</div>
                  <div><span className="text-gray-500">工作流:</span> {selectedExecution.workflowName}</div>
                  <div><span className="text-gray-500">状态:</span> {selectedExecution.status}</div>
                  <div><span className="text-gray-500">进度:</span> {selectedExecution.progress.toFixed(0)}%</div>
                  <div><span className="text-gray-500">执行人:</span> {selectedExecution.executedBy}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">时间信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">开始时间:</span> {new Date(selectedExecution.startedAt).toLocaleString('zh-CN')}</div>
                  {selectedExecution.completedAt && (
                    <div><span className="text-gray-500">完成时间:</span> {new Date(selectedExecution.completedAt).toLocaleString('zh-CN')}</div>
                  )}
                  {selectedExecution.duration && (
                    <div><span className="text-gray-500">执行时长:</span> {selectedExecution.duration}分钟</div>
                  )}
                  {selectedExecution.currentStep && (
                    <div><span className="text-gray-500">当前步骤:</span> {selectedExecution.currentStep}</div>
                  )}
                </div>
              </div>
            </div>

            {/* 变量值 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">变量值</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedExecution.variables).map(([key, value]) => (
                  <div key={key} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium text-sm">{key}</div>
                    <div className="text-sm text-gray-600">{String(value)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 步骤结果 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">步骤结果</h4>
              <div className="space-y-2">
                {Object.entries(selectedExecution.stepResults).map(([stepId, result]) => (
                  <div key={stepId} className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{stepId}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {JSON.stringify(result, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 执行日志 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">执行日志</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedExecution.logs.map((log, index) => (
                  <div key={index} className={`p-2 rounded text-sm ${
                    log.level === 'error' ? 'bg-red-50 text-red-800' :
                    log.level === 'warning' ? 'bg-yellow-50 text-yellow-800' :
                    'bg-blue-50 text-blue-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{log.message}</span>
                      <span className="text-xs opacity-75">
                        {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                      </span>
                    </div>
                    {log.stepId && (
                      <div className="text-xs opacity-75 mt-1">步骤: {log.stepId}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowExecutionModal(false)}>
              关闭
            </Button>
            {selectedExecution.status === 'running' && (
              <Button variant="outline" className="text-red-600">
                <Square className="h-4 w-4 mr-2" />
                停止执行
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default TaskWorkflow;
