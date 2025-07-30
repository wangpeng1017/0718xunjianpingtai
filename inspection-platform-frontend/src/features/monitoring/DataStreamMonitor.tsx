import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Zap,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  Square,
  Settings,
  Filter,
  Download,
  RefreshCw,
  Eye,
  BarChart3,
  LineChart,
  PieChart,
  Monitor
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 数据流类型定义
interface DataStream {
  id: string;
  name: string;
  type: 'sensor' | 'device' | 'system' | 'external';
  source: string;
  status: 'active' | 'inactive' | 'error' | 'warning';
  protocol: 'mqtt' | 'http' | 'websocket' | 'modbus' | 'tcp';
  frequency: number; // Hz
  dataRate: number; // bytes/sec
  lastUpdate: string;
  metrics: {
    totalMessages: number;
    errorCount: number;
    avgLatency: number;
    throughput: number;
    uptime: number;
  };
  config: {
    bufferSize: number;
    retryAttempts: number;
    timeout: number;
    compression: boolean;
    encryption: boolean;
  };
  alerts: {
    id: string;
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
    resolved: boolean;
  }[];
}

interface DataPoint {
  timestamp: string;
  value: number;
  quality: 'good' | 'uncertain' | 'bad';
  source: string;
}

interface StreamMetrics {
  timestamp: string;
  throughput: number;
  latency: number;
  errorRate: number;
  activeConnections: number;
}

// Mock数据
const mockStreams: DataStream[] = [
  {
    id: 'stream-1',
    name: '温度传感器数据流',
    type: 'sensor',
    source: 'temperature_sensors',
    status: 'active',
    protocol: 'mqtt',
    frequency: 1.0,
    dataRate: 1024,
    lastUpdate: '2024-07-18T01:30:00Z',
    metrics: {
      totalMessages: 156789,
      errorCount: 23,
      avgLatency: 45.2,
      throughput: 1024,
      uptime: 99.85
    },
    config: {
      bufferSize: 1000,
      retryAttempts: 3,
      timeout: 5000,
      compression: true,
      encryption: true
    },
    alerts: [
      {
        id: 'alert-1',
        level: 'warning',
        message: '传感器T-001响应延迟增加',
        timestamp: '2024-07-18T01:25:00Z',
        resolved: false
      }
    ]
  },
  {
    id: 'stream-2',
    name: '设备状态数据流',
    type: 'device',
    source: 'device_status',
    status: 'active',
    protocol: 'websocket',
    frequency: 0.5,
    dataRate: 2048,
    lastUpdate: '2024-07-18T01:30:00Z',
    metrics: {
      totalMessages: 89456,
      errorCount: 5,
      avgLatency: 23.8,
      throughput: 2048,
      uptime: 99.95
    },
    config: {
      bufferSize: 2000,
      retryAttempts: 5,
      timeout: 3000,
      compression: false,
      encryption: true
    },
    alerts: []
  },
  {
    id: 'stream-3',
    name: '系统日志数据流',
    type: 'system',
    source: 'system_logs',
    status: 'warning',
    protocol: 'http',
    frequency: 2.0,
    dataRate: 512,
    lastUpdate: '2024-07-18T01:28:00Z',
    metrics: {
      totalMessages: 234567,
      errorCount: 156,
      avgLatency: 78.5,
      throughput: 512,
      uptime: 98.2
    },
    config: {
      bufferSize: 500,
      retryAttempts: 2,
      timeout: 10000,
      compression: true,
      encryption: false
    },
    alerts: [
      {
        id: 'alert-2',
        level: 'error',
        message: '日志缓冲区接近满载',
        timestamp: '2024-07-18T01:20:00Z',
        resolved: false
      }
    ]
  },
  {
    id: 'stream-4',
    name: '外部API数据流',
    type: 'external',
    source: 'weather_api',
    status: 'error',
    protocol: 'http',
    frequency: 0.1,
    dataRate: 256,
    lastUpdate: '2024-07-18T01:15:00Z',
    metrics: {
      totalMessages: 12345,
      errorCount: 89,
      avgLatency: 1250.0,
      throughput: 0,
      uptime: 85.6
    },
    config: {
      bufferSize: 100,
      retryAttempts: 3,
      timeout: 15000,
      compression: false,
      encryption: true
    },
    alerts: [
      {
        id: 'alert-3',
        level: 'critical',
        message: 'API连接失败，超过重试限制',
        timestamp: '2024-07-18T01:15:00Z',
        resolved: false
      }
    ]
  }
];

const generateMockMetrics = (): StreamMetrics[] => {
  const metrics: StreamMetrics[] = [];
  const now = new Date();
  
  for (let i = 59; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60000).toISOString();
    metrics.push({
      timestamp,
      throughput: Math.random() * 5000 + 1000,
      latency: Math.random() * 100 + 20,
      errorRate: Math.random() * 5,
      activeConnections: Math.floor(Math.random() * 50) + 10
    });
  }
  
  return metrics;
};

