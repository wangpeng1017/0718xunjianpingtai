import axios from 'axios';
import type { ApiResponse, PaginationParams, FilterParams } from '../types';
import { 
  mockDevices, 
  mockDeviceTemplates, 
  mockCapabilities, 
  mockTasks, 
  mockTargets, 
  mockStatistics,
  mockUser,
  generateMockDevices,
  generateMockTasks,
  generateTimeSeriesData,
  generateDeviceStatusHistory
} from '../mocks/data';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 模拟API延迟
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟分页
const paginate = <T>(data: T[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = data.slice(startIndex, endIndex);
  
  return {
    items,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
    },
  };
};

// 认证API
export const authAPI = {
  login: async (credentials: { username: string; password: string }): Promise<ApiResponse<{ user: any; token: string }>> => {
    await delay();
    
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      const token = 'mock-jwt-token';
      localStorage.setItem('token', token);
      
      return {
        success: true,
        data: {
          user: mockUser,
          token,
        },
      };
    }
    
    throw new Error('用户名或密码错误');
  },
  
  logout: async (): Promise<ApiResponse> => {
    await delay(200);
    localStorage.removeItem('token');
    
    return {
      success: true,
    };
  },
  
  getCurrentUser: async (): Promise<ApiResponse<any>> => {
    await delay(300);
    
    return {
      success: true,
      data: mockUser,
    };
  },
};

// 设备API
export const deviceAPI = {
  getDevices: async (params?: PaginationParams & FilterParams): Promise<ApiResponse<any[]>> => {
    await delay();
    
    let devices = generateMockDevices(30);
    
    // 应用过滤器
    if (params?.status?.length) {
      devices = devices.filter(device => params.status!.includes(device.status));
    }
    
    if (params?.type?.length) {
      devices = devices.filter(device => params.type!.includes(device.type));
    }
    
    // 搜索
    if (params?.search) {
      const search = params.search.toLowerCase();
      devices = devices.filter(device => 
        device.name.toLowerCase().includes(search) ||
        device.model?.toLowerCase().includes(search)
      );
    }
    
    // 排序
    if (params?.sortBy) {
      devices.sort((a, b) => {
        const aValue = (a as any)[params.sortBy!];
        const bValue = (b as any)[params.sortBy!];
        
        if (params.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    // 分页
    if (params?.page && params?.limit) {
      const result = paginate(devices, params.page, params.limit);
      return {
        success: true,
        data: result.items,
        pagination: result.pagination,
      };
    }
    
    return {
      success: true,
      data: devices,
    };
  },
  
  getDevice: async (id: string): Promise<ApiResponse<any>> => {
    await delay();
    
    const devices = generateMockDevices(30);
    const device = devices.find(d => d.id === id);
    
    if (!device) {
      throw new Error('设备不存在');
    }
    
    return {
      success: true,
      data: device,
    };
  },
  
  createDevice: async (device: any): Promise<ApiResponse<any>> => {
    await delay();
    
    const newDevice = {
      ...device,
      id: `device-${Date.now()}`,
      lastUpdate: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: newDevice,
    };
  },
  
  updateDevice: async (id: string, updates: any): Promise<ApiResponse<any>> => {
    await delay();
    
    return {
      success: true,
      data: { id, ...updates, lastUpdate: new Date().toISOString() },
    };
  },
  
  deleteDevice: async (id: string): Promise<ApiResponse> => {
    await delay();
    
    return {
      success: true,
    };
  },
  
  getDeviceTemplates: async (): Promise<ApiResponse<any[]>> => {
    await delay();
    
    return {
      success: true,
      data: mockDeviceTemplates,
    };
  },
  
  getCapabilities: async (): Promise<ApiResponse<any[]>> => {
    await delay();
    
    return {
      success: true,
      data: mockCapabilities,
    };
  },
  
  getDeviceStatus: async (id: string): Promise<ApiResponse<any[]>> => {
    await delay();
    
    return {
      success: true,
      data: generateDeviceStatusHistory(id, 24),
    };
  },
};

// 任务API
export const taskAPI = {
  getTasks: async (params?: PaginationParams & FilterParams): Promise<ApiResponse<any[]>> => {
    await delay();
    
    let tasks = generateMockTasks(100);
    
    // 应用过滤器
    if (params?.status?.length) {
      tasks = tasks.filter(task => params.status!.includes(task.status));
    }
    
    if (params?.deviceIds?.length) {
      tasks = tasks.filter(task => params.deviceIds!.includes(task.deviceId));
    }
    
    // 日期范围过滤
    if (params?.dateRange) {
      const startDate = new Date(params.dateRange.start);
      const endDate = new Date(params.dateRange.end);
      
      tasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startDate && taskDate <= endDate;
      });
    }
    
    // 搜索
    if (params?.search) {
      const search = params.search.toLowerCase();
      tasks = tasks.filter(task => 
        task.name.toLowerCase().includes(search) ||
        task.deviceName?.toLowerCase().includes(search)
      );
    }
    
    // 排序
    if (params?.sortBy) {
      tasks.sort((a, b) => {
        const aValue = (a as any)[params.sortBy!];
        const bValue = (b as any)[params.sortBy!];
        
        if (params.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }
    
    // 分页
    if (params?.page && params?.limit) {
      const result = paginate(tasks, params.page, params.limit);
      return {
        success: true,
        data: result.items,
        pagination: result.pagination,
      };
    }
    
    return {
      success: true,
      data: tasks,
    };
  },
  
  getTask: async (id: string): Promise<ApiResponse<any>> => {
    await delay();
    
    const tasks = generateMockTasks(100);
    const task = tasks.find(t => t.id === id);
    
    if (!task) {
      throw new Error('任务不存在');
    }
    
    return {
      success: true,
      data: task,
    };
  },
  
  createTask: async (task: any): Promise<ApiResponse<any>> => {
    await delay();
    
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      progress: 0,
    };
    
    return {
      success: true,
      data: newTask,
    };
  },
  
  updateTask: async (id: string, updates: any): Promise<ApiResponse<any>> => {
    await delay();
    
    return {
      success: true,
      data: { id, ...updates },
    };
  },
  
  deleteTask: async (id: string): Promise<ApiResponse> => {
    await delay();
    
    return {
      success: true,
    };
  },
  
  getTargets: async (): Promise<ApiResponse<any[]>> => {
    await delay();
    
    return {
      success: true,
      data: mockTargets,
    };
  },
};

// 统计API
export const statisticsAPI = {
  getOverview: async (): Promise<ApiResponse<any>> => {
    await delay();
    
    return {
      success: true,
      data: mockStatistics,
    };
  },
  
  getTimeSeriesData: async (days: number = 30): Promise<ApiResponse<any[]>> => {
    await delay();
    
    return {
      success: true,
      data: generateTimeSeriesData(days),
    };
  },
  
  getDeviceUtilization: async (): Promise<ApiResponse<any[]>> => {
    await delay();
    
    const devices = generateMockDevices(10);
    const utilization = devices.map(device => ({
      deviceId: device.id,
      deviceName: device.name,
      utilization: Math.floor(Math.random() * 40) + 60,
      tasksCompleted: Math.floor(Math.random() * 50) + 10,
      uptime: Math.floor(Math.random() * 20) + 80,
    }));
    
    return {
      success: true,
      data: utilization,
    };
  },
};

export default api;
