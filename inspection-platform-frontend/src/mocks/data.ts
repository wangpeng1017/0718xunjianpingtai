import type { Device, DeviceTemplate, Capability, InspectionTask, InspectionTarget, User, Statistics } from '../types';

// Mock用户数据
export const mockUser: User = {
  id: 'user-1',
  username: 'admin',
  email: 'admin@inspection.com',
  role: 'admin',
  permissions: ['read', 'write', 'delete', 'admin'],
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
  lastLogin: '2024-01-15T10:30:00Z',
};

// Mock设备数据
export const mockDevices: Device[] = [
  {
    id: 'device-1',
    name: '无人机-001',
    type: 'drone',
    status: 'online',
    location: { lat: 39.9042, lng: 116.4074 },
    capabilities: ['video_capture', 'thermal_imaging', 'gps_tracking'],
    lastUpdate: '2024-01-15T10:30:00Z',
    model: 'DJI Mavic 3',
    serialNumber: 'DJI001',
    batteryLevel: 85,
  },
  {
    id: 'device-2',
    name: '摄像头-002',
    type: 'camera',
    status: 'online',
    location: { lat: 39.9142, lng: 116.4174 },
    capabilities: ['video_capture', 'motion_detection'],
    lastUpdate: '2024-01-15T10:25:00Z',
    model: 'Hikvision DS-2CD2T47G1',
    serialNumber: 'HIK002',
  },
  {
    id: 'device-3',
    name: '巡检机器人-003',
    type: 'robot',
    status: 'maintenance',
    location: { lat: 39.8942, lng: 116.3974 },
    capabilities: ['autonomous_navigation', 'obstacle_detection', 'data_collection'],
    lastUpdate: '2024-01-15T09:45:00Z',
    model: 'Boston Dynamics Spot',
    serialNumber: 'BD003',
    batteryLevel: 45,
  },
  {
    id: 'device-4',
    name: '无人机-004',
    type: 'drone',
    status: 'offline',
    location: { lat: 39.9242, lng: 116.4274 },
    capabilities: ['video_capture', 'lidar_scanning', 'gps_tracking'],
    lastUpdate: '2024-01-15T08:15:00Z',
    model: 'DJI Phantom 4 RTK',
    serialNumber: 'DJI004',
    batteryLevel: 0,
  },
  {
    id: 'device-5',
    name: '传感器-005',
    type: 'sensor',
    status: 'online',
    location: { lat: 39.9342, lng: 116.4374 },
    capabilities: ['temperature_monitoring', 'humidity_monitoring', 'air_quality'],
    lastUpdate: '2024-01-15T10:35:00Z',
    model: 'Bosch BME680',
    serialNumber: 'BSH005',
  },
  {
    id: 'device-6',
    name: '摄像头-006',
    type: 'camera',
    status: 'maintenance',
    location: { lat: 39.8842, lng: 116.3874 },
    capabilities: ['video_capture', 'night_vision', 'motion_detection'],
    lastUpdate: '2024-01-15T07:20:00Z',
    model: 'Dahua IPC-HFW5831E',
    serialNumber: 'DH006',
  },
  {
    id: 'device-7',
    name: '巡检机器人-007',
    type: 'robot',
    status: 'online',
    location: { lat: 39.9442, lng: 116.4474 },
    capabilities: ['autonomous_navigation', 'thermal_imaging', 'gas_detection'],
    lastUpdate: '2024-01-15T10:40:00Z',
    model: 'ANYbotics ANYmal',
    serialNumber: 'ANY007',
    batteryLevel: 92,
  },
  {
    id: 'device-8',
    name: '无人机-008',
    type: 'drone',
    status: 'online',
    location: { lat: 39.8742, lng: 116.3774 },
    capabilities: ['video_capture', 'multispectral_imaging', 'gps_tracking'],
    lastUpdate: '2024-01-15T10:28:00Z',
    model: 'DJI Matrice 300 RTK',
    serialNumber: 'DJI008',
    batteryLevel: 78,
  },
  {
    id: 'device-9',
    name: '测温云台',
    type: 'camera',
    status: 'online',
    location: { lat: 39.9042, lng: 116.4074 },
    capabilities: ['video_capture', 'thermal_imaging', 'ptz_control'],
    lastUpdate: '2024-01-15T10:50:00Z',
    model: '测温云台 V1',
    serialNumber: 'PTZ-TEMP-001',
  },
  {
    id: 'device-10',
    name: '可见光云台',
    type: 'camera',
    status: 'online',
    location: { lat: 39.9062, lng: 116.4094 },
    capabilities: ['video_capture', 'ptz_control'],
    lastUpdate: '2024-01-15T10:52:00Z',
    model: '可见光云台 V1',
    serialNumber: 'PTZ-VIS-001',
  },
  {
    id: 'device-11',
    name: '漏油检测云台',
    type: 'camera',
    status: 'online',
    location: { lat: 39.9082, lng: 116.4114 },
    capabilities: ['video_capture', 'infrared_imaging', 'oil_leak_detection', 'ptz_control'],
    lastUpdate: '2024-01-15T10:54:00Z',
    model: '漏油检测云台 V1',
    serialNumber: 'PTZ-OIL-001',
  },
  {
    id: 'device-12',
    name: '在线式声像仪',
    type: 'sensor',
    status: 'online',
    location: { lat: 39.9102, lng: 116.4134 },
    capabilities: ['acoustic_imaging', 'temperature_monitoring'],
    lastUpdate: '2024-01-15T10:56:00Z',
    model: '在线声像仪 V1',
    serialNumber: 'ACOUSTIC-001',
  },
  {
    id: 'device-13',
    name: '双镜头云台+声像仪一体云台',
    type: 'camera',
    status: 'online',
    location: { lat: 39.9122, lng: 116.4154 },
    capabilities: ['video_capture', 'thermal_imaging', 'acoustic_imaging', 'ptz_control'],
    lastUpdate: '2024-01-15T10:58:00Z',
    model: '双镜头声像一体云台 V1',
    serialNumber: 'PTZ-DUAL-ACOUSTIC-001',
  },
  {
    id: 'device-14',
    name: 'TDLAS检测云台',
    type: 'sensor',
    status: 'online',
    location: { lat: 39.9142, lng: 116.4174 },
    capabilities: ['gas_detection', 'tdlas_detection', 'ptz_control'],
    lastUpdate: '2024-01-15T11:00:00Z',
    model: 'TDLAS 云台 V1',
    serialNumber: 'PTZ-TDLAS-001',
  },
  {
    id: 'device-15',
    name: '边缘分析主机',
    type: 'sensor',
    status: 'online',
    location: { lat: 39.9162, lng: 116.4194 },
    capabilities: ['edge_computing', 'ai_inference', 'data_aggregation'],
    lastUpdate: '2024-01-15T11:02:00Z',
    model: '边缘分析主机 V1',
    serialNumber: 'EDGE-HOST-001',
  },
];