function DataStreamMonitor() {
  const [streams, setStreams] = useState<DataStream[]>(mockStreams);
  const [metrics, setMetrics] = useState<StreamMetrics[]>(generateMockMetrics());
  const [selectedStream, setSelectedStream] = useState<DataStream | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const intervalRef = useRef<number | null>(null);

  // 实时数据更新
  useEffect(() => {
    if (isMonitoring) {
      intervalRef.current = setInterval(() => {
        // 更新数据流状态
        setStreams(prev => prev.map(stream => ({
          ...stream,
          dataRate: Math.max(0, stream.dataRate + (Math.random() - 0.5) * 200),
          metrics: {
            ...stream.metrics,
            totalMessages: stream.metrics.totalMessages + Math.floor(Math.random() * 10),
            avgLatency: Math.max(10, stream.metrics.avgLatency + (Math.random() - 0.5) * 10),
            throughput: Math.max(0, stream.metrics.throughput + (Math.random() - 0.5) * 100)
          },
          lastUpdate: new Date().toISOString()
        })));

        // 更新性能指标
        setMetrics(prev => {
          const newMetrics = [...prev.slice(1)];
          newMetrics.push({
            timestamp: new Date().toISOString(),
            throughput: Math.random() * 5000 + 1000,
            latency: Math.random() * 100 + 20,
            errorRate: Math.random() * 5,
            activeConnections: Math.floor(Math.random() * 50) + 10
          });
          return newMetrics;
        });
      }, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring]);

  // 筛选数据流
  const filteredStreams = streams.filter(stream => {
    const matchesSearch = stream.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stream.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || stream.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || stream.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'inactive': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sensor': return Activity;
      case 'device': return Monitor;
      case 'system': return Database;
      case 'external': return Wifi;
      default: return Activity;
    }
  };

  const getProtocolColor = (protocol: string) => {
    switch (protocol) {
      case 'mqtt': return 'bg-blue-100 text-blue-800';
      case 'websocket': return 'bg-green-100 text-green-800';
      case 'http': return 'bg-purple-100 text-purple-800';
      case 'modbus': return 'bg-orange-100 text-orange-800';
      case 'tcp': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    if (bytes === 0) return '0 B/s';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const totalThroughput = streams.reduce((sum, stream) => sum + stream.metrics.throughput, 0);
  const totalMessages = streams.reduce((sum, stream) => sum + stream.metrics.totalMessages, 0);
  const totalErrors = streams.reduce((sum, stream) => sum + stream.metrics.errorCount, 0);
  const avgUptime = streams.reduce((sum, stream) => sum + stream.metrics.uptime, 0) / streams.length;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">数据流监控</h1>
          <p className="text-gray-600 mt-1">实时监控数据流状态和性能</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={isMonitoring ? 'text-red-600' : 'text-green-600'}
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                暂停监控
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                开始监控
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出数据
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总吞吐量</p>
                <p className="text-2xl font-bold">{formatBytes(totalThroughput)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总消息数</p>
                <p className="text-2xl font-bold">{totalMessages.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">错误总数</p>
                <p className="text-2xl font-bold text-red-600">{totalErrors}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均可用性</p>
                <p className="text-2xl font-bold text-purple-600">{avgUptime.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 实时性能图表 */}
      <Card>
        <CardHeader>
          <CardTitle>实时性能监控</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">吞吐量趋势</h4>
              <div className="h-32 bg-blue-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                  <p className="text-sm text-gray-500">实时吞吐量图表</p>
                  <p className="text-xs text-gray-400">当前: {formatBytes(totalThroughput)}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">延迟分布</h4>
              <div className="h-32 bg-green-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-400" />
                  <p className="text-sm text-gray-500">延迟分布图表</p>
                  <p className="text-xs text-gray-400">
                    平均: {(streams.reduce((sum, s) => sum + s.metrics.avgLatency, 0) / streams.length).toFixed(1)}ms
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据流列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>数据流列表</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <LineChart className="h-4 w-4" />
                </button>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                配置
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索数据流名称或来源..."
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
                { value: 'sensor', label: '传感器' },
                { value: 'device', label: '设备' },
                { value: 'system', label: '系统' },
                { value: 'external', label: '外部' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'active', label: '活跃' },
                { value: 'warning', label: '警告' },
                { value: 'error', label: '错误' },
                { value: 'inactive', label: '非活跃' }
              ]}
            />
          </div>

          {/* 网格视图 */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStreams.map((stream) => {
                const TypeIcon = getTypeIcon(stream.type);
                const hasAlerts = stream.alerts.filter(a => !a.resolved).length > 0;

                return (
                  <div
                    key={stream.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedStream(stream)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <TypeIcon className={`h-5 w-5 ${getStatusColor(stream.status)}`} />
                        <span className="font-medium truncate">{stream.name}</span>
                      </div>
                      {hasAlerts && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">状态:</span>
                        <StatusBadge status={stream.status} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">协议:</span>
                        <span className={`px-2 py-1 rounded text-xs ${getProtocolColor(stream.protocol)}`}>
                          {stream.protocol.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">频率:</span>
                        <span>{stream.frequency} Hz</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">吞吐量:</span>
                        <span>{formatBytes(stream.metrics.throughput)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">延迟:</span>
                        <span>{stream.metrics.avgLatency.toFixed(1)}ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">可用性:</span>
                        <span className={stream.metrics.uptime >= 99 ? 'text-green-600' : 'text-yellow-600'}>
                          {stream.metrics.uptime.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>最后更新</span>
                        <span>{formatRelativeTime(stream.lastUpdate)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 列表视图 */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {filteredStreams.map((stream) => {
                const TypeIcon = getTypeIcon(stream.type);
                const hasAlerts = stream.alerts.filter(a => !a.resolved).length > 0;

                return (
                  <div
                    key={stream.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedStream(stream)}
                  >
                    <div className="flex items-center space-x-4">
                      <TypeIcon className={`h-6 w-6 ${getStatusColor(stream.status)}`} />
                      <div>
                        <div className="font-medium">{stream.name}</div>
                        <div className="text-sm text-gray-500">{stream.source}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm font-medium">{formatBytes(stream.metrics.throughput)}</div>
                        <div className="text-xs text-gray-500">吞吐量</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{stream.metrics.avgLatency.toFixed(1)}ms</div>
                        <div className="text-xs text-gray-500">延迟</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-sm font-medium ${stream.metrics.uptime >= 99 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {stream.metrics.uptime.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500">可用性</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={stream.status} />
                        {hasAlerts && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 数据流详情模态框 */}
      {selectedStream && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{selectedStream.name}</h2>
                <button
                  onClick={() => setSelectedStream(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Square className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">基本信息</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">数据源:</span>
                        <span>{selectedStream.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">类型:</span>
                        <span>{selectedStream.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">协议:</span>
                        <span className={`px-2 py-1 rounded text-xs ${getProtocolColor(selectedStream.protocol)}`}>
                          {selectedStream.protocol.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">频率:</span>
                        <span>{selectedStream.frequency} Hz</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">状态:</span>
                        <StatusBadge status={selectedStream.status} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">性能指标</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">总消息数:</span>
                        <span>{selectedStream.metrics.totalMessages.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">错误数:</span>
                        <span className="text-red-600">{selectedStream.metrics.errorCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">平均延迟:</span>
                        <span>{selectedStream.metrics.avgLatency.toFixed(1)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">吞吐量:</span>
                        <span>{formatBytes(selectedStream.metrics.throughput)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">可用性:</span>
                        <span className={selectedStream.metrics.uptime >= 99 ? 'text-green-600' : 'text-yellow-600'}>
                          {selectedStream.metrics.uptime.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 配置信息 */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">配置信息</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-gray-500">缓冲区大小</div>
                      <div className="font-medium">{selectedStream.config.bufferSize}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-gray-500">重试次数</div>
                      <div className="font-medium">{selectedStream.config.retryAttempts}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-gray-500">超时时间</div>
                      <div className="font-medium">{selectedStream.config.timeout}ms</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-gray-500">压缩</div>
                      <div className={`font-medium ${selectedStream.config.compression ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedStream.config.compression ? '启用' : '禁用'}
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-gray-500">加密</div>
                      <div className={`font-medium ${selectedStream.config.encryption ? 'text-green-600' : 'text-gray-600'}`}>
                        {selectedStream.config.encryption ? '启用' : '禁用'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 告警信息 */}
                {selectedStream.alerts.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">告警信息</h3>
                    <div className="space-y-2">
                      {selectedStream.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg border-l-4 ${
                            alert.level === 'critical' ? 'bg-red-50 border-red-400' :
                            alert.level === 'error' ? 'bg-red-50 border-red-400' :
                            alert.level === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                            'bg-blue-50 border-blue-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium">{alert.message}</div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {formatRelativeTime(alert.timestamp)}
                              </span>
                              {alert.resolved ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 实时数据图表 */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">实时数据</h3>
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                      <p className="text-gray-500">实时数据图表</p>
                      <p className="text-sm text-gray-400">显示最近1小时的数据流</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6 pt-6 border-t">
                <Button variant="outline" onClick={() => setSelectedStream(null)}>
                  关闭
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  配置
                </Button>
                <Button>
                  <Eye className="h-4 w-4 mr-2" />
                  详细监控
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataStreamMonitor;
