import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  FileText,
  Download,
  Eye,
  Settings,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 测试用例类型定义
interface TestCase {
  id: string;
  name: string;
  description: string;
  capabilityId: string;
  capabilityName: string;
  testType: 'functional' | 'performance' | 'stress' | 'integration' | 'regression';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'ready' | 'running' | 'passed' | 'failed' | 'skipped';
  testSteps: {
    id: string;
    name: string;
    description: string;
    expectedResult: string;
    actualResult?: string;
    status: 'pending' | 'passed' | 'failed' | 'skipped';
  }[];
  testData: {
    input: any;
    expectedOutput: any;
    actualOutput?: any;
  };
  environment: {
    platform: string;
    version: string;
    configuration: any;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastExecuted?: string;
  executionTime?: number; // 毫秒
  executionCount: number;
  passRate: number; // 百分比
}

// 测试执行结果类型定义
interface TestExecution {
  id: string;
  testCaseId: string;
  status: 'running' | 'passed' | 'failed' | 'aborted';
  startTime: string;
  endTime?: string;
  duration?: number;
  results: {
    stepId: string;
    status: 'passed' | 'failed' | 'skipped';
    actualResult: string;
    errorMessage?: string;
    screenshot?: string;
  }[];
  logs: string[];
  metrics: {
    cpu: number;
    memory: number;
    latency: number;
    throughput: number;
  };
}

// Mock数据
const mockTestCases: TestCase[] = [
  {
    id: 'test-1',
    name: '视频采集功能测试',
    description: '测试4K视频采集的基本功能',
    capabilityId: 'cap-video-capture',
    capabilityName: '视频采集能力',
    testType: 'functional',
    priority: 'high',
    status: 'passed',
    testSteps: [
      {
        id: 'step-1',
        name: '初始化摄像头',
        description: '启动摄像头并设置参数',
        expectedResult: '摄像头成功启动，状态为就绪',
        actualResult: '摄像头启动成功',
        status: 'passed'
      },
      {
        id: 'step-2',
        name: '开始录制',
        description: '开始4K视频录制',
        expectedResult: '视频录制开始，帧率稳定在30fps',
        actualResult: '录制开始，帧率29.8fps',
        status: 'passed'
      },
      {
        id: 'step-3',
        name: '停止录制',
        description: '停止视频录制并保存文件',
        expectedResult: '录制停止，文件保存成功',
        actualResult: '录制停止，文件已保存',
        status: 'passed'
      }
    ],
    testData: {
      input: {
        resolution: '3840x2160',
        frameRate: 30,
        duration: 60
      },
      expectedOutput: {
        fileSize: '~500MB',
        format: 'mp4',
        quality: 'high'
      },
      actualOutput: {
        fileSize: '487MB',
        format: 'mp4',
        quality: 'high'
      }
    },
    environment: {
      platform: 'Linux',
      version: '5.4.0',
      configuration: {
        gpu: 'NVIDIA RTX 3080',
        memory: '16GB'
      }
    },
    createdBy: '张工程师',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z',
    lastExecuted: '2024-07-17T09:00:00Z',
    executionTime: 65000,
    executionCount: 25,
    passRate: 96
  },
  {
    id: 'test-2',
    name: 'AI分析性能测试',
    description: '测试AI分析能力的性能指标',
    capabilityId: 'cap-ai-analysis',
    capabilityName: 'AI分析能力',
    testType: 'performance',
    priority: 'critical',
    status: 'running',
    testSteps: [
      {
        id: 'step-1',
        name: '加载AI模型',
        description: '加载缺陷检测模型',
        expectedResult: '模型加载时间 < 5秒',
        actualResult: '模型加载中...',
        status: 'pending'
      },
      {
        id: 'step-2',
        name: '批量图像分析',
        description: '分析100张测试图像',
        expectedResult: '平均处理时间 < 200ms/张',
        status: 'pending'
      },
      {
        id: 'step-3',
        name: '准确率验证',
        description: '验证检测准确率',
        expectedResult: '准确率 > 95%',
        status: 'pending'
      }
    ],
    testData: {
      input: {
        imageCount: 100,
        imageSize: '1920x1080',
        format: 'jpg'
      },
      expectedOutput: {
        avgProcessingTime: 200,
        accuracy: 95,
        throughput: 5
      }
    },
    environment: {
      platform: 'Linux',
      version: '5.4.0',
      configuration: {
        gpu: 'NVIDIA RTX 3080',
        memory: '32GB'
      }
    },
    createdBy: '李技术员',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-07-10T16:20:00Z',
    lastExecuted: '2024-07-17T08:30:00Z',
    executionTime: 120000,
    executionCount: 15,
    passRate: 87
  },
  {
    id: 'test-3',
    name: '温度监控压力测试',
    description: '测试温度监控在高负载下的稳定性',
    capabilityId: 'cap-temp-monitor',
    capabilityName: '温度监控能力',
    testType: 'stress',
    priority: 'medium',
    status: 'failed',
    testSteps: [
      {
        id: 'step-1',
        name: '启动监控',
        description: '启动温度监控服务',
        expectedResult: '监控服务正常启动',
        actualResult: '监控服务启动成功',
        status: 'passed'
      },
      {
        id: 'step-2',
        name: '高频采样',
        description: '以100Hz频率采样温度数据',
        expectedResult: '数据采样稳定，无丢失',
        actualResult: '采样频率下降到85Hz，有数据丢失',
        status: 'failed'
      },
      {
        id: 'step-3',
        name: '报警触发',
        description: '模拟温度异常触发报警',
        expectedResult: '报警及时触发，响应时间 < 1秒',
        status: 'skipped'
      }
    ],
    testData: {
      input: {
        samplingRate: 100,
        duration: 3600,
        simulatedTemp: 85
      },
      expectedOutput: {
        dataLoss: 0,
        responseTime: 1000,
        accuracy: 99
      },
      actualOutput: {
        dataLoss: 15,
        responseTime: 1200,
        accuracy: 94
      }
    },
    environment: {
      platform: 'Linux',
      version: '5.4.0',
      configuration: {
        cpu: 'Intel i7-9700K',
        memory: '16GB'
      }
    },
    createdBy: '王维护员',
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2024-07-14T11:45:00Z',
    lastExecuted: '2024-07-16T15:30:00Z',
    executionTime: 3600000,
    executionCount: 8,
    passRate: 62
  }
];

// 测试用例表单组件
interface TestCaseFormProps {
  testCase?: TestCase;
  onSubmit: (testCase: Partial<TestCase>) => void;
  onCancel: () => void;
}

function TestCaseForm({ testCase, onSubmit, onCancel }: TestCaseFormProps) {
  const [formData, setFormData] = useState({
    name: testCase?.name || '',
    description: testCase?.description || '',
    capabilityId: testCase?.capabilityId || '',
    capabilityName: testCase?.capabilityName || '',
    testType: testCase?.testType || 'functional',
    priority: testCase?.priority || 'medium'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock能力数据
  const capabilities = [
    { value: 'cap-video-capture', label: '视频采集能力' },
    { value: 'cap-ai-analysis', label: 'AI分析能力' },
    { value: 'cap-temp-monitor', label: '温度监控能力' },
    { value: 'cap-navigation', label: '导航能力' }
  ];

  const testTypes = [
    { value: 'functional', label: '功能测试' },
    { value: 'performance', label: '性能测试' },
    { value: 'stress', label: '压力测试' },
    { value: 'integration', label: '集成测试' },
    { value: 'regression', label: '回归测试' }
  ];

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '关键' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '测试用例名称不能为空';
    }
    if (!formData.capabilityId) {
      newErrors.capabilityId = '请选择测试能力';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const selectedCapability = capabilities.find(c => c.value === formData.capabilityId);
    const testCaseData: Partial<TestCase> = {
      ...formData,
      capabilityName: selectedCapability?.label,
      status: testCase?.status || 'draft',
      testSteps: testCase?.testSteps || [],
      testData: testCase?.testData || { input: {}, expectedOutput: {} },
      environment: testCase?.environment || { platform: 'Linux', version: '1.0.0', configuration: {} },
      createdBy: testCase?.createdBy || '当前用户',
      executionCount: testCase?.executionCount || 0,
      passRate: testCase?.passRate || 0,
      updatedAt: new Date().toISOString()
    };

    if (testCase) {
      testCaseData.id = testCase.id;
    } else {
      testCaseData.id = `test-${Date.now()}`;
      testCaseData.createdAt = new Date().toISOString();
    }

    onSubmit(testCaseData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="测试用例名称" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入测试用例名称"
          />
        </FormField>

        <FormField label="测试能力" required error={errors.capabilityId}>
          <Select
            value={formData.capabilityId}
            onChange={(value) => {
              const selectedCapability = capabilities.find(c => c.value === value);
              setFormData({ 
                ...formData, 
                capabilityId: value,
                capabilityName: selectedCapability?.label || ''
              });
            }}
            options={capabilities}
            placeholder="请选择测试能力"
          />
        </FormField>

        <FormField label="测试类型">
          <Select
            value={formData.testType}
            onChange={(value) => setFormData({ ...formData, testType: value as TestCase['testType'] })}
            options={testTypes}
          />
        </FormField>

        <FormField label="优先级">
          <Select
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as TestCase['priority'] })}
            options={priorityOptions}
          />
        </FormField>
      </div>

      <FormField label="测试描述">
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请输入测试用例描述"
          rows={3}
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {testCase ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function CapabilityTesting() {
  const [testCases, setTestCases] = useState<TestCase[]>(mockTestCases);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'testcases' | 'execution' | 'reports'>('testcases');
  
  // 模态框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);

  // 筛选测试用例
  const filteredTestCases = testCases.filter(testCase => {
    const matchesSearch = testCase.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testCase.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || testCase.testType === typeFilter;
    const matchesStatus = statusFilter === 'all' || testCase.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // 事件处理函数
  const handleAddTestCase = (testCaseData: Partial<TestCase>) => {
    setTestCases([...testCases, testCaseData as TestCase]);
    setShowAddModal(false);
  };

  const handleUpdateTestCase = (testCaseData: Partial<TestCase>) => {
    if (selectedTestCase?.id) {
      setTestCases(testCases.map(tc => 
        tc.id === selectedTestCase.id ? { ...tc, ...testCaseData } : tc
      ));
      setShowEditModal(false);
      setSelectedTestCase(null);
    }
  };

  const handleDeleteTestCase = () => {
    if (selectedTestCase?.id) {
      setTestCases(testCases.filter(tc => tc.id !== selectedTestCase.id));
      setShowDeleteModal(false);
      setSelectedTestCase(null);
    }
  };

  const handleExecuteTest = (testCase: TestCase) => {
    // 模拟执行测试
    setTestCases(testCases.map(tc => 
      tc.id === testCase.id 
        ? { 
            ...tc, 
            status: 'running',
            lastExecuted: new Date().toISOString()
          }
        : tc
    ));
    
    // 模拟测试完成
    setTimeout(() => {
      const success = Math.random() > 0.3;
      setTestCases(prev => prev.map(tc => 
        tc.id === testCase.id 
          ? { 
              ...tc, 
              status: success ? 'passed' : 'failed',
              executionCount: tc.executionCount + 1,
              passRate: success ? Math.min(tc.passRate + 2, 100) : Math.max(tc.passRate - 5, 0),
              executionTime: Math.floor(Math.random() * 60000) + 10000
            }
          : tc
      ));
    }, 5000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return CheckCircle;
      case 'failed': return XCircle;
      case 'running': return Clock;
      case 'ready': return Play;
      default: return FileText;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      functional: '功能测试',
      performance: '性能测试',
      stress: '压力测试',
      integration: '集成测试',
      regression: '回归测试'
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

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">能力测试</h1>
        <p className="text-gray-600 mt-1">管理设备能力测试用例和执行结果</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">测试用例</p>
                <p className="text-2xl font-bold">{testCases.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">通过率</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(testCases.reduce((sum, tc) => sum + tc.passRate, 0) / testCases.length)}%
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
                <p className="text-sm text-gray-600">执行中</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {testCases.filter(tc => tc.status === 'running').length}
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
                <p className="text-sm text-gray-600">失败用例</p>
                <p className="text-2xl font-bold text-red-600">
                  {testCases.filter(tc => tc.status === 'failed').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('testcases')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'testcases'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            测试用例
          </button>
          <button
            onClick={() => setActiveTab('execution')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'execution'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            执行监控
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            测试报告
          </button>
        </nav>
      </div>

      {/* 测试用例标签页 */}
      {activeTab === 'testcases' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>测试用例列表</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加用例
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
                    placeholder="搜索测试用例名称或描述..."
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
                  { value: 'functional', label: '功能测试' },
                  { value: 'performance', label: '性能测试' },
                  { value: 'stress', label: '压力测试' },
                  { value: 'integration', label: '集成测试' },
                  { value: 'regression', label: '回归测试' }
                ]}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'draft', label: '草稿' },
                  { value: 'ready', label: '就绪' },
                  { value: 'running', label: '执行中' },
                  { value: 'passed', label: '通过' },
                  { value: 'failed', label: '失败' },
                  { value: 'skipped', label: '跳过' }
                ]}
              />
            </div>

            {/* 测试用例表格 */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>测试用例</TableHead>
                  <TableHead>测试能力</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>通过率</TableHead>
                  <TableHead>执行次数</TableHead>
                  <TableHead>最后执行</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestCases.map((testCase) => {
                  const StatusIcon = getStatusIcon(testCase.status);
                  return (
                    <TableRow key={testCase.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`h-5 w-5 ${
                            testCase.status === 'passed' ? 'text-green-500' :
                            testCase.status === 'failed' ? 'text-red-500' :
                            testCase.status === 'running' ? 'text-yellow-500' :
                            'text-gray-400'
                          }`} />
                          <div>
                            <div className="font-medium">{testCase.name}</div>
                            <div className="text-sm text-gray-500">{testCase.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{testCase.capabilityName}</div>
                          <div className="text-gray-500">{testCase.capabilityId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {getTypeLabel(testCase.testType)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(testCase.priority)}`}>
                          {testCase.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={testCase.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                testCase.passRate >= 90 ? 'bg-green-500' :
                                testCase.passRate >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${testCase.passRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{testCase.passRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{testCase.executionCount}</TableCell>
                      <TableCell>
                        {testCase.lastExecuted ? formatRelativeTime(testCase.lastExecuted) : '未执行'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExecuteTest(testCase)}
                            disabled={testCase.status === 'running'}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTestCase(testCase);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTestCase(testCase);
                              setShowDeleteModal(true);
                            }}
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
      )}

      {/* 执行监控标签页 */}
      {activeTab === 'execution' && (
        <Card>
          <CardHeader>
            <CardTitle>测试执行监控</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">测试执行监控功能开发中...</p>
              <p className="text-sm text-gray-400 mt-2">将显示实时测试执行状态、进度和日志</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 测试报告标签页 */}
      {activeTab === 'reports' && (
        <Card>
          <CardHeader>
            <CardTitle>测试报告</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">测试报告功能开发中...</p>
              <p className="text-sm text-gray-400 mt-2">将提供详细的测试结果分析和统计报告</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 添加测试用例模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加测试用例"
        size="lg"
      >
        <TestCaseForm
          onSubmit={handleAddTestCase}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 编辑测试用例模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTestCase(null);
        }}
        title="编辑测试用例"
        size="lg"
      >
        <TestCaseForm
          testCase={selectedTestCase || undefined}
          onSubmit={handleUpdateTestCase}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedTestCase(null);
          }}
        />
      </Modal>

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTestCase(null);
        }}
        onConfirm={handleDeleteTestCase}
        title="删除测试用例"
        message={`确定要删除测试用例 "${selectedTestCase?.name}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default CapabilityTesting;