// Mock设备模板
export const mockDeviceTemplates: DeviceTemplate[] = [
  {
    id: 'template-1',
    name: '标准无人机模板',
    type: 'drone',
    defaultCapabilities: ['video_capture', 'gps_tracking', 'autonomous_flight'],
    configSchema: {
      maxAltitude: { type: 'number', default: 120, min: 10, max: 500 },
      maxSpeed: { type: 'number', default: 15, min: 1, max: 30 },
      cameraResolution: { type: 'string', default: '4K', options: ['1080p', '4K', '8K'] },
    },
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'template-2',
    name: '固定摄像头模板',
    type: 'camera',
    defaultCapabilities: ['video_capture', 'motion_detection', 'night_vision'],
    configSchema: {
      resolution: { type: 'string', default: '1080p', options: ['720p', '1080p', '4K'] },
      frameRate: { type: 'number', default: 30, options: [15, 30, 60] },
      nightVision: { type: 'boolean', default: true },
    },
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'template-temp-ptz',
    name: '测温云台模板',
    type: 'camera',
    defaultCapabilities: ['video_capture', 'thermal_imaging', 'ptz_control'],
    configSchema: {
      temperatureRange: { type: 'string', default: '-20°C ~ 550°C' },
      maxDistance: { type: 'number', default: 300 },
      ptzSpeed: { type: 'number', default: 20 },
    },
    createdAt: '2024-07-01T10:00:00Z',
  },
  {
    id: 'template-visible-ptz',
    name: '可见光云台模板',
    type: 'camera',
    defaultCapabilities: ['video_capture', 'ptz_control'],
    configSchema: {
      resolution: { type: 'string', default: '1080p', options: ['720p', '1080p', '4K'] },
      zoomLevel: { type: 'number', default: 20 },
      maxDistance: { type: 'number', default: 500 },
    },
    createdAt: '2024-07-01T10:05:00Z',
  },
  {
    id: 'template-oil-ptz',
    name: '漏油检测云台模板',
    type: 'camera',
    defaultCapabilities: ['video_capture', 'infrared_imaging', 'oil_leak_detection', 'ptz_control'],
    configSchema: {
      detectionBands: { type: 'string', default: '3.3–3.6μm' },
      alarmThreshold: { type: 'number', default: 80 },
    },
    createdAt: '2024-07-01T10:10:00Z',
  },
  {
    id: 'template-acoustic',
    name: '在线式声像仪模板',
    type: 'sensor',
    defaultCapabilities: ['acoustic_imaging', 'temperature_monitoring'],
    configSchema: {
      frequencyRange: { type: 'string', default: '2kHz ~ 48kHz' },
      dynamicRange: { type: 'string', default: '120dB' },
    },
    createdAt: '2024-07-01T10:15:00Z',
  },
  {
    id: 'template-dual-ptz-acoustic',
    name: '双镜头云台+声像仪一体云台模板',
    type: 'camera',
    defaultCapabilities: ['video_capture', 'thermal_imaging', 'acoustic_imaging', 'ptz_control'],
    configSchema: {
      visibleResolution: { type: 'string', default: '1080p' },
      thermalResolution: { type: 'string', default: '640x512' },
      acousticChannels: { type: 'number', default: 64 },
    },
    createdAt: '2024-07-01T10:20:00Z',
  },
  {
    id: 'template-tdlas-ptz',
    name: 'TDLAS检测云台模板',
    type: 'sensor',
    defaultCapabilities: ['gas_detection', 'tdlas_detection', 'ptz_control'],
    configSchema: {
      gasType: { type: 'string', default: 'CH4' },
      detectionRange: { type: 'number', default: 500 },
    },
    createdAt: '2024-07-01T10:25:00Z',
  },
  {
    id: 'template-edge-host',
    name: '边缘分析主机模板',
    type: 'sensor',
    defaultCapabilities: ['edge_computing', 'ai_inference', 'data_aggregation'],
    configSchema: {
      cpuCores: { type: 'number', default: 8 },
      memory: { type: 'number', default: 32 },
      storage: { type: 'number', default: 512 },
    },
    createdAt: '2024-07-01T10:30:00Z',
  },
];

