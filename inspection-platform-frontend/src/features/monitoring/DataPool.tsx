import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  HardDrive,
  Cpu,
  Network,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Settings,
  Trash2,
  Archive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Form, FormField, Select } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 数据池类型定义
interface DataPoolEntry {
  id: string;
  name: string;
  type: 'sensor_data' | 'image' | 'video' | 'log' | 'report' | 'config' | 'backup';
  category: 'inspection' | 'monitoring' | 'maintenance' | 'analysis' | 'system';
  source: {
    deviceId: string;
    deviceName: string;
    targetId?: string;
    targetName?: string;
  };
  metadata: {
    size: number; // bytes
    format: string;
    resolution?: string;
    duration?: number; // seconds for video
    sampleRate?: number; // for sensor data
    compression?: string;
    checksum: string;
  };
  storage: {
    location: 'local' | 'cloud' | 'edge';
    path: string;
    redundancy: number;
    encrypted: boolean;
  };
  access: {
    permissions: string[];
    lastAccessed?: string;
    accessCount: number;
    downloadCount: number;
  };
  lifecycle: {
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
    retentionPolicy: 'permanent' | 'temporary' | 'archive';
    status: 'active' | 'archived' | 'expired' | 'corrupted';
  };
  quality: {
    score: number; // 0-100
    issues: string[];
    validated: boolean;
    validatedAt?: string;
  };
  tags: string[];
  relatedEntries: string[];
}

interface DataPoolStats {
  totalEntries: number;
  totalSize: number;
  storageUsage: {
    local: number;
    cloud: number;
    edge: number;
  };
  typeDistribution: {
    [key: string]: number;
  };
  qualityStats: {
    validated: number;
    issues: number;
    avgScore: number;
  };
  accessStats: {
    totalAccess: number;
    totalDownloads: number;
    popularEntries: DataPoolEntry[];
  };
}

// Mock数据
const mockDataPool: DataPoolEntry[] = [
  {
    id: 'data-1',
    name: '主变压器A1温度数据_20240717',
    type: 'sensor_data',
    category: 'inspection',
    source: {
      deviceId: 'device-1',
      deviceName: '巡检机器狗-01',
      targetId: 'target-1',
      targetName: '主变压器A1'
    },
    metadata: {
      size: 2048576, // 2MB
      format: 'JSON',
      sampleRate: 1000, // 1kHz
      compression: 'gzip',
      checksum: 'sha256:abc123...'
    },
    storage: {
      location: 'cloud',
      path: '/data/sensor/2024/07/17/temp_data_001.json.gz',
      redundancy: 3,
      encrypted: true
    },
    access: {
      permissions: ['read', 'download'],
      lastAccessed: '2024-07-17T10:30:00Z',
      accessCount: 15,
      downloadCount: 3
    },
    lifecycle: {
      createdAt: '2024-07-17T09:15:00Z',
      updatedAt: '2024-07-17T09:15:00Z',
      retentionPolicy: 'permanent',
      status: 'active'
    },
    quality: {
      score: 95,
      issues: [],
      validated: true,
      validatedAt: '2024-07-17T09:20:00Z'
    },
    tags: ['temperature', 'transformer', 'critical'],
    relatedEntries: ['data-2', 'data-3']
  },
  {
    id: 'data-2',
    name: '变压器巡检视频_20240717_092000',
    type: 'video',
    category: 'inspection',
    source: {
      deviceId: 'device-1',
      deviceName: '巡检机器狗-01',
      targetId: 'target-1',
      targetName: '主变压器A1'
    },
    metadata: {
      size: 157286400, // 150MB
      format: 'MP4',
      resolution: '4K',
      duration: 300, // 5 minutes
      compression: 'H.264',
      checksum: 'sha256:def456...'
    },
    storage: {
      location: 'local',
      path: '/storage/video/2024/07/17/inspection_092000.mp4',
      redundancy: 2,
      encrypted: false
    },
    access: {
      permissions: ['read', 'download', 'stream'],
      lastAccessed: '2024-07-17T11:00:00Z',
      accessCount: 8,
      downloadCount: 1
    },
    lifecycle: {
      createdAt: '2024-07-17T09:20:00Z',
      updatedAt: '2024-07-17T09:20:00Z',
      expiresAt: '2025-07-17T09:20:00Z',
      retentionPolicy: 'temporary',
      status: 'active'
    },
    quality: {
      score: 88,
      issues: ['轻微抖动', '部分区域曝光过度'],
      validated: true,
      validatedAt: '2024-07-17T09:25:00Z'
    },
    tags: ['video', 'inspection', 'transformer', '4k'],
    relatedEntries: ['data-1', 'data-4']
  },
  {
    id: 'data-3',
    name: '系统运行日志_20240717',
    type: 'log',
    category: 'system',
    source: {
      deviceId: 'system',
      deviceName: '监控系统'
    },
    metadata: {
      size: 5242880, // 5MB
      format: 'LOG',
      compression: 'none',
      checksum: 'sha256:ghi789...'
    },
    storage: {
      location: 'edge',
      path: '/logs/system/2024/07/17/system.log',
      redundancy: 1,
      encrypted: false
    },
    access: {
      permissions: ['read'],
      lastAccessed: '2024-07-17T09:45:00Z',
      accessCount: 25,
      downloadCount: 5
    },
    lifecycle: {
      createdAt: '2024-07-17T00:00:00Z',
      updatedAt: '2024-07-17T11:30:00Z',
      expiresAt: '2024-08-17T00:00:00Z',
      retentionPolicy: 'archive',
      status: 'active'
    },
    quality: {
      score: 100,
      issues: [],
      validated: true,
      validatedAt: '2024-07-17T09:30:00Z'
    },
    tags: ['log', 'system', 'monitoring'],
    relatedEntries: []
  }
];

