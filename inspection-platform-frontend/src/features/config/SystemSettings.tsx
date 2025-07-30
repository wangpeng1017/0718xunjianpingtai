import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Database,
  Shield,
  Bell,
  Globe,
  Clock,
  Users,
  Key,
  Monitor,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  Activity,
  AlertTriangle,
  CheckCircle,
  Save,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 系统配置类型定义
interface SystemConfig {
  general: {
    systemName: string;
    version: string;
    description: string;
    timezone: string;
    language: string;
    theme: 'light' | 'dark' | 'auto';
    logoUrl?: string;
    contactInfo: {
      company: string;
      address: string;
      phone: string;
      email: string;
    };
  };
  database: {
    type: 'mysql' | 'postgresql' | 'mongodb';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    maxConnections: number;
    connectionTimeout: number;
    ssl: boolean;
    backup: {
      enabled: boolean;
      schedule: string;
      retention: number;
      location: string;
    };
  };
  security: {
    authentication: {
      method: 'local' | 'ldap' | 'oauth' | 'saml';
      sessionTimeout: number;
      maxLoginAttempts: number;
      passwordPolicy: {
        minLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumbers: boolean;
        requireSpecialChars: boolean;
        expirationDays: number;
      };
    };
    encryption: {
      algorithm: string;
      keySize: number;
      dataEncryption: boolean;
      communicationEncryption: boolean;
    };
    audit: {
      enabled: boolean;
      logLevel: 'error' | 'warn' | 'info' | 'debug';
      retention: number;
      sensitiveDataMasking: boolean;
    };
  };
  notification: {
    email: {
      enabled: boolean;
      smtpHost: string;
      smtpPort: number;
      username: string;
      password: string;
      encryption: 'none' | 'tls' | 'ssl';
      fromAddress: string;
      fromName: string;
    };
    sms: {
      enabled: boolean;
      provider: string;
      apiKey: string;
      apiSecret: string;
      defaultSender: string;
    };
    webhook: {
      enabled: boolean;
      endpoints: {
        url: string;
        method: 'GET' | 'POST' | 'PUT';
        headers: Record<string, string>;
        timeout: number;
      }[];
    };
  };
  performance: {
    cache: {
      enabled: boolean;
      type: 'memory' | 'redis' | 'memcached';
      ttl: number;
      maxSize: number;
    };
    logging: {
      level: 'error' | 'warn' | 'info' | 'debug';
      maxFileSize: number;
      maxFiles: number;
      compression: boolean;
    };
    monitoring: {
      enabled: boolean;
      interval: number;
      metrics: string[];
      alertThresholds: {
        cpu: number;
        memory: number;
        disk: number;
        network: number;
      };
    };
  };
  integration: {
    api: {
      enabled: boolean;
      version: string;
      rateLimit: number;
      cors: {
        enabled: boolean;
        origins: string[];
        methods: string[];
      };
    };
    mqtt: {
      enabled: boolean;
      broker: string;
      port: number;
      username: string;
      password: string;
      topics: string[];
    };
    modbus: {
      enabled: boolean;
      devices: {
        id: string;
        host: string;
        port: number;
        unitId: number;
      }[];
    };
  };
}

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    name: string;
    status: 'running' | 'stopped' | 'error';
    uptime: number;
    lastCheck: string;
    details?: string;
  }[];
  resources: {
    cpu: {
      usage: number;
      cores: number;
      temperature?: number;
    };
    memory: {
      used: number;
      total: number;
      usage: number;
    };
    disk: {
      used: number;
      total: number;
      usage: number;
    };
    network: {
      bytesIn: number;
      bytesOut: number;
      packetsIn: number;
      packetsOut: number;
    };
  };
  database: {
    status: 'connected' | 'disconnected' | 'error';
    connections: number;
    maxConnections: number;
    queryTime: number;
    lastBackup?: string;
  };
  lastUpdated: string;
}

