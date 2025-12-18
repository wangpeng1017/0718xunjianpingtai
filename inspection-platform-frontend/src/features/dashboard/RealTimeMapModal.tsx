import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import {
    Camera,
    Battery,
    Wifi,
    Move,
    ZoomIn,
    ZoomOut,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Settings,
    Play,
    Pause,
    RefreshCw,
    Power,
    Video,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface RealTimeMapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// 模拟机器人数据
const mockRobots = [
    { id: 'robot-001', name: '巡检机器人-01', status: 'online', battery: 85, signal: 92, task: '日常巡检' },
    { id: 'robot-002', name: '巡检机器人-02', status: 'charging', battery: 100, signal: 95, task: '待机中' },
    { id: 'robot-003', name: '安防机器人-03', status: 'offline', battery: 0, signal: 0, task: '离线' },
];

export function RealTimeMapModal({ isOpen, onClose }: RealTimeMapModalProps) {
    const [selectedRobot, setSelectedRobot] = useState(mockRobots[0]);
    const [isPlaying, setIsPlaying] = useState(true);
    const [ptzSpeed, setPtzSpeed] = useState(50);

    const handlePtzControl = (direction: string) => {
        console.log(`PTZ Control: ${direction}`);
        // 这里可以添加实际的控制逻辑
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="机器人实时监控看板"
            size="xl" // 使用最大的预设尺寸
            className="max-w-[95vw] h-[90vh] flex flex-col" // 几乎全屏
        >
            <div className="flex-1 grid grid-cols-12 gap-6 h-full overflow-hidden p-2">

                {/* 左侧：机器人设备管理列表 */}
                <div className="col-span-3 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h3 className="font-semibold text-gray-800 flex items-center">
                            <Video className="w-5 h-5 mr-2 text-blue-600" />
                            设备列表
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {mockRobots.map(robot => (
                            <div
                                key={robot.id}
                                onClick={() => setSelectedRobot(robot)}
                                className={`p-3 rounded-lg cursor-pointer transition-all border ${selectedRobot.id === robot.id
                                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                                    : 'hover:bg-gray-50 border-transparent hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-gray-900">{robot.name}</span>
                                    <Badge variant={
                                        robot.status === 'online' ? 'success' :
                                            robot.status === 'charging' ? 'warning' : 'secondary'
                                    }>
                                        {robot.status === 'online' ? '运行中' :
                                            robot.status === 'charging' ? '充电中' : '离线'}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                    <div className="flex items-center">
                                        <Battery className={`w-3 h-3 mr-1 ${robot.battery > 20 ? 'text-green-500' : 'text-red-500'
                                            }`} />
                                        {robot.battery}%
                                    </div>
                                    <div className="flex items-center">
                                        <Wifi className="w-3 h-3 mr-1 text-blue-500" />
                                        {robot.signal}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* 底部快速操作 */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50/30 grid grid-cols-2 gap-2">
                        <Button size="sm" variant="outline" className="w-full text-xs">
                            <RefreshCw className="w-3 h-3 mr-1" /> 刷新列表
                        </Button>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                            <Settings className="w-3 h-3 mr-1" /> 设备管理
                        </Button>
                    </div>
                </div>

                {/* 中间：视频播放区域 */}
                <div className="col-span-6 flex flex-col space-y-4">
                    <div className="flex-1 bg-black rounded-xl overflow-hidden relative shadow-lg group">
                        {/* 视频流占位 */}
                        <video
                            src="http://10.130.9.179:8004/app/stream1.live.mp4"
                            className="w-full h-full object-contain bg-gray-900"
                            autoPlay
                            muted
                            loop
                        />

                        {/* 视频覆盖层信息 */}
                        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent text-white flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <Video className="w-5 h-5 text-red-500 animate-pulse" />
                                    <span className="font-semibold text-lg">{selectedRobot.name} - 前置摄像头</span>
                                </div>
                                <p className="text-xs text-gray-300 mt-1">{new Date().toLocaleString()}</p>
                            </div>
                            <div className="flex items-center space-x-2 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs">LIVE</span>
                            </div>
                        </div>

                        {/* 视频控制栏 (悬浮) */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex justify-center space-x-4">
                                <button
                                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                </button>
                                <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                                    <Camera className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 底部状态条 */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex justify-between items-center">
                        <div className="flex space-x-8">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">当前任务</p>
                                <p className="font-medium text-gray-800">{selectedRobot.task}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">运行时间</p>
                                <p className="font-medium text-gray-800">2小时 15分</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">行驶速度</p>
                                <p className="font-medium text-gray-800">1.2 m/s</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="destructive" size="sm">
                                <Power className="w-4 h-4 mr-1" /> 紧急停止
                            </Button>
                            <Button variant="default" size="sm">
                                <Play className="w-4 h-4 mr-1" /> 自动返航
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 右侧：云台控制 (PTZ) */}
                <div className="col-span-3 flex flex-col space-y-6">
                    {/* 云台控制盘 */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center">
                        <h3 className="font-semibold text-gray-800 mb-6 flex items-center w-full">
                            <Move className="w-5 h-5 mr-2 text-blue-600" />
                            云台控制
                        </h3>

                        {/* 方向键 */}
                        <div className="relative w-48 h-48 bg-gray-50 rounded-full border border-gray-200 shadow-inner flex items-center justify-center mb-6">
                            <button
                                className="absolute top-2 left-1/2 transform -translate-x-1/2 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                onClick={() => handlePtzControl('up')}
                            >
                                <ChevronUp className="w-8 h-8" />
                            </button>
                            <button
                                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                onClick={() => handlePtzControl('down')}
                            >
                                <ChevronDown className="w-8 h-8" />
                            </button>
                            <button
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                onClick={() => handlePtzControl('left')}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                onClick={() => handlePtzControl('right')}
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>

                            {/* 中心复位键 */}
                            <button
                                className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors border border-gray-100"
                                onClick={() => handlePtzControl('center')}
                            >
                                <RefreshCw className="w-6 h-6" />
                            </button>
                        </div>

                        {/* 变焦控制 */}
                        <div className="w-full space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">变焦速度</span>
                                <span className="text-sm font-medium">{ptzSpeed}%</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={ptzSpeed}
                                onChange={(e) => setPtzSpeed(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <Button variant="outline" className="flex items-center justify-center">
                                    <ZoomOut className="w-4 h-4 mr-2" /> 缩小
                                </Button>
                                <Button variant="outline" className="flex items-center justify-center">
                                    <ZoomIn className="w-4 h-4 mr-2" /> 放大
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 预置位 */}
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-800">预置位</h3>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                    key={num}
                                    className="flex items-center justify-center p-2 rounded border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-sm text-gray-600 transition-colors"
                                >
                                    位置 {num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