// Mock能力数据
export const mockCapabilities: Capability[] = [
  {
    id: 'cap-1',
    name: '视频采集',
    type: 'video_processing',
    description: '实时视频流采集和处理',
    inputSchema: { resolution: 'string', frameRate: 'number' },
    outputSchema: { videoStream: 'stream', metadata: 'object' },
    isActive: true,
  },
  {
    id: 'cap-2',
    name: 'GPS定位',
    type: 'data_parsing',
    description: '实时GPS位置获取和解析',
    inputSchema: {},
    outputSchema: { latitude: 'number', longitude: 'number', altitude: 'number' },
    isActive: true,
  },
  {
    id: 'cap-3',
    name: '自主导航',
    type: 'logic',
    description: '基于路径规划的自主导航',
    inputSchema: { waypoints: 'array', speed: 'number' },
    outputSchema: { currentPosition: 'object', nextWaypoint: 'object' },
    isActive: true,
  },
  {
    id: 'cap-4',
    name: '异常检测',
    type: 'orchestration',
    description: 'AI驱动的异常情况检测',
    inputSchema: { imageData: 'binary', threshold: 'number' },
    outputSchema: { anomalies: 'array', confidence: 'number' },
    isActive: false,
  },
];

// Mock巡检目标
export const mockTargets: InspectionTarget[] = [
  {
    id: 'target-1',
    name: '主要建筑群',
    type: 'polygon',
    coordinates: [
      [116.4074, 39.9042],
      [116.4174, 39.9042],
      [116.4174, 39.9142],
      [116.4074, 39.9142],
      [116.4074, 39.9042],
    ],
    description: '办公楼群巡检区域',
    requirements: ['外观检查', '安全隐患排查'],
    children: [
      {
        id: 'target-1-1',
        name: 'A栋建筑',
        type: 'point',
        coordinates: [[116.4094, 39.9062]],
        description: 'A栋办公楼',
        requirements: ['外墙检查', '窗户检查'],
        parentId: 'target-1',
      },
    ],
  },
  {
    id: 'target-2',
    name: '巡检路线1',
    type: 'line',
    coordinates: [
      [116.4074, 39.9042],
      [116.4124, 39.9092],
      [116.4174, 39.9142],
    ],
    description: '标准巡检路线',
    requirements: ['路面检查', '设施检查'],
  },
];

