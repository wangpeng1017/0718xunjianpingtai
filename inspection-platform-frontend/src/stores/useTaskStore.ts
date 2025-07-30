import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { InspectionTask, InspectionTarget, TaskStatus } from '../types';

interface TaskState {
  tasks: InspectionTask[];
  targets: InspectionTarget[];
  taskStatuses: TaskStatus[];
  selectedTask: InspectionTask | null;
  loading: boolean;
  error: string | null;
  filters: {
    status: string[];
    priority: string[];
    deviceId: string[];
    dateRange: {
      start: string;
      end: string;
    } | null;
  };
}

interface TaskActions {
  // 任务操作
  setTasks: (tasks: InspectionTask[]) => void;
  addTask: (task: InspectionTask) => void;
  updateTask: (id: string, updates: Partial<InspectionTask>) => void;
  removeTask: (id: string) => void;
  setSelectedTask: (task: InspectionTask | null) => void;
  
  // 目标操作
  setTargets: (targets: InspectionTarget[]) => void;
  addTarget: (target: InspectionTarget) => void;
  updateTarget: (id: string, updates: Partial<InspectionTarget>) => void;
  removeTarget: (id: string) => void;
  
  // 状态操作
  addTaskStatus: (status: TaskStatus) => void;
  updateTaskStatus: (taskId: string, status: InspectionTask['status'], notes?: string) => void;
  getTaskHistory: (taskId: string) => TaskStatus[];
  
  // 过滤操作
  setFilters: (filters: Partial<TaskState['filters']>) => void;
  clearFilters: () => void;
  getFilteredTasks: () => InspectionTask[];
  
  // 批量操作
  updateTaskStatuses: (updates: Array<{ id: string; status: InspectionTask['status'] }>) => void;
  getTasksByStatus: (status: InspectionTask['status']) => InspectionTask[];
  getTasksByPriority: (priority: InspectionTask['priority']) => InspectionTask[];
  getTasksByDevice: (deviceId: string) => InspectionTask[];
  
  // 统计操作
  getTaskStats: () => {
    total: number;
    pending: number;
    running: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
  
  // 状态管理
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

type TaskStore = TaskState & TaskActions;

const initialState: TaskState = {
  tasks: [],
  targets: [],
  taskStatuses: [],
  selectedTask: null,
  loading: false,
  error: null,
  filters: {
    status: [],
    priority: [],
    deviceId: [],
    dateRange: null,
  },
};

export const useTaskStore = create<TaskStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // 任务操作
      setTasks: (tasks) => set({ tasks }),
      
      addTask: (task) => set((state) => ({
        tasks: [...state.tasks, task],
      })),
      
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, ...updates } : task
        ),
        selectedTask: state.selectedTask?.id === id 
          ? { ...state.selectedTask, ...updates }
          : state.selectedTask,
      })),
      
      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
        taskStatuses: state.taskStatuses.filter(status => status.taskId !== id),
      })),
      
      setSelectedTask: (task) => set({ selectedTask: task }),
      
      // 目标操作
      setTargets: (targets) => set({ targets }),
      
      addTarget: (target) => set((state) => ({
        targets: [...state.targets, target],
      })),
      
      updateTarget: (id, updates) => set((state) => ({
        targets: state.targets.map(target =>
          target.id === id ? { ...target, ...updates } : target
        ),
      })),
      
      removeTarget: (id) => set((state) => ({
        targets: state.targets.filter(target => target.id !== id),
      })),
      
      // 状态操作
      addTaskStatus: (status) => set((state) => ({
        taskStatuses: [...state.taskStatuses, status],
      })),
      
      updateTaskStatus: (taskId, status, notes) => {
        const newStatus: TaskStatus = {
          id: Math.random().toString(36).substr(2, 9),
          taskId,
          status,
          timestamp: new Date().toISOString(),
          notes,
          reviewRequired: status === 'failed' || status === 'cancelled',
        };
        
        set((state) => ({
          taskStatuses: [...state.taskStatuses, newStatus],
          tasks: state.tasks.map(task =>
            task.id === taskId ? { ...task, status } : task
          ),
        }));
      },
      
      getTaskHistory: (taskId) => {
        return get().taskStatuses
          .filter(status => status.taskId === taskId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },
      
      // 过滤操作
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
      })),
      
      clearFilters: () => set({
        filters: {
          status: [],
          priority: [],
          deviceId: [],
          dateRange: null,
        },
      }),
      
      getFilteredTasks: () => {
        const { tasks, filters } = get();
        
        return tasks.filter(task => {
          // 状态过滤
          if (filters.status.length > 0 && !filters.status.includes(task.status)) {
            return false;
          }
          
          // 优先级过滤
          if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
            return false;
          }
          
          // 设备过滤
          if (filters.deviceId.length > 0 && !filters.deviceId.includes(task.deviceId)) {
            return false;
          }
          
          // 日期范围过滤
          if (filters.dateRange) {
            const taskDate = new Date(task.createdAt);
            const startDate = new Date(filters.dateRange.start);
            const endDate = new Date(filters.dateRange.end);
            
            if (taskDate < startDate || taskDate > endDate) {
              return false;
            }
          }
          
          return true;
        });
      },
      
      // 批量操作
      updateTaskStatuses: (updates) => set((state) => ({
        tasks: state.tasks.map(task => {
          const update = updates.find(u => u.id === task.id);
          return update ? { ...task, status: update.status } : task;
        }),
      })),
      
      getTasksByStatus: (status) => {
        return get().tasks.filter(task => task.status === status);
      },
      
      getTasksByPriority: (priority) => {
        return get().tasks.filter(task => task.priority === priority);
      },
      
      getTasksByDevice: (deviceId) => {
        return get().tasks.filter(task => task.deviceId === deviceId);
      },
      
      // 统计操作
      getTaskStats: () => {
        const tasks = get().tasks;
        return {
          total: tasks.length,
          pending: tasks.filter(t => t.status === 'pending').length,
          running: tasks.filter(t => t.status === 'running').length,
          completed: tasks.filter(t => t.status === 'completed').length,
          failed: tasks.filter(t => t.status === 'failed').length,
          cancelled: tasks.filter(t => t.status === 'cancelled').length,
        };
      },
      
      // 状态管理
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'task-store',
    }
  )
);

// 选择器
export const useTasks = () => useTaskStore((state) => state.tasks);
export const useTargets = () => useTaskStore((state) => state.targets);
export const useSelectedTask = () => useTaskStore((state) => state.selectedTask);
export const useTaskFilters = () => useTaskStore((state) => state.filters);
export const useTaskLoading = () => useTaskStore((state) => state.loading);
export const useTaskError = () => useTaskStore((state) => state.error);
