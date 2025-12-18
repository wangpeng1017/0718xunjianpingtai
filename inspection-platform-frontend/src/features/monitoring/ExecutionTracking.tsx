import React, { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  MapPin,
  Clock,
  Activity,
  Zap,
  Thermometer,
  Wifi,
  Camera,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  RefreshCw,
  Maximize2,
  Video,
  Bell,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { formatRelativeTime } from "../../lib/utils";

// 执行跟踪数据类型定义
interface ExecutionTracking {
  id: string;
  taskId: string;
  taskName: string;
  deviceId: string;
  deviceName: string;
  status: "running" | "paused" | "completed" | "failed" | "emergency_stop";
  startTime: string;
  currentTime: string;
  estimatedEndTime: string;
  progress: number;
  currentTarget: {
    id: string;
    name: string;
    eta: string; // 预计到达时间
    distance: number; // 距离（米）
  };
  deviceMetrics: {
    temperature: number;
    signalStrength: number;
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
  };
  sensorData: {
    timestamp: string;
    camera: {
      status: "active" | "inactive" | "error";
      resolution: string;
      frameRate: number;
    };
    thermal: {
      status: "active" | "inactive" | "error";
      temperature: number;
      range: string;
    };
    lidar: {
      status: "active" | "inactive" | "error";
      range: number;
      accuracy: number;
    };
    gps: {
      status: "active" | "inactive" | "error";
      satellites: number;
      accuracy: number;
    };
  };
  alerts: {
    id: string;
    type: "warning" | "error" | "critical";
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }[];
  checkpoints: {
    id: string;
    name: string;
    status: "pending" | "approaching" | "arrived" | "completed" | "skipped";
    estimatedTime: string;
    actualTime?: string;
    duration?: number;
    inspectionItems?: {
      id: string;
      type: string;
      name: string;
      required: boolean;
      completed?: boolean;
      result?: string;
    }[];
  }[];
}

// Mock数据
const mockExecutionData: ExecutionTracking[] = [
  {
    id: "exec-a",
    taskId: "task-a",
    taskName: "A点巡检任务",
    deviceId: "device-9",
    deviceName: "测温云台",
    status: "running",
    startTime: "2024-01-15T10:00:00Z",
    currentTime: "2024-01-15T10:20:00Z",
    estimatedEndTime: "2024-01-15T10:45:00Z",
    progress: 45,
    currentTarget: {
      id: "target-1",
      name: "A点检测区域",
      eta: "2024-01-15T10:30:00Z",
      distance: 15,
    },
    deviceMetrics: {
      temperature: 42,
      signalStrength: 85,
      cpuUsage: 45,
      memoryUsage: 62,
      storageUsage: 34,
    },
    sensorData: {
      timestamp: "2024-07-17T09:20:00Z",
      camera: {
        status: "active",
        resolution: "4K",
        frameRate: 30,
      },
      thermal: {
        status: "active",
        temperature: 68.5,
        range: "-20°C to 150°C",
      },
      lidar: {
        status: "active",
        range: 100,
        accuracy: 0.1,
      },
      gps: {
        status: "active",
        satellites: 12,
        accuracy: 2.1,
      },
    },
    alerts: [
      {
        id: "alert-1",
        type: "warning",
        message: "温度异常：检测到局部温度偏高",
        timestamp: "2024-01-15T10:15:00Z",
        acknowledged: false,
      },
      {
        id: "alert-2",
        type: "error",
        message: "设备故障：测温传感器响应延迟",
        timestamp: "2024-01-15T10:18:00Z",
        acknowledged: false,
      },
    ],
    checkpoints: [
      {
        id: "cp-1",
        name: "巡检点1 - 变压器A1",
        status: "completed",
        estimatedTime: "2024-07-17T09:05:00Z",
        actualTime: "2024-07-17T09:05:00Z",
        duration: 5,
        inspectionItems: [
          {
            id: "item-1",
            type: "visual",
            name: "外观检查",
            required: true,
            completed: true,
            result: "正常",
          },
          {
            id: "item-2",
            type: "temperature",
            name: "温度检测",
            required: true,
            completed: true,
            result: "68.5°C",
          },
        ],
      },
      {
        id: "cp-2",
        name: "巡检点2 - 配电柜B2",
        status: "completed",
        estimatedTime: "2024-07-17T09:15:00Z",
        actualTime: "2024-07-17T09:15:00Z",
        duration: 8,
        inspectionItems: [
          {
            id: "item-3",
            type: "visual",
            name: "外观检查",
            required: true,
            completed: true,
            result: "发现轻微油渍",
          },
          {
            id: "item-4",
            type: "temperature",
            name: "温度检测",
            required: true,
            completed: true,
            result: "正常",
          },
          {
            id: "item-5",
            type: "sound",
            name: "声音检测",
            required: false,
            completed: true,
            result: "正常",
          },
        ],
      },
      {
        id: "cp-3",
        name: "巡检点3 - 监控点C3",
        status: "approaching",
        estimatedTime: "2024-07-17T09:25:00Z",
        inspectionItems: [
          {
            id: "item-6",
            type: "visual",
            name: "外观检查",
            required: true,
            completed: false,
          },
          {
            id: "item-7",
            type: "temperature",
            name: "温度检测",
            required: true,
            completed: false,
          },
        ],
      },
      {
        id: "cp-4",
        name: "巡检点4 - 最终检查",
        status: "pending",
        estimatedTime: "2024-07-17T09:30:00Z",
        inspectionItems: [
          {
            id: "item-8",
            type: "visual",
            name: "外观检查",
            required: true,
            completed: false,
          },
          {
            id: "item-9",
            type: "temperature",
            name: "温度检测",
            required: true,
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: "exec-b",
    taskId: "task-b",
    taskName: "B点巡检任务",
    deviceId: "device-10",
    deviceName: "可见光云台",
    status: "running",
    startTime: "2024-01-15T10:05:00Z",
    currentTime: "2024-01-15T10:25:00Z",
    estimatedEndTime: "2024-01-15T10:50:00Z",
    progress: 60,
    currentTarget: {
      id: "target-2",
      name: "B点监控区域",
      eta: "2024-01-15T10:35:00Z",
      distance: 20,
    },
    deviceMetrics: {
      temperature: 38,
      signalStrength: 92,
      cpuUsage: 35,
      memoryUsage: 48,
      storageUsage: 67,
    },
    sensorData: {
      timestamp: "2024-07-17T09:20:00Z",
      camera: {
        status: "active",
        resolution: "1080p",
        frameRate: 25,
      },
      thermal: {
        status: "error",
        temperature: 0,
        range: "-20°C to 150°C",
      },
      lidar: {
        status: "active",
        range: 50,
        accuracy: 0.05,
      },
      gps: {
        status: "active",
        satellites: 10,
        accuracy: 1.5,
      },
    },
    alerts: [
      {
        id: "alert-b1",
        type: "warning",
        message: "人员入侵：检测到未授权人员进入监控区域",
        timestamp: "2024-01-15T10:20:00Z",
        acknowledged: false,
      },
    ],
    checkpoints: [
      {
        id: "cp-5",
        name: "振动检测",
        status: "completed",
        estimatedTime: "2024-07-17T08:15:00Z",
        actualTime: "2024-07-17T08:20:00Z",
        duration: 15,
      },
      {
        id: "cp-6",
        name: "温度检测",
        status: "completed",
        estimatedTime: "2024-07-17T08:45:00Z",
        actualTime: "2024-07-17T09:00:00Z",
        duration: 20,
      },
      {
        id: "cp-7",
        name: "水质检测",
        status: "pending",
        estimatedTime: "2024-07-17T09:30:00Z",
      },
    ],
  },
  {
    id: "exec-e",
    taskId: "task-e",
    taskName: "E点巡检任务",
    deviceId: "device-14",
    deviceName: "TDLAS检测云台",
    status: "running",
    startTime: "2024-01-15T10:10:00Z",
    currentTime: "2024-01-15T10:30:00Z",
    estimatedEndTime: "2024-01-15T11:00:00Z",
    progress: 30,
    currentTarget: {
      id: "target-3",
      name: "E点气体检测区域",
      eta: "2024-01-15T10:45:00Z",
      distance: 35,
    },
    deviceMetrics: {
      temperature: 40,
      signalStrength: 88,
      cpuUsage: 52,
      memoryUsage: 58,
      storageUsage: 45,
    },
    sensorData: {
      timestamp: "2024-01-15T10:30:00Z",
      camera: {
        status: "active",
        resolution: "1080p",
        frameRate: 25,
      },
      thermal: {
        status: "active",
        temperature: 55.2,
        range: "-20°C to 150°C",
      },
      lidar: {
        status: "active",
        range: 80,
        accuracy: 0.08,
      },
      gps: {
        status: "active",
        satellites: 11,
        accuracy: 1.8,
      },
    },
    alerts: [
      {
        id: "alert-e1",
        type: "critical",
        message: "气体浓度超标：检测到甲烷浓度超过安全阈值",
        timestamp: "2024-01-15T10:25:00Z",
        acknowledged: false,
      },
      {
        id: "alert-e2",
        type: "warning",
        message: "安全隐患：检测区域存在潜在泄漏风险",
        timestamp: "2024-01-15T10:28:00Z",
        acknowledged: false,
      },
    ],
    checkpoints: [
      {
        id: "cp-e1",
        name: "E点检测点1",
        status: "completed",
        estimatedTime: "2024-01-15T10:15:00Z",
        actualTime: "2024-01-15T10:15:00Z",
        duration: 5,
      },
      {
        id: "cp-e2",
        name: "E点检测点2",
        status: "approaching",
        estimatedTime: "2024-01-15T10:35:00Z",
      },
    ],
  },
];

function ExecutionTracking() {
  const [executions, setExecutions] =
    useState<ExecutionTracking[]>(mockExecutionData);
  const [selectedExecution, setSelectedExecution] =
    useState<ExecutionTracking | null>(executions[0]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 自动刷新数据
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setExecutions((prev) =>
        prev.map((exec) => ({
          ...exec,
          currentTime: new Date().toISOString(),
          progress: Math.min(exec.progress + Math.random() * 2, 100),
          deviceMetrics: {
            ...exec.deviceMetrics,
            temperature:
              exec.deviceMetrics.temperature + (Math.random() - 0.5) * 2,
            cpuUsage: Math.max(
              0,
              Math.min(
                100,
                exec.deviceMetrics.cpuUsage + (Math.random() - 0.5) * 10,
              ),
            ),
          },
        })),
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleTaskControl = (
    executionId: string,
    action: "pause" | "resume" | "stop",
  ) => {
    setExecutions(
      executions.map((exec) => {
        if (exec.id === executionId) {
          switch (action) {
            case "pause":
              return { ...exec, status: "paused" };
            case "resume":
              return { ...exec, status: "running" };
            case "stop":
              return { ...exec, status: "emergency_stop" };
            default:
              return exec;
          }
        }
        return exec;
      }),
    );
  };

  const acknowledgeAlert = (executionId: string, alertId: string) => {
    setExecutions(
      executions.map((exec) => {
        if (exec.id === executionId) {
          return {
            ...exec,
            alerts: exec.alerts.map((alert) =>
              alert.id === alertId ? { ...alert, acknowledged: true } : alert,
            ),
          };
        }
        return exec;
      }),
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return Play;
      case "paused":
        return Pause;
      case "completed":
        return CheckCircle;
      case "failed":
        return XCircle;
      case "emergency_stop":
        return Square;
      default:
        return Clock;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return XCircle;
      case "error":
        return AlertTriangle;
      case "warning":
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "error":
        return "text-orange-600 bg-orange-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "inactive":
        return "text-gray-400";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">执行跟踪</h1>
          <p className="text-gray-600 mt-1">实时监控任务执行过程和设备状态</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "bg-green-50 text-green-600" : ""}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`}
            />
            {autoRefresh ? "自动刷新" : "手动刷新"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：任务列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>执行中的任务</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {executions.map((execution) => {
                  const StatusIcon = getStatusIcon(execution.status);
                  return (
                    <div
                      key={execution.id}
                      className={`p-4 cursor-pointer border-l-4 hover:bg-gray-50 ${selectedExecution?.id === execution.id
                        ? "bg-blue-50 border-blue-500"
                        : "border-transparent"
                        }`}
                      onClick={() => setSelectedExecution(execution)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <StatusIcon
                            className={`h-5 w-5 ${execution.status === "running"
                              ? "text-green-500"
                              : execution.status === "paused"
                                ? "text-yellow-500"
                                : execution.status === "emergency_stop"
                                  ? "text-red-500"
                                  : "text-gray-400"
                              }`}
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {execution.taskName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {execution.deviceName}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {execution.progress}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {execution.alerts.filter((a) => !a.acknowledged)
                              .length > 0 && (
                                <span className="text-red-500">
                                  {
                                    execution.alerts.filter(
                                      (a) => !a.acknowledged,
                                    ).length
                                  }{" "}
                                  警告
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${execution.status === "running"
                              ? "bg-green-500"
                              : execution.status === "paused"
                                ? "bg-yellow-500"
                                : "bg-gray-400"
                              }`}
                            style={{ width: `${execution.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：详细信息 */}
        <div className="lg:col-span-2 space-y-6">
          {selectedExecution && (
            <>
              {/* 任务控制 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedExecution.taskName}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        设备: {selectedExecution.deviceName} • 开始时间:{" "}
                        {formatRelativeTime(selectedExecution.startTime)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedExecution.status === "running" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleTaskControl(selectedExecution.id, "pause")
                            }
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            暂停
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleTaskControl(selectedExecution.id, "stop")
                            }
                            className="text-red-600 hover:text-red-700"
                          >
                            <Square className="h-4 w-4 mr-2" />
                            停止
                          </Button>
                        </>
                      )}
                      {selectedExecution.status === "paused" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleTaskControl(selectedExecution.id, "resume")
                          }
                        >
                          <Play className="h-4 w-4 mr-2" />
                          继续
                        </Button>
                      )}
                      <StatusBadge status={selectedExecution.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">当前目标</div>
                      <div className="text-sm font-medium mt-1">
                        {selectedExecution.currentTarget.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        距离: {selectedExecution.currentTarget.distance}m
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">预计完成</div>
                      <div className="text-sm font-medium mt-1">
                        {formatRelativeTime(selectedExecution.estimatedEndTime)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>执行进度</span>
                      <span>{selectedExecution.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${selectedExecution.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* 视频流、AI报警和云台控制 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 实时视频流 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <Video className="h-5 w-5 mr-2 text-green-600" />
                        实时视频流
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                          <span className="text-xs text-green-600">直播中</span>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Maximize2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="relative bg-gray-900 rounded-lg overflow-hidden"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <video
                        src="http://10.130.9.179:8004/app/stream1.live.mp4"
                        className="w-full h-full object-contain"
                        autoPlay
                        muted
                        loop
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                        {selectedExecution.sensorData.camera.resolution} @{" "}
                        {selectedExecution.sensorData.camera.frameRate}fps
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 云台控制 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Camera className="h-5 w-5 mr-2 text-blue-600" />
                      云台控制
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* 方向控制 */}
                      <div>
                        <div className="text-sm text-gray-600 mb-2">
                          方向控制
                        </div>
                        <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                          <div></div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10"
                            onClick={() => console.log("PTZ: Up")}
                          >
                            <ChevronUp className="h-5 w-5" />
                          </Button>
                          <div></div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10"
                            onClick={() => console.log("PTZ: Left")}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10"
                            onClick={() => console.log("PTZ: Center")}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10"
                            onClick={() => console.log("PTZ: Right")}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                          <div></div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10"
                            onClick={() => console.log("PTZ: Down")}
                          >
                            <ChevronDown className="h-5 w-5" />
                          </Button>
                          <div></div>
                        </div>
                      </div>

                      {/* 变焦控制 */}
                      <div>
                        <div className="text-sm text-gray-600 mb-2">
                          变焦控制
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log("Zoom: Out")}
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            defaultValue="50"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log("Zoom: In")}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 预置位 */}
                      <div>
                        <div className="text-sm text-gray-600 mb-2">预置位</div>
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 3, 4, 5, 6].map((preset) => (
                            <Button
                              key={preset}
                              variant="outline"
                              size="sm"
                              onClick={() => console.log(`Preset: ${preset}`)}
                            >
                              预置位 {preset}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* AI智能报警 - 图片展示 */}{" "}
              <Card>
                {" "}
                <CardHeader>
                  {" "}
                  <CardTitle className="flex items-center">
                    {" "}
                    <Bell className="h-5 w-5 mr-2 text-red-600" /> AI智能报警{" "}
                    {selectedExecution.alerts.filter((a) => !a.acknowledged)
                      .length > 0 && (
                        <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                          {" "}
                          {
                            selectedExecution.alerts.filter(
                              (a) => !a.acknowledged,
                            ).length
                          }{" "}
                          条未处理{" "}
                        </span>
                      )}{" "}
                  </CardTitle>{" "}
                </CardHeader>{" "}
                <CardContent>
                  {" "}
                  {selectedExecution.alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      {" "}
                      <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />{" "}
                      <p>暂无报警信息</p>{" "}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {" "}
                      {selectedExecution.alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`rounded-lg border overflow-hidden ${alert.acknowledged ? "opacity-50" : ""}`}
                        >
                          {" "}
                          <div className="relative aspect-video bg-gray-100">
                            {" "}
                            <img
                              src={`http://10.130.9.179:8004/api/alerts/${alert.id}/image`}
                              alt={alert.message}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">暂无图片</text></svg>';
                              }}
                            />{" "}
                            <div
                              className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs text-white ${alert.type === "critical" ? "bg-red-500" : alert.type === "error" ? "bg-orange-500" : "bg-yellow-500"}`}
                            >
                              {alert.type === "critical"
                                ? "严重"
                                : alert.type === "error"
                                  ? "错误"
                                  : "警告"}
                            </div>{" "}
                          </div>{" "}
                          <div className="p-2">
                            {" "}
                            <div className="text-xs font-medium truncate">
                              {alert.message}
                            </div>{" "}
                            <div className="text-xs text-gray-500 mt-1">
                              {formatRelativeTime(alert.timestamp)}
                            </div>{" "}
                            {!alert.acknowledged && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  acknowledgeAlert(
                                    selectedExecution.id,
                                    alert.id,
                                  )
                                }
                                className="w-full mt-2 text-xs h-7"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                确认
                              </Button>
                            )}{" "}
                          </div>{" "}
                        </div>
                      ))}{" "}
                    </div>
                  )}{" "}
                </CardContent>{" "}
              </Card>
            </>
          )}
        </div>
      </div>
    </div >
  );
}

export default ExecutionTracking;
