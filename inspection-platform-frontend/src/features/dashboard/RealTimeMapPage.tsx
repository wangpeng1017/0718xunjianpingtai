import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera,
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
    MoreHorizontal,
    ArrowLeft,
    Clock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

// 模拟机器人数据
const mockRobots = [
    { id: 'robot-001', name: '巡检机器人-01', status: 'online', signal: 92, task: '日常巡检' },
    { id: 'robot-002', name: '巡检机器人-02', status: 'offline', signal: 95, task: '已停机' },
    { id: 'robot-003', name: '安防机器人-03', status: 'offline', signal: 0, task: '离线' },
];

export default function RealTimeMapPage() {
    const navigate = useNavigate();
    const [selectedRobot, setSelectedRobot] = useState(mockRobots[0]);
    const [isPlaying, setIsPlaying] = useState(true);
    const [ptzSpeed, setPtzSpeed] = useState(50);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handlePtzControl = (direction: string) => {
        console.log(`PTZ Control: ${direction}`);
    };

    return (
        <div className="min-h-screen w-full bg-[#020617] text-white overflow-hidden flex flex-col relative">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#020617] to-[#020617] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            {/* 顶部导航栏 */}
            <header className="relative z-10 h-16 border-b border-blue-500/30 bg-blue-950/20 backdrop-blur-md flex items-center justify-between px-6 shadow-lg shadow-blue-900/10">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="text-blue-200 hover:text-white hover:bg-blue-500/20"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        返回
                    </Button>
                    <div className="h-6 w-px bg-blue-500/30" />
                    <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                        机器人实时监控看板
                    </h1>
                </div>
                <div className="flex items-center space-x-6 text-sm text-blue-200">
                    <div className="flex items-center space-x-2 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/20">
                        <Clock className="w-4 h-4 text-cyan-400" />
                        <span className="font-mono">{currentTime.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>系统运行正常</span>
                    </div>
                </div>
            </header>

            {/* 主要内容区域 */}
            <main className="flex-1 relative z-10 p-6 grid grid-cols-12 gap-6 overflow-hidden">

                {/* 左侧：设备列表 */}
                <div className="col-span-3 flex flex-col bg-blue-950/20 border border-blue-500/30 rounded-xl backdrop-blur-sm overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="p-4 border-b border-blue-500/30 bg-blue-900/20">
                        <h3 className="font-semibold text-blue-100 flex items-center">
                            <Video className="w-5 h-5 mr-2 text-cyan-400" />
                            设备列表
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {mockRobots.map(robot => (
                            <div
                                key={robot.id}
                                onClick={() => setSelectedRobot(robot)}
                                className={`p-4 rounded-lg cursor-pointer transition-all border group ${selectedRobot.id === robot.id
                                    ? 'bg-blue-600/20 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                    : 'bg-blue-900/10 border-transparent hover:bg-blue-800/30 hover:border-blue-500/30'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`font-medium ${selectedRobot.id === robot.id ? 'text-cyan-100' : 'text-blue-200'}`}>
                                        {robot.name}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${robot.status === 'online' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                        }`}>
                                        {robot.status === 'online' ? '运行中' : '离线'}
                                    </span>
                                </div>
                                <div className="text-xs text-blue-300/80">
                                    <div className="flex items-center">
                                        <Wifi className="w-3 h-3 mr-1.5 text-cyan-400" />
                                        信号强度: {robot.signal}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 中间：视频监控 */}
                <div className="col-span-6 flex flex-col space-y-6">
                    <div className="flex-1 bg-black/40 rounded-xl border border-blue-500/30 overflow-hidden relative shadow-2xl group">
                        {/* 装饰角标 */}
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500 z-20" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500 z-20" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500 z-20" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500 z-20" />

                        <video
                            src="http://10.130.9.179:8004/app/stream1.live.mp4"
                            className="w-full h-full object-contain bg-gray-900/50"
                            autoPlay
                            muted
                            loop
                        />

                        {/* 视频覆盖层 */}
                        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-3">
                                    <Video className="w-5 h-5 text-red-500 animate-pulse" />
                                    <span className="font-semibold text-lg tracking-wide text-white shadow-black drop-shadow-md">
                                        {selectedRobot.name} - 前置摄像头
                                    </span>
                                </div>
                                <p className="text-xs text-blue-200 mt-1 font-mono opacity-80">
                                    CAM_ID: {selectedRobot.id.toUpperCase()}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2 bg-red-500/20 border border-red-500/50 px-3 py-1 rounded backdrop-blur-md">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                <span className="text-xs font-bold text-red-400">LIVE</span>
                            </div>
                        </div>

                        {/* 底部控制栏 */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                            <div className="flex justify-center space-x-6">
                                <button
                                    className="p-3 rounded-full bg-white/10 hover:bg-cyan-500/20 text-white hover:text-cyan-400 border border-white/10 hover:border-cyan-500/50 transition-all backdrop-blur-sm"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                >
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                </button>
                                <button className="p-3 rounded-full bg-white/10 hover:bg-cyan-500/20 text-white hover:text-cyan-400 border border-white/10 hover:border-cyan-500/50 transition-all backdrop-blur-sm">
                                    <Camera className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 底部状态条 */}
                    <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-5 flex justify-between items-center backdrop-blur-sm">
                        <div className="flex space-x-12">
                            <div>
                                <p className="text-xs text-blue-400 mb-1">当前任务</p>
                                <p className="font-medium text-blue-100">{selectedRobot.task}</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-400 mb-1">运行时间</p>
                                <p className="font-medium text-blue-100 font-mono">02:15:30</p>
                            </div>
                            <div>
                                <p className="text-xs text-blue-400 mb-1">行驶速度</p>
                                <p className="font-medium text-blue-100 font-mono">1.2 m/s</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <Button variant="destructive" size="sm" className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-200">
                                <Power className="w-4 h-4 mr-2" /> 紧急停止
                            </Button>
                            <Button variant="default" size="sm" className="bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 text-cyan-200">
                                <Play className="w-4 h-4 mr-2" /> 自动返航
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 右侧：云台控制 */}
                <div className="col-span-3 flex flex-col space-y-6">
                    {/* 云台控制盘 */}
                    <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-6 flex flex-col items-center backdrop-blur-sm">
                        <h3 className="font-semibold text-blue-100 mb-8 flex items-center w-full border-b border-blue-500/20 pb-4">
                            <Move className="w-5 h-5 mr-2 text-cyan-400" />
                            云台控制 (PTZ)
                        </h3>

                        {/* 方向键 */}
                        <div className="relative w-56 h-56 bg-blue-900/10 rounded-full border border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] flex items-center justify-center mb-8">
                            {/* 装饰圈 */}
                            <div className="absolute inset-4 rounded-full border border-blue-500/10 border-dashed animate-spin-slow" />

                            <button
                                className="absolute top-2 left-1/2 transform -translate-x-1/2 p-3 text-blue-400 hover:text-cyan-300 hover:bg-blue-500/20 rounded-full transition-all active:scale-95"
                                onClick={() => handlePtzControl('up')}
                            >
                                <ChevronUp className="w-8 h-8" />
                            </button>
                            <button
                                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 p-3 text-blue-400 hover:text-cyan-300 hover:bg-blue-500/20 rounded-full transition-all active:scale-95"
                                onClick={() => handlePtzControl('down')}
                            >
                                <ChevronDown className="w-8 h-8" />
                            </button>
                            <button
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-3 text-blue-400 hover:text-cyan-300 hover:bg-blue-500/20 rounded-full transition-all active:scale-95"
                                onClick={() => handlePtzControl('left')}
                            >
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                            <button
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 text-blue-400 hover:text-cyan-300 hover:bg-blue-500/20 rounded-full transition-all active:scale-95"
                                onClick={() => handlePtzControl('right')}
                            >
                                <ChevronRight className="w-8 h-8" />
                            </button>

                            {/* 中心复位键 */}
                            <button
                                className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full shadow-lg flex items-center justify-center text-cyan-300 hover:text-white hover:from-blue-500/30 hover:to-cyan-500/30 transition-all border border-blue-400/30 active:scale-95"
                                onClick={() => handlePtzControl('center')}
                            >
                                <RefreshCw className="w-8 h-8" />
                            </button>
                        </div>

                        {/* 变焦控制 */}
                        <div className="w-full space-y-6 px-2">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-blue-300">变焦速度</span>
                                    <span className="text-cyan-300 font-mono">{ptzSpeed}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={ptzSpeed}
                                    onChange={(e) => setPtzSpeed(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Button variant="outline" className="flex items-center justify-center bg-blue-900/20 border-blue-500/30 text-blue-200 hover:bg-blue-800/30 hover:text-white">
                                    <ZoomOut className="w-4 h-4 mr-2" /> 缩小
                                </Button>
                                <Button variant="outline" className="flex items-center justify-center bg-blue-900/20 border-blue-500/30 text-blue-200 hover:bg-blue-800/30 hover:text-white">
                                    <ZoomIn className="w-4 h-4 mr-2" /> 放大
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 预置位 */}
                    <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-5 flex-1 backdrop-blur-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-blue-100">预置位</h3>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-400 hover:text-white hover:bg-blue-500/20">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                    key={num}
                                    className="flex items-center justify-center p-2.5 rounded border border-blue-500/20 bg-blue-900/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 text-sm text-blue-300 hover:text-cyan-200 transition-all"
                                >
                                    位置 {num}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
