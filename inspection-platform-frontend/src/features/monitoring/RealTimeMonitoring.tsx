import React, { useState, useEffect } from 'react';
import {
  Activity,
  Wifi,
  Battery,
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  Camera,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  Settings,
  Monitor,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { useDevices } from '../../stores/useDeviceStore';
import { formatRelativeTime } from '../../lib/utils';
import type { Device, MonitoringData } from '../../types';

// 模拟实时监控数据生成
const generateRealtimeData = (device: Device): MonitoringData => {
  return {
    deviceId: device.id,
    timestamp: new Date().toISOString(),
    location: {
      lat: device.location.lat + (Math.random() - 0.5) * 0.001,
      lng: device.location.lng + (Math.random() - 0.5) * 0.001,
      altitude: Math.random() * 100,
    },
    telemetry: {
      batteryLevel: device.batteryLevel || Math.floor(Math.random() * 100),
      signalStrength: Math.floor(Math.random() * 100),
      temperature: Math.floor(Math.random() * 40) + 10,
      humidity: Math.floor(Math.random() * 80) + 20,
      speed: Math.random() * 10,
      heading: Math.random() * 360,
    },
    media: Math.random() > 0.7 ? {
      type: 'image',
      url: `https://picsum.photos/400/300?random=${Date.now()}`,
      thumbnail: `https://picsum.photos/100/75?random=${Date.now()}`,
    } : undefined,
  };
};

interface MonitoringCardProps {
  device: Device;
  monitoringData?: MonitoringData;
  onViewDetails: (device: Device) => void;
}

function MonitoringCard({ device, monitoringData, onViewDetails }: MonitoringCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'maintenance':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBatteryIcon = (level: number) => {
    if (level > 75) return <Battery className="h-4 w-4 text-green-500" />;
    if (level > 50) return <Battery className="h-4 w-4 text-yellow-500" />;
    if (level > 25) return <Battery className="h-4 w-4 text-orange-500" />;
    return <Battery className="h-4 w-4 text-red-500" />;
  };

  const getSignalIcon = (strength: number) => {
    if (strength > 75) return <Wifi className="h-4 w-4 text-green-500" />;
    if (strength > 50) return <Wifi className="h-4 w-4 text-yellow-500" />;
    if (strength > 25) return <Wifi className="h-4 w-4 text-orange-500" />;
    return <Wifi className="h-4 w-4 text-red-500" />;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {getStatusIcon(device.status)}
            </div>
            <div>
              <CardTitle className="text-lg">{device.name}</CardTitle>
              <p className="text-sm text-gray-500">{device.type}</p>
            </div>
          </div>
          <StatusBadge status={device.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-gray-600">
                {device.location.lat.toFixed(4)}, {device.location.lng.toFixed(4)}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-gray-600">
                {formatRelativeTime(device.lastUpdate)}
              </span>
            </div>
          </div>

          {/* 实时遥测数据 */}
          {monitoringData && (
            <div className="space-y-3">
              {/* 电池和信号 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getBatteryIcon(monitoringData.telemetry.batteryLevel || 0)}
                    <span className="text-gray-600 ml-2">电池</span>
                  </div>
                  <span className="font-medium">{monitoringData.telemetry.batteryLevel}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getSignalIcon(monitoringData.telemetry.signalStrength || 0)}
                    <span className="text-gray-600 ml-2">信号</span>
                  </div>
                  <span className="font-medium">{monitoringData.telemetry.signalStrength}%</span>
                </div>
              </div>

              {/* 环境数据 */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {monitoringData.telemetry.temperature !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Thermometer className="h-4 w-4 mr-2 text-red-400" />
                      <span className="text-gray-600">温度</span>
                    </div>
                    <span className="font-medium">{monitoringData.telemetry.temperature}°C</span>
                  </div>
                )}

                {monitoringData.telemetry.humidity !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 mr-2 text-blue-400" />
                      <span className="text-gray-600">湿度</span>
                    </div>
                    <span className="font-medium">{monitoringData.telemetry.humidity}%</span>
                  </div>
                )}
              </div>

              {/* 媒体预览 */}
              {monitoringData.media && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Camera className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-600">最新图像</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(monitoringData.timestamp)}
                    </span>
                  </div>
                  <img
                    src={monitoringData.media.thumbnail}
                    alt="设备图像"
                    className="w-full h-20 object-cover rounded"
                  />
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Activity className="h-4 w-4 mr-1" />
                历史
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                控制
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(device)}
            >
              详情
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RealTimeMonitoring() {
  const devices = useDevices();
  const [monitoringData, setMonitoringData] = useState<Record<string, MonitoringData>>({});
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5秒

  // 生成实时数据
  const generateData = () => {
    const newData: Record<string, MonitoringData> = {};
    devices.filter(d => d.status === 'online').forEach(device => {
      newData[device.id] = generateRealtimeData(device);
    });
    setMonitoringData(newData);
  };

  // 自动刷新
  useEffect(() => {
    if (isAutoRefresh) {
      const interval = setInterval(generateData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, refreshInterval, devices]);

  // 初始化数据
  useEffect(() => {
    generateData();
  }, [devices]);

  const handleViewDetails = (device: Device) => {
    console.log('查看设备详情:', device);
  };

  const onlineDevices = devices.filter(d => d.status === 'online');
  const offlineDevices = devices.filter(d => d.status === 'offline');
  const maintenanceDevices = devices.filter(d => d.status === 'maintenance');

  return (
    <div className="space-y-6">
      {/* 页面标题和控制 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">实时监控</h1>
          <p className="text-gray-600 mt-1">实时设备状态监控和数据展示</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={isAutoRefresh ? "default" : "outline"}
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          >
            {isAutoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isAutoRefresh ? '暂停' : '开始'}自动刷新
          </Button>
          <Button variant="outline" onClick={generateData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            手动刷新
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">设备总数</p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
              <Monitor className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">在线设备</p>
                <p className="text-2xl font-bold text-green-600">{onlineDevices.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">离线设备</p>
                <p className="text-2xl font-bold text-red-600">{offlineDevices.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">维护中</p>
                <p className="text-2xl font-bold text-yellow-600">{maintenanceDevices.length}</p>
              </div>
              <Settings className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 在线设备监控 */}
      {onlineDevices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>在线设备实时监控 ({onlineDevices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {onlineDevices.map(device => (
                <MonitoringCard
                  key={device.id}
                  device={device}
                  monitoringData={monitoringData[device.id]}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 离线设备 */}
      {offlineDevices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>离线设备 ({offlineDevices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {offlineDevices.map(device => (
                <div key={device.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{device.name}</h4>
                      <p className="text-sm text-gray-500">{device.type}</p>
                    </div>
                    <StatusBadge status={device.status} />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      最后在线: {formatRelativeTime(device.lastUpdate)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 维护中设备 */}
      {maintenanceDevices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>维护中设备 ({maintenanceDevices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {maintenanceDevices.map(device => (
                <div key={device.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{device.name}</h4>
                      <p className="text-sm text-gray-500">{device.type}</p>
                    </div>
                    <StatusBadge status={device.status} />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Settings className="h-3 w-3 mr-1" />
                      维护中...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default RealTimeMonitoring;