// Mock数据
const mockConfig: SystemConfig = {
  general: {
    systemName: '智能巡检平台',
    version: 'v2.1.0',
    description: '基于AI的智能设备巡检管理平台',
    timezone: 'Asia/Shanghai',
    language: 'zh-CN',
    theme: 'light',
    logoUrl: '/logo.png',
    contactInfo: {
      company: '智能科技有限公司',
      address: '北京市朝阳区科技园区',
      phone: '+86-10-12345678',
      email: 'support@inspection.com'
    }
  },
  database: {
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    database: 'inspection_db',
    username: 'admin',
    password: '********',
    maxConnections: 100,
    connectionTimeout: 30,
    ssl: true,
    backup: {
      enabled: true,
      schedule: '0 2 * * *',
      retention: 30,
      location: '/backup/db'
    }
  },
  security: {
    authentication: {
      method: 'local',
      sessionTimeout: 480,
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        expirationDays: 90
      }
    },
    encryption: {
      algorithm: 'AES-256',
      keySize: 256,
      dataEncryption: true,
      communicationEncryption: true
    },
    audit: {
      enabled: true,
      logLevel: 'info',
      retention: 365,
      sensitiveDataMasking: true
    }
  },
  notification: {
    email: {
      enabled: true,
      smtpHost: 'smtp.company.com',
      smtpPort: 587,
      username: 'noreply@company.com',
      password: '********',
      encryption: 'tls',
      fromAddress: 'noreply@company.com',
      fromName: '智能巡检平台'
    },
    sms: {
      enabled: true,
      provider: 'aliyun',
      apiKey: '********',
      apiSecret: '********',
      defaultSender: 'InspectionPlatform'
    },
    webhook: {
      enabled: false,
      endpoints: []
    }
  },
  performance: {
    cache: {
      enabled: true,
      type: 'redis',
      ttl: 3600,
      maxSize: 1024
    },
    logging: {
      level: 'info',
      maxFileSize: 100,
      maxFiles: 10,
      compression: true
    },
    monitoring: {
      enabled: true,
      interval: 60,
      metrics: ['cpu', 'memory', 'disk', 'network'],
      alertThresholds: {
        cpu: 80,
        memory: 85,
        disk: 90,
        network: 1000
      }
    }
  },
  integration: {
    api: {
      enabled: true,
      version: 'v1',
      rateLimit: 1000,
      cors: {
        enabled: true,
        origins: ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    },
    mqtt: {
      enabled: true,
      broker: 'mqtt.company.com',
      port: 1883,
      username: 'mqtt_user',
      password: '********',
      topics: ['devices/+/status', 'alerts/+']
    },
    modbus: {
      enabled: false,
      devices: []
    }
  }
};

const mockStatus: SystemStatus = {
  overall: 'healthy',
  services: [
    {
      name: 'Web服务器',
      status: 'running',
      uptime: 2592000,
      lastCheck: '2024-07-18T01:25:00Z'
    },
    {
      name: '数据库服务',
      status: 'running',
      uptime: 2592000,
      lastCheck: '2024-07-18T01:25:00Z'
    },
    {
      name: 'Redis缓存',
      status: 'running',
      uptime: 2592000,
      lastCheck: '2024-07-18T01:25:00Z'
    },
    {
      name: 'MQTT代理',
      status: 'running',
      uptime: 2592000,
      lastCheck: '2024-07-18T01:25:00Z'
    },
    {
      name: 'AI分析服务',
      status: 'error',
      uptime: 86400,
      lastCheck: '2024-07-18T01:25:00Z',
      details: 'GPU使用率较高'
    }
  ],
  resources: {
    cpu: {
      usage: 45.2,
      cores: 8,
      temperature: 65
    },
    memory: {
      used: 12.8,
      total: 32.0,
      usage: 40.0
    },
    disk: {
      used: 256,
      total: 1024,
      usage: 25.0
    },
    network: {
      bytesIn: 1024000000,
      bytesOut: 512000000,
      packetsIn: 1000000,
      packetsOut: 800000
    }
  },
  database: {
    status: 'connected',
    connections: 15,
    maxConnections: 100,
    queryTime: 2.5,
    lastBackup: '2024-07-18T02:00:00Z'
  },
  lastUpdated: '2024-07-18T01:25:00Z'
};

