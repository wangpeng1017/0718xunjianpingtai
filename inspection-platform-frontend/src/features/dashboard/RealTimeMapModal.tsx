import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { X, Maximize2, Minimize2, Camera } from 'lucide-react';

interface RealTimeMapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RealTimeMapModal({ isOpen, onClose }: RealTimeMapModalProps) {
    // 模拟地图背景样式
    const mapStyle: React.CSSProperties = {
        backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundColor: '#f9fafb',
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="实时地图监控"
            size="xl"
            className="max-w-6xl" // 更宽的模态框
        >
            <div className="relative h-[600px] w-full rounded-lg overflow-hidden border border-gray-200" style={mapStyle}>
                {/* 模拟地图标记 */}
                <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
                        <span className="mt-1 text-xs font-medium text-gray-600 bg-white/80 px-1 rounded">设备-001</span>
                    </div>
                </div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                        <span className="mt-1 text-xs font-medium text-gray-600 bg-white/80 px-1 rounded">摄像头-002</span>
                    </div>
                </div>

                <div className="absolute bottom-1/3 right-1/4 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
                        <span className="mt-1 text-xs font-medium text-gray-600 bg-white/80 px-1 rounded">设备-003</span>
                    </div>
                </div>

                {/* 视频悬浮窗 - 摄像头-002 */}
                <div className="absolute top-4 right-4 w-80 bg-black rounded-lg shadow-2xl overflow-hidden border border-gray-700">
                    <div className="bg-gray-900 px-3 py-2 flex items-center justify-between border-b border-gray-800">
                        <div className="flex items-center space-x-2">
                            <Camera className="h-4 w-4 text-green-500" />
                            <span className="text-white text-sm font-medium">摄像头-002 实时画面</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-gray-400">LIVE</span>
                        </div>
                    </div>
                    <div className="relative aspect-video bg-gray-800">
                        <video
                            src="http://10.130.9.179:8004/app/stream1.live.mp4"
                            className="w-full h-full object-cover"
                            controls
                            autoPlay
                            muted
                        />
                    </div>
                    <div className="bg-gray-900 px-3 py-2 flex items-center justify-between text-xs text-gray-400">
                        <span>信号强度: 98%</span>
                        <span>分辨率: 1080P</span>
                    </div>
                </div>

                {/* 地图控制控件模拟 */}
                <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                    <button className="p-2 bg-white rounded shadow hover:bg-gray-50 text-gray-600">
                        <Maximize2 className="h-5 w-5" />
                    </button>
                    <button className="p-2 bg-white rounded shadow hover:bg-gray-50 text-gray-600">
                        <Minimize2 className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </Modal>
    );
}