// Mock巡检任务
export const mockTasks: InspectionTask[] = [
  {
    id: 'task-1',
    name: '日常巡检-A区域',
    status: 'running',
    deviceId: 'device-1',
    deviceName: '无人机-001',
    route: [
      { lat: 39.9042, lng: 116.4074, timestamp: '2024-01-15T10:00:00Z' },
      { lat: 39.9092, lng: 116.4124, timestamp: '2024-01-15T10:15:00Z' },
      { lat: 39.9142, lng: 116.4174, timestamp: '2024-01-15T10:30:00Z' },
    ],
    targets: [mockTargets[0]],
    createdAt: '2024-01-15T09:30:00Z',
    startedAt: '2024-01-15T10:00:00Z',
    progress: 65,
    priority: 'medium',
    assignedTo: 'operator-1',
  },
  {
    id: 'task-2',
    name: '紧急检查-设备故障',
    status: 'pending',
    deviceId: 'device-2',
    deviceName: '摄像头-002',
    route: [
      { lat: 39.9142, lng: 116.4174 },
    ],
    targets: [mockTargets[1]],
    createdAt: '2024-01-15T11:00:00Z',
    progress: 0,
    priority: 'urgent',
    assignedTo: 'operator-2',
  },
  {
    id: 'task-3',
    name: '周期性巡检-B区域',
    status: 'completed',
    deviceId: 'device-1',
    deviceName: '无人机-001',
    route: [
      { lat: 39.8942, lng: 116.3974, timestamp: '2024-01-14T14:00:00Z' },
      { lat: 39.8992, lng: 116.4024, timestamp: '2024-01-14T14:30:00Z' },
    ],
    targets: [],
    createdAt: '2024-01-14T13:30:00Z',
    startedAt: '2024-01-14T14:00:00Z',
    completedAt: '2024-01-14T15:00:00Z',
    progress: 100,
    priority: 'low',
    assignedTo: 'operator-1',
  },
];

// Mock统计数据
export const mockStatistics: Statistics = {
  period: {
    start: '2024-01-01T00:00:00Z',
    end: '2024-01-15T23:59:59Z',
  },
  tasks: {
    total: 156,
    completed: 142,
    failed: 8,
    pending: 6,
  },
  devices: {
    total: 24,
    online: 18,
    offline: 3,
    maintenance: 3,
  },
  efficiency: {
    averageTaskDuration: 45.5, // 分钟
    successRate: 91.0, // 百分比
    deviceUtilization: 75.2, // 百分比
  },
};