function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>(mockConfig);
  const [status, setStatus] = useState<SystemStatus>(mockStatus);
  const [activeTab, setActiveTab] = useState<'general' | 'database' | 'security' | 'notification' | 'performance' | 'integration' | 'status'>('general');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // 自动更新系统状态
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        resources: {
          ...prev.resources,
          cpu: {
            ...prev.resources.cpu,
            usage: Math.max(20, Math.min(80, prev.resources.cpu.usage + (Math.random() - 0.5) * 10))
          },
          memory: {
            ...prev.resources.memory,
            usage: Math.max(30, Math.min(70, prev.resources.memory.usage + (Math.random() - 0.5) * 5))
          }
        },
        lastUpdated: new Date().toISOString()
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleConfigChange = (section: keyof SystemConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveConfig = () => {
    console.log('保存配置:', config);
    setHasChanges(false);
    // 这里应该调用API保存配置
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'running':
      case 'connected':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
      case 'error':
      case 'stopped':
      case 'disconnected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}天 ${hours}小时`;
    } else if (hours > 0) {
      return `${hours}小时 ${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-600 mt-1">系统配置和状态管理</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSaveConfig} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            保存更改
          </Button>
        )}
      </div>

      {/* 标签页导航 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'general', label: '基本设置', icon: Settings },
          { key: 'database', label: '数据库', icon: Database },
          { key: 'security', label: '安全', icon: Shield },
          { key: 'notification', label: '通知', icon: Bell },
          { key: 'performance', label: '性能', icon: Activity },
          { key: 'integration', label: '集成', icon: Wifi },
          { key: 'status', label: '系统状态', icon: Monitor }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* 系统状态标签页 */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* 系统概览 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>系统状态概览</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-2 ${getStatusColor(status.overall)}`}>
                    {status.overall === 'healthy' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : status.overall === 'warning' ? (
                      <AlertTriangle className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                    <span className="font-medium">
                      {status.overall === 'healthy' ? '健康' :
                       status.overall === 'warning' ? '警告' : '严重'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    刷新
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 mb-4">
                最后更新: {formatRelativeTime(status.lastUpdated)}
              </div>

              {/* 资源使用情况 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">CPU</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-800">
                      {status.resources.cpu.usage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.resources.cpu.usage}%` }}
                    />
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {status.resources.cpu.cores} 核心 • {status.resources.cpu.temperature}°C
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MemoryStick className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">内存</span>
                    </div>
                    <span className="text-2xl font-bold text-green-800">
                      {status.resources.memory.usage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.resources.memory.usage}%` }}
                    />
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {status.resources.memory.used}GB / {status.resources.memory.total}GB
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <HardDrive className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-purple-800">磁盘</span>
                    </div>
                    <span className="text-2xl font-bold text-purple-800">
                      {status.resources.disk.usage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.resources.disk.usage}%` }}
                    />
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    {status.resources.disk.used}GB / {status.resources.disk.total}GB
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Wifi className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-orange-800">网络</span>
                    </div>
                    <span className="text-lg font-bold text-orange-800">活跃</span>
                  </div>
                  <div className="text-xs text-orange-600">
                    <div>入: {formatBytes(status.resources.network.bytesIn)}</div>
                    <div>出: {formatBytes(status.resources.network.bytesOut)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 服务状态 */}
          <Card>
            <CardHeader>
              <CardTitle>服务状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {status.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'running' ? 'bg-green-500' :
                        service.status === 'error' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`} />
                      <div>
                        <div className="font-medium">{service.name}</div>
                        {service.details && (
                          <div className="text-sm text-gray-500">{service.details}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className={`font-medium ${getStatusColor(service.status)}`}>
                        {service.status === 'running' ? '运行中' :
                         service.status === 'error' ? '错误' : '停止'}
                      </div>
                      <div className="text-gray-500">
                        运行时间: {formatUptime(service.uptime)}
                      </div>
                      <div className="text-gray-400">
                        检查: {formatRelativeTime(service.lastCheck)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 数据库状态 */}
          <Card>
            <CardHeader>
              <CardTitle>数据库状态</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-medium">连接状态</div>
                  <div className={`text-2xl font-bold ${getStatusColor(status.database.status)}`}>
                    {status.database.status === 'connected' ? '已连接' :
                     status.database.status === 'disconnected' ? '断开' : '错误'}
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-medium">活跃连接</div>
                  <div className="text-2xl font-bold text-green-800">
                    {status.database.connections}/{status.database.maxConnections}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-purple-600 font-medium">查询时间</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {status.database.queryTime}ms
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-yellow-600 font-medium">最后备份</div>
                  <div className="text-sm font-bold text-yellow-800">
                    {status.database.lastBackup ? formatRelativeTime(status.database.lastBackup) : '无'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 其他配置标签页的简化版本 */}
      {activeTab === 'notification' && (
        <Card>
          <CardHeader>
            <CardTitle>通知设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">邮件通知</h4>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="emailEnabled"
                    checked={config.notification.email.enabled}
                    onChange={(e) => handleConfigChange('notification', 'email', {
                      ...config.notification.email,
                      enabled: e.target.checked
                    })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="emailEnabled" className="text-sm font-medium text-gray-700">
                    启用邮件通知
                  </label>
                </div>

                {config.notification.email.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="SMTP主机">
                      <Input
                        value={config.notification.email.smtpHost}
                        onChange={(e) => handleConfigChange('notification', 'email', {
                          ...config.notification.email,
                          smtpHost: e.target.value
                        })}
                      />
                    </FormField>
                    <FormField label="SMTP端口">
                      <Input
                        type="number"
                        value={config.notification.email.smtpPort}
                        onChange={(e) => handleConfigChange('notification', 'email', {
                          ...config.notification.email,
                          smtpPort: parseInt(e.target.value)
                        })}
                      />
                    </FormField>
                    <FormField label="发件人地址">
                      <Input
                        type="email"
                        value={config.notification.email.fromAddress}
                        onChange={(e) => handleConfigChange('notification', 'email', {
                          ...config.notification.email,
                          fromAddress: e.target.value
                        })}
                      />
                    </FormField>
                    <FormField label="发件人名称">
                      <Input
                        value={config.notification.email.fromName}
                        onChange={(e) => handleConfigChange('notification', 'email', {
                          ...config.notification.email,
                          fromName: e.target.value
                        })}
                      />
                    </FormField>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">短信通知</h4>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="smsEnabled"
                    checked={config.notification.sms.enabled}
                    onChange={(e) => handleConfigChange('notification', 'sms', {
                      ...config.notification.sms,
                      enabled: e.target.checked
                    })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="smsEnabled" className="text-sm font-medium text-gray-700">
                    启用短信通知
                  </label>
                </div>

                {config.notification.sms.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="服务提供商">
                      <Select
                        value={config.notification.sms.provider}
                        onChange={(value) => handleConfigChange('notification', 'sms', {
                          ...config.notification.sms,
                          provider: value
                        })}
                        options={[
                          { value: 'aliyun', label: '阿里云' },
                          { value: 'tencent', label: '腾讯云' },
                          { value: 'twilio', label: 'Twilio' }
                        ]}
                      />
                    </FormField>
                    <FormField label="默认发送方">
                      <Input
                        value={config.notification.sms.defaultSender}
                        onChange={(e) => handleConfigChange('notification', 'sms', {
                          ...config.notification.sms,
                          defaultSender: e.target.value
                        })}
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>缓存设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="cacheEnabled"
                    checked={config.performance.cache.enabled}
                    onChange={(e) => handleConfigChange('performance', 'cache', {
                      ...config.performance.cache,
                      enabled: e.target.checked
                    })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="cacheEnabled" className="text-sm font-medium text-gray-700">
                    启用缓存
                  </label>
                </div>

                {config.performance.cache.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="缓存类型">
                      <Select
                        value={config.performance.cache.type}
                        onChange={(value) => handleConfigChange('performance', 'cache', {
                          ...config.performance.cache,
                          type: value
                        })}
                        options={[
                          { value: 'memory', label: '内存缓存' },
                          { value: 'redis', label: 'Redis' },
                          { value: 'memcached', label: 'Memcached' }
                        ]}
                      />
                    </FormField>
                    <FormField label="TTL(秒)">
                      <Input
                        type="number"
                        value={config.performance.cache.ttl}
                        onChange={(e) => handleConfigChange('performance', 'cache', {
                          ...config.performance.cache,
                          ttl: parseInt(e.target.value)
                        })}
                      />
                    </FormField>
                    <FormField label="最大大小(MB)">
                      <Input
                        type="number"
                        value={config.performance.cache.maxSize}
                        onChange={(e) => handleConfigChange('performance', 'cache', {
                          ...config.performance.cache,
                          maxSize: parseInt(e.target.value)
                        })}
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>监控设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="monitoringEnabled"
                    checked={config.performance.monitoring.enabled}
                    onChange={(e) => handleConfigChange('performance', 'monitoring', {
                      ...config.performance.monitoring,
                      enabled: e.target.checked
                    })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="monitoringEnabled" className="text-sm font-medium text-gray-700">
                    启用性能监控
                  </label>
                </div>

                {config.performance.monitoring.enabled && (
                  <div>
                    <FormField label="监控间隔(秒)">
                      <Input
                        type="number"
                        value={config.performance.monitoring.interval}
                        onChange={(e) => handleConfigChange('performance', 'monitoring', {
                          ...config.performance.monitoring,
                          interval: parseInt(e.target.value)
                        })}
                      />
                    </FormField>

                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">告警阈值</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField label="CPU(%)">
                          <Input
                            type="number"
                            value={config.performance.monitoring.alertThresholds.cpu}
                            onChange={(e) => handleConfigChange('performance', 'monitoring', {
                              ...config.performance.monitoring,
                              alertThresholds: {
                                ...config.performance.monitoring.alertThresholds,
                                cpu: parseInt(e.target.value)
                              }
                            })}
                          />
                        </FormField>
                        <FormField label="内存(%)">
                          <Input
                            type="number"
                            value={config.performance.monitoring.alertThresholds.memory}
                            onChange={(e) => handleConfigChange('performance', 'monitoring', {
                              ...config.performance.monitoring,
                              alertThresholds: {
                                ...config.performance.monitoring.alertThresholds,
                                memory: parseInt(e.target.value)
                              }
                            })}
                          />
                        </FormField>
                        <FormField label="磁盘(%)">
                          <Input
                            type="number"
                            value={config.performance.monitoring.alertThresholds.disk}
                            onChange={(e) => handleConfigChange('performance', 'monitoring', {
                              ...config.performance.monitoring,
                              alertThresholds: {
                                ...config.performance.monitoring.alertThresholds,
                                disk: parseInt(e.target.value)
                              }
                            })}
                          />
                        </FormField>
                        <FormField label="网络(Mbps)">
                          <Input
                            type="number"
                            value={config.performance.monitoring.alertThresholds.network}
                            onChange={(e) => handleConfigChange('performance', 'monitoring', {
                              ...config.performance.monitoring,
                              alertThresholds: {
                                ...config.performance.monitoring.alertThresholds,
                                network: parseInt(e.target.value)
                              }
                            })}
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'integration' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="apiEnabled"
                    checked={config.integration.api.enabled}
                    onChange={(e) => handleConfigChange('integration', 'api', {
                      ...config.integration.api,
                      enabled: e.target.checked
                    })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="apiEnabled" className="text-sm font-medium text-gray-700">
                    启用API接口
                  </label>
                </div>

                {config.integration.api.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="API版本">
                      <Input
                        value={config.integration.api.version}
                        onChange={(e) => handleConfigChange('integration', 'api', {
                          ...config.integration.api,
                          version: e.target.value
                        })}
                      />
                    </FormField>
                    <FormField label="速率限制(请求/分钟)">
                      <Input
                        type="number"
                        value={config.integration.api.rateLimit}
                        onChange={(e) => handleConfigChange('integration', 'api', {
                          ...config.integration.api,
                          rateLimit: parseInt(e.target.value)
                        })}
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>MQTT设置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mqttEnabled"
                    checked={config.integration.mqtt.enabled}
                    onChange={(e) => handleConfigChange('integration', 'mqtt', {
                      ...config.integration.mqtt,
                      enabled: e.target.checked
                    })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="mqttEnabled" className="text-sm font-medium text-gray-700">
                    启用MQTT集成
                  </label>
                </div>

                {config.integration.mqtt.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="MQTT代理地址">
                      <Input
                        value={config.integration.mqtt.broker}
                        onChange={(e) => handleConfigChange('integration', 'mqtt', {
                          ...config.integration.mqtt,
                          broker: e.target.value
                        })}
                      />
                    </FormField>
                    <FormField label="端口">
                      <Input
                        type="number"
                        value={config.integration.mqtt.port}
                        onChange={(e) => handleConfigChange('integration', 'mqtt', {
                          ...config.integration.mqtt,
                          port: parseInt(e.target.value)
                        })}
                      />
                    </FormField>
                    <FormField label="用户名">
                      <Input
                        value={config.integration.mqtt.username}
                        onChange={(e) => handleConfigChange('integration', 'mqtt', {
                          ...config.integration.mqtt,
                          username: e.target.value
                        })}
                      />
                    </FormField>
                    <FormField label="密码">
                      <div className="relative">
                        <Input
                          type={showPasswords.mqttPassword ? 'text' : 'password'}
                          value={config.integration.mqtt.password}
                          onChange={(e) => handleConfigChange('integration', 'mqtt', {
                            ...config.integration.mqtt,
                            password: e.target.value
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility('mqttPassword')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.mqttPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormField>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SystemSettings;
