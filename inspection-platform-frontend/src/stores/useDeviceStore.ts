import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Device, DeviceTemplate, Capability, MonitoringData } from '../types';

interface DeviceState {
  devices: Device[];
  templates: DeviceTemplate[];
  capabilities: Capability[];
  monitoringData: Record<string, MonitoringData[]>;
  selectedDevice: Device | null;
  loading: boolean;
  error: string | null;
}

interface DeviceActions {
  // 设备操作
  setDevices: (devices: Device[]) => void;
  addDevice: (device: Device) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  removeDevice: (id: string) => void;
  setSelectedDevice: (device: Device | null) => void;
  
  // 模板操作
  setTemplates: (templates: DeviceTemplate[]) => void;
  addTemplate: (template: DeviceTemplate) => void;
  updateTemplate: (id: string, updates: Partial<DeviceTemplate>) => void;
  removeTemplate: (id: string) => void;
  
  // 能力操作
  setCapabilities: (capabilities: Capability[]) => void;
  addCapability: (capability: Capability) => void;
  updateCapability: (id: string, updates: Partial<Capability>) => void;
  removeCapability: (id: string) => void;
  toggleCapability: (id: string) => void;
  
  // 监控数据操作
  addMonitoringData: (deviceId: string, data: MonitoringData) => void;
  setMonitoringData: (deviceId: string, data: MonitoringData[]) => void;
  clearMonitoringData: (deviceId: string) => void;
  
  // 状态操作
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // 批量操作
  updateDeviceStatuses: (updates: Array<{ id: string; status: Device['status'] }>) => void;
  getDevicesByType: (type: Device['type']) => Device[];
  getOnlineDevices: () => Device[];
  getDevicesByStatus: (status: Device['status']) => Device[];
}

type DeviceStore = DeviceState & DeviceActions;

const initialState: DeviceState = {
  devices: [],
  templates: [],
  capabilities: [],
  monitoringData: {},
  selectedDevice: null,
  loading: false,
  error: null,
};

export const useDeviceStore = create<DeviceStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // 设备操作
      setDevices: (devices) => set({ devices }),
      
      addDevice: (device) => set((state) => ({
        devices: [...state.devices, device],
      })),
      
      updateDevice: (id, updates) => set((state) => ({
        devices: state.devices.map(device =>
          device.id === id ? { ...device, ...updates } : device
        ),
        selectedDevice: state.selectedDevice?.id === id 
          ? { ...state.selectedDevice, ...updates }
          : state.selectedDevice,
      })),
      
      removeDevice: (id) => set((state) => ({
        devices: state.devices.filter(device => device.id !== id),
        selectedDevice: state.selectedDevice?.id === id ? null : state.selectedDevice,
        monitoringData: Object.fromEntries(
          Object.entries(state.monitoringData).filter(([deviceId]) => deviceId !== id)
        ),
      })),
      
      setSelectedDevice: (device) => set({ selectedDevice: device }),
      
      // 模板操作
      setTemplates: (templates) => set({ templates }),
      
      addTemplate: (template) => set((state) => ({
        templates: [...state.templates, template],
      })),
      
      updateTemplate: (id, updates) => set((state) => ({
        templates: state.templates.map(template =>
          template.id === id ? { ...template, ...updates } : template
        ),
      })),
      
      removeTemplate: (id) => set((state) => ({
        templates: state.templates.filter(template => template.id !== id),
      })),
      
      // 能力操作
      setCapabilities: (capabilities) => set({ capabilities }),
      
      addCapability: (capability) => set((state) => ({
        capabilities: [...state.capabilities, capability],
      })),
      
      updateCapability: (id, updates) => set((state) => ({
        capabilities: state.capabilities.map(capability =>
          capability.id === id ? { ...capability, ...updates } : capability
        ),
      })),
      
      removeCapability: (id) => set((state) => ({
        capabilities: state.capabilities.filter(capability => capability.id !== id),
      })),
      
      toggleCapability: (id) => set((state) => ({
        capabilities: state.capabilities.map(capability =>
          capability.id === id 
            ? { ...capability, isActive: !capability.isActive }
            : capability
        ),
      })),
      
      // 监控数据操作
      addMonitoringData: (deviceId, data) => set((state) => ({
        monitoringData: {
          ...state.monitoringData,
          [deviceId]: [
            ...(state.monitoringData[deviceId] || []),
            data,
          ].slice(-100), // 只保留最近100条记录
        },
      })),
      
      setMonitoringData: (deviceId, data) => set((state) => ({
        monitoringData: {
          ...state.monitoringData,
          [deviceId]: data,
        },
      })),
      
      clearMonitoringData: (deviceId) => set((state) => ({
        monitoringData: {
          ...state.monitoringData,
          [deviceId]: [],
        },
      })),
      
      // 状态操作
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // 批量操作
      updateDeviceStatuses: (updates) => set((state) => ({
        devices: state.devices.map(device => {
          const update = updates.find(u => u.id === device.id);
          return update ? { ...device, status: update.status } : device;
        }),
      })),
      
      getDevicesByType: (type) => {
        return get().devices.filter(device => device.type === type);
      },
      
      getOnlineDevices: () => {
        return get().devices.filter(device => device.status === 'online');
      },
      
      getDevicesByStatus: (status) => {
        return get().devices.filter(device => device.status === status);
      },
    }),
    {
      name: 'device-store',
    }
  )
);

// 选择器
export const useDevices = () => useDeviceStore((state) => state.devices);
export const useDeviceTemplates = () => useDeviceStore((state) => state.templates);
export const useCapabilities = () => useDeviceStore((state) => state.capabilities);
export const useSelectedDevice = () => useDeviceStore((state) => state.selectedDevice);
export const useDeviceLoading = () => useDeviceStore((state) => state.loading);
export const useDeviceError = () => useDeviceStore((state) => state.error);