const mockStats: DataPoolStats = {
  totalEntries: 1247,
  totalSize: 2147483648, // 2GB
  storageUsage: {
    local: 858993459, // 800MB
    cloud: 1073741824, // 1GB
    edge: 214748365 // 200MB
  },
  typeDistribution: {
    sensor_data: 456,
    image: 234,
    video: 189,
    log: 156,
    report: 89,
    config: 67,
    backup: 56
  },
  qualityStats: {
    validated: 1156,
    issues: 91,
    avgScore: 92.5
  },
  accessStats: {
    totalAccess: 15678,
    totalDownloads: 2345,
    popularEntries: mockDataPool.slice(0, 3)
  }
};

function DataPool() {
  const [dataEntries, setDataEntries] = useState<DataPoolEntry[]>(mockDataPool);
  const [stats, setStats] = useState<DataPoolStats>(mockStats);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<DataPoolEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'entries' | 'stats' | 'storage'>('entries');

  // 模态框状态
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 自动刷新统计数据
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        accessStats: {
          ...prev.accessStats,
          totalAccess: prev.accessStats.totalAccess + Math.floor(Math.random() * 5),
          totalDownloads: prev.accessStats.totalDownloads + Math.floor(Math.random() * 2)
        }
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // 筛选数据
  const filteredEntries = dataEntries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || entry.lifecycle.status === statusFilter;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  // 事件处理函数
  const handleDownload = (entry: DataPoolEntry) => {
    setDataEntries(dataEntries.map(e =>
      e.id === entry.id
        ? {
          ...e,
          access: {
            ...e.access,
            downloadCount: e.access.downloadCount + 1,
            lastAccessed: new Date().toISOString()
          }
        }
        : e
    ));
    console.log(`下载文件: ${entry.name}`);
  };

  const handleArchive = (entryId: string) => {
    setDataEntries(dataEntries.map(e =>
      e.id === entryId
        ? {
          ...e,
          lifecycle: {
            ...e.lifecycle,
            status: 'archived',
            updatedAt: new Date().toISOString()
          }
        }
        : e
    ));
  };

  const handleDelete = (entryId: string) => {
    setDataEntries(dataEntries.filter(e => e.id !== entryId));
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sensor_data': return Activity;
      case 'image': return Eye;
      case 'video': return Eye;
      case 'log': return Database;
      case 'report': return BarChart3;
      case 'config': return Settings;
      case 'backup': return Archive;
      default: return Database;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      sensor_data: '传感器数据',
      image: '图像',
      video: '视频',
      log: '日志',
      report: '报告',
      config: '配置',
      backup: '备份'
    };
    return typeMap[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      inspection: '巡检',
      monitoring: '监控',
      maintenance: '维护',
      analysis: '分析',
      system: '系统'
    };
    return categoryMap[category] || category;
  };

  const getStorageIcon = (location: string) => {
    switch (location) {
      case 'local': return HardDrive;
      case 'cloud': return Network;
      case 'edge': return Cpu;
      default: return Database;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">数据池</h1>
          <p className="text-gray-600 mt-1">管理和监控巡检数据存储</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            上传
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">数据条目</p>
                <p className="text-2xl font-bold">{stats.totalEntries.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总存储</p>
                <p className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</p>
              </div>
              <HardDrive className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">数据质量</p>
                <p className="text-2xl font-bold text-green-600">{stats.qualityStats.avgScore}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">访问次数</p>
                <p className="text-2xl font-bold text-purple-600">{stats.accessStats.totalAccess.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('entries')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'entries'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            数据条目
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'stats'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            统计分析
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'storage'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            存储管理
          </button>
        </nav>
      </div>

      {/* 数据条目标签页 */}
      {activeTab === 'entries' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>数据条目列表</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  批量下载
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  批量归档
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
                    placeholder="搜索数据名称或标签..."
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
                  { value: 'sensor_data', label: '传感器数据' },
                  { value: 'image', label: '图像' },
                  { value: 'video', label: '视频' },
                  { value: 'log', label: '日志' },
                  { value: 'report', label: '报告' },
                  { value: 'config', label: '配置' }
                ]}
              />
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'all', label: '全部分类' },
                  { value: 'inspection', label: '巡检' },
                  { value: 'monitoring', label: '监控' },
                  { value: 'maintenance', label: '维护' },
                  { value: 'analysis', label: '分析' },
                  { value: 'system', label: '系统' }
                ]}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'active', label: '活跃' },
                  { value: 'archived', label: '已归档' },
                  { value: 'expired', label: '已过期' }
                ]}
              />
            </div>

            {/* 数据表格 */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>数据信息</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>来源</TableHead>
                  <TableHead>大小</TableHead>
                  <TableHead>存储位置</TableHead>
                  <TableHead>质量</TableHead>
                  <TableHead>访问次数</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry) => {
                  const TypeIcon = getTypeIcon(entry.type);
                  const StorageIcon = getStorageIcon(entry.storage.location);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <TypeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium">{entry.name}</div>
                            <div className="text-sm text-gray-500">
                              {entry.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs mr-1">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {getTypeLabel(entry.type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {getCategoryLabel(entry.category)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{entry.source.deviceName}</div>
                          {entry.source.targetName && (
                            <div className="text-gray-500">{entry.source.targetName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatFileSize(entry.metadata.size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <StorageIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{entry.storage.location}</span>
                          {entry.storage.encrypted && (
                            <span className="text-xs text-green-600">🔒</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${entry.quality.score >= 90 ? 'bg-green-500' :
                                entry.quality.score >= 70 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                              style={{ width: `${entry.quality.score}%` }}
                            />
                          </div>
                          <span className="text-sm">{entry.quality.score}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>访问: {entry.access.accessCount}</div>
                          <div className="text-gray-500">下载: {entry.access.downloadCount}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatRelativeTime(entry.lifecycle.createdAt)}</div>
                          {entry.access.lastAccessed && (
                            <div className="text-gray-500">
                              最后访问: {formatRelativeTime(entry.access.lastAccessed)}
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
                              setSelectedEntry(entry);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(entry)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(entry.id)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
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

      {/* 统计分析标签页 */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>数据类型分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <p className="text-gray-500">数据类型分布图表</p>
                <p className="text-sm text-gray-400 mt-2">显示各类型数据的数量分布</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>存储使用情况</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>本地存储</span>
                    <span>{formatFileSize(stats.storageUsage.local)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(stats.storageUsage.local / stats.totalSize) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>云存储</span>
                    <span>{formatFileSize(stats.storageUsage.cloud)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(stats.storageUsage.cloud / stats.totalSize) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>边缘存储</span>
                    <span>{formatFileSize(stats.storageUsage.edge)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(stats.storageUsage.edge / stats.totalSize) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>质量统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">已验证数据</span>
                  <span className="font-medium">{stats.qualityStats.validated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">存在问题</span>
                  <span className="font-medium text-red-600">{stats.qualityStats.issues}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">平均质量分</span>
                  <span className="font-medium text-green-600">{stats.qualityStats.avgScore}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>访问统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">总访问次数</span>
                  <span className="font-medium">{stats.accessStats.totalAccess.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">总下载次数</span>
                  <span className="font-medium">{stats.accessStats.totalDownloads.toLocaleString()}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">热门数据</h4>
                  <div className="space-y-2">
                    {stats.accessStats.popularEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{entry.name}</span>
                        <span className="text-gray-500">{entry.access.accessCount}次</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 存储管理标签页 */}
      {activeTab === 'storage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>存储配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Settings className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">存储配置管理</p>
                <p className="text-sm text-gray-400 mt-2">配置存储策略和备份规则</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>存储监控</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">存储性能监控</p>
                <p className="text-sm text-gray-400 mt-2">监控存储系统的性能指标</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 数据详情模态框 */}
      {selectedEntry && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEntry(null);
          }}
          title="数据详情"
          size="lg"
        >
          <div className="space-y-4">
            {/* 基本信息 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">名称:</span> {selectedEntry.name}</div>
                <div><span className="text-gray-500">类型:</span> {getTypeLabel(selectedEntry.type)}</div>
                <div><span className="text-gray-500">分类:</span> {getCategoryLabel(selectedEntry.category)}</div>
                <div><span className="text-gray-500">大小:</span> {formatFileSize(selectedEntry.metadata.size)}</div>
                <div><span className="text-gray-500">格式:</span> {selectedEntry.metadata.format}</div>
                <div><span className="text-gray-500">质量分:</span> {selectedEntry.quality.score}%</div>
              </div>
            </div>

            {/* 来源信息 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">来源信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">设备:</span> {selectedEntry.source.deviceName}</div>
                <div><span className="text-gray-500">设备ID:</span> {selectedEntry.source.deviceId}</div>
                {selectedEntry.source.targetName && (
                  <>
                    <div><span className="text-gray-500">目标:</span> {selectedEntry.source.targetName}</div>
                    <div><span className="text-gray-500">目标ID:</span> {selectedEntry.source.targetId}</div>
                  </>
                )}
              </div>
            </div>

            {/* 存储信息 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">存储信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">位置:</span> {selectedEntry.storage.location}</div>
                <div><span className="text-gray-500">加密:</span> {selectedEntry.storage.encrypted ? '是' : '否'}</div>
                <div className="col-span-2">
                  <span className="text-gray-500">路径:</span>
                  <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">{selectedEntry.storage.path}</code>
                </div>
              </div>
            </div>

            {/* 访问统计 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">访问统计</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">访问次数:</span> {selectedEntry.access.accessCount}</div>
                <div><span className="text-gray-500">下载次数:</span> {selectedEntry.access.downloadCount}</div>
                {selectedEntry.access.lastAccessed && (
                  <div className="col-span-2">
                    <span className="text-gray-500">最后访问:</span> {formatRelativeTime(selectedEntry.access.lastAccessed)}
                  </div>
                )}
              </div>
            </div>

            {/* 标签 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">标签</h4>
              <div className="flex flex-wrap gap-2">
                {selectedEntry.tags.map(tag => (
                  <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            <Button onClick={() => handleDownload(selectedEntry)}>
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default DataPool;