// 生成时间序列数据
export const generateTimeSeriesData = (days: number = 30) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      tasks: Math.floor(Math.random() * 20) + 5,
      success: Math.floor(Math.random() * 18) + 4,
      failed: Math.floor(Math.random() * 3),
      efficiency: Math.floor(Math.random() * 20) + 80,
    });
  }
  
  return data;
};

// 生成设备状态历史数据
export const generateDeviceStatusHistory = (deviceId: string, hours: number = 24) => {
  const data = [];
  const now = new Date();

  for (let i = hours - 1; i >= 0; i--) {
    const time = new Date(now);
    time.setHours(time.getHours() - i);

    data.push({
      timestamp: time.toISOString(),
      deviceId,
      batteryLevel: Math.max(20, Math.floor(Math.random() * 80) + 20),
      signalStrength: Math.floor(Math.random() * 30) + 70,
      temperature: Math.floor(Math.random() * 15) + 20,
      status: Math.random() > 0.1 ? 'online' : 'offline',
    });
  }

  return data;
};

// 扩展Mock数据以满足30个设备的要求
export const generateMockDevices = (count: number = 30): Device[] => {
  const deviceTypes: Device['type'][] = ['camera', 'drone', 'robot', 'sensor'];
  const statuses: Device['status'][] = ['online', 'offline', 'maintenance'];
  const devices: Device[] = [];

  for (let i = 0; i < count; i++) {
    const type = deviceTypes[i % deviceTypes.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    devices.push({
      id: `device-${i + 1}`,
      name: `${type === 'camera' ? '摄像头' : type === 'drone' ? '无人机' : type === 'robot' ? '机器人' : '传感器'}-${String(i + 1).padStart(3, '0')}`,
      type,
      status,
      location: {
        lat: 39.9042 + (Math.random() - 0.5) * 0.1,
        lng: 116.4074 + (Math.random() - 0.5) * 0.1,
      },
      capabilities: type === 'camera'
        ? ['video_capture', 'motion_detection']
        : type === 'drone'
        ? ['video_capture', 'thermal_imaging', 'gps_tracking']
        : type === 'robot'
        ? ['autonomous_navigation', 'obstacle_detection', 'data_collection']
        : ['temperature_monitoring', 'humidity_monitoring', 'air_quality'],
      lastUpdate: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      model: `Model-${type.toUpperCase()}-${i + 1}`,
      serialNumber: `SN${String(i + 1).padStart(6, '0')}`,
      batteryLevel: type !== 'camera' ? Math.floor(Math.random() * 100) : undefined,
    });
  }

  return devices;
};

// 生成更多Mock任务数据
export const generateMockTasks = (count: number = 100): InspectionTask[] => {
  const statuses: InspectionTask['status'][] = ['pending', 'running', 'completed', 'failed', 'cancelled'];
  const priorities: InspectionTask['priority'][] = ['low', 'medium', 'high', 'urgent'];
  const tasks: InspectionTask[] = [];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const createdAt = new Date(Date.now() - Math.random() * 30 * 86400000); // 最近30天

    tasks.push({
      id: `task-${i + 1}`,
      name: `巡检任务-${String(i + 1).padStart(3, '0')}`,
      status,
      deviceId: `device-${Math.floor(Math.random() * 30) + 1}`,
      deviceName: `设备-${Math.floor(Math.random() * 30) + 1}`,
      route: [
        {
          lat: 39.9042 + (Math.random() - 0.5) * 0.1,
          lng: 116.4074 + (Math.random() - 0.5) * 0.1,
        },
      ],
      targets: [],
      createdAt: createdAt.toISOString(),
      startedAt: status !== 'pending' ? new Date(createdAt.getTime() + Math.random() * 3600000).toISOString() : undefined,
      completedAt: status === 'completed' ? new Date(createdAt.getTime() + Math.random() * 7200000).toISOString() : undefined,
      progress: status === 'completed' ? 100 : status === 'running' ? Math.floor(Math.random() * 80) + 10 : 0,
      priority,
      assignedTo: `operator-${Math.floor(Math.random() * 5) + 1}`,
    });
  }

  return tasks;
};
