// 设备相关类型
export interface Device {
  id: string;
  name: string;
  type: 'camera' | 'drone' | 'robot' | 'sensor';
  status: 'online' | 'offline' | 'maintenance';
  location: {
    lat: number;
    lng: number;
  };
  capabilities: string[];
  lastUpdate: string;
  model?: string;
  serialNumber?: string;
  batteryLevel?: number;
}

// 设备模板类型
export interface DeviceTemplate {
  id: string;
  name: string;
  type: Device['type'];
  defaultCapabilities: string[];
  configSchema: Record<string, any>;
  createdAt: string;
}

// 能力类型
export interface Capability {
  id: string;
  name: string;
  type: 'logic' | 'orchestration' | 'video_processing' | 'data_parsing' | 'control' | 'command';
  description: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
  isActive: boolean;
}

// 巡检任务类型
export interface InspectionTask {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  deviceId: string;
  deviceName?: string;
  route: Array<{
    lat: number;
    lng: number;
    altitude?: number;
    timestamp?: string;
  }>;
  targets: InspectionTarget[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
}

// 巡检目标类型
export interface InspectionTarget {
  id: string;
  name: string;
  type: 'point' | 'polygon' | 'line';
  coordinates: number[][];
  description?: string;
  requirements: string[];
  parentId?: string;
  children?: InspectionTarget[];
}

// 任务状态管理
export interface TaskStatus {
  id: string;
  taskId: string;
  status: InspectionTask['status'];
  timestamp: string;
  operator?: string;
  notes?: string;
  reviewRequired: boolean;
}

// 实时监控数据
export interface MonitoringData {
  deviceId: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    altitude?: number;
  };
  telemetry: {
    batteryLevel?: number;
    signalStrength?: number;
    temperature?: number;
    humidity?: number;
    speed?: number;
    heading?: number;
  };
  media?: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
}

// 报告类型
export interface InspectionReport {
  id: string;
  taskId: string;
  title: string;
  type: 'standard' | 'ai_analysis' | 'exception';
  status: 'draft' | 'review' | 'approved' | 'published';
  content: {
    summary: string;
    findings: ReportFinding[];
    recommendations: string[];
    attachments: string[];
  };
  createdAt: string;
  createdBy: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// 报告发现
export interface ReportFinding {
  id: string;
  type: 'normal' | 'warning' | 'critical';
  title: string;
  description: string;
  location?: {
    lat: number;
    lng: number;
  };
  evidence: string[];
  severity: 1 | 2 | 3 | 4 | 5;
}

// 统计数据
export interface Statistics {
  period: {
    start: string;
    end: string;
  };
  tasks: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
  };
  devices: {
    total: number;
    online: number;
    offline: number;
    maintenance: number;
  };
  efficiency: {
    averageTaskDuration: number;
    successRate: number;
    deviceUtilization: number;
  };
}

// 用户类型
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  permissions: string[];
  avatar?: string;
  lastLogin?: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 分页参数
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// 过滤参数
export interface FilterParams {
  status?: string[];
  type?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  deviceIds?: string[];
}

// 通知消息
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  relatedId?: string;
}

// 可视化编排节点
export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    capability?: Capability;
    config?: Record<string, any>;
  };
}

// 可视化编排连接
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: {
    dataType: string;
    validation?: Record<string, any>;
  };
}
