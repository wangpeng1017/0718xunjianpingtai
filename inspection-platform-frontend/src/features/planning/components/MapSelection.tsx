import React, { useState, useRef, useEffect } from 'react';
import { MapPin, X, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export interface InspectionItem {
    id: string;
    type: 'visual' | 'temperature' | 'sound' | 'vibration' | 'other';
    name: string;
    required: boolean;
}

export interface Point {
    id: string;
    x: number;
    y: number;
    name: string;
    inspectionItems: InspectionItem[];
}

interface MapSelectionProps {
    value?: Point[];
    onChange: (points: Point[]) => void;
    readOnly?: boolean;
}

export function MapSelection({ value = [], onChange, readOnly = false }: MapSelectionProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [points, setPoints] = useState<Point[]>(value);

    useEffect(() => {
        setPoints(value);
    }, [value]);

    const handleMapClick = (e: React.MouseEvent) => {
        if (readOnly || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100; // Percentage
        const y = (e.clientY - rect.top) / rect.height * 100; // Percentage

        const newPoint: Point = {
            id: `point-${Date.now()}`,
            x,
            y,
            name: `巡检点${points.length + 1}`,
            inspectionItems: [
                { id: `item-${Date.now()}-1`, type: 'visual', name: '外观检查', required: true },
                { id: `item-${Date.now()}-2`, type: 'temperature', name: '温度检测', required: true }
            ]
        };

        const newPoints = [...points, newPoint];
        setPoints(newPoints);
        onChange(newPoints);
    };

    const handleRemovePoint = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (readOnly) return;
        const newPoints = points.filter(p => p.id !== id);
        setPoints(newPoints);
        onChange(newPoints);
    };

    const handleClear = () => {
        setPoints([]);
        onChange([]);
    };

    const handleUndo = () => {
        const newPoints = points.slice(0, -1);
        setPoints(newPoints);
        onChange(newPoints);
    };

    const handleUpdatePointName = (pointId: string, newName: string) => {
        const newPoints = points.map(p =>
            p.id === pointId ? { ...p, name: newName } : p
        );
        setPoints(newPoints);
        onChange(newPoints);
    };

    const handleAddInspectionItem = (pointId: string) => {
        const newPoints = points.map(p => {
            if (p.id === pointId) {
                const newItem: InspectionItem = {
                    id: `item-${Date.now()}`,
                    type: 'other',
                    name: '新检查项',
                    required: false
                };
                return { ...p, inspectionItems: [...p.inspectionItems, newItem] };
            }
            return p;
        });
        setPoints(newPoints);
        onChange(newPoints);
    };

    const handleRemoveInspectionItem = (pointId: string, itemId: string) => {
        const newPoints = points.map(p => {
            if (p.id === pointId) {
                return { ...p, inspectionItems: p.inspectionItems.filter(item => item.id !== itemId) };
            }
            return p;
        });
        setPoints(newPoints);
        onChange(newPoints);
    };

    const handleUpdateInspectionItem = (pointId: string, itemId: string, updates: Partial<InspectionItem>) => {
        const newPoints = points.map(p => {
            if (p.id === pointId) {
                return {
                    ...p,
                    inspectionItems: p.inspectionItems.map(item =>
                        item.id === itemId ? { ...item, ...updates } : item
                    )
                };
            }
            return p;
        });
        setPoints(newPoints);
        onChange(newPoints);
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                    巡检路线规划 ({points.length} 个点)
                </span>
                {!readOnly && (
                    <div className="space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleUndo}
                            disabled={points.length === 0}
                        >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            撤销
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClear}
                            disabled={points.length === 0}
                            className="text-red-600 hover:text-red-700"
                        >
                            <X className="h-3 w-3 mr-1" />
                            清除
                        </Button>
                    </div>
                )}
            </div>

            <div
                ref={containerRef}
                className={`relative w-full h-[400px] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden ${!readOnly ? 'cursor-crosshair hover:border-blue-400' : ''} transition-colors`}
                onClick={handleMapClick}
                style={{
                    backgroundImage: 'url(/images/park-map.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* 路线连接线 */}
                {points.length > 1 && containerRef.current && (
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        <polyline
                            points={points.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="1.5"
                            strokeDasharray="4,2"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                )}

                {/* 巡检点 */}
                {points.map((point, index) => (
                    <div
                        key={point.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    >
                        <div className="relative">
                            <MapPin className={`h-6 w-6 ${index === 0 ? 'text-green-500' : index === points.length - 1 ? 'text-red-500' : 'text-blue-500'} drop-shadow-md`} />
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded text-xs font-medium shadow-sm whitespace-nowrap">
                                {index + 1}. {point.name}
                            </span>
                            {!readOnly && (
                                <button
                                    onClick={(e) => handleRemovePoint(e, point.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {points.length === 0 && !readOnly && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-gray-400 text-sm">点击地图添加巡检点</p>
                    </div>
                )}
            </div>

            <div className="text-xs text-gray-500">
                * 点击地图添加巡检点,点与点之间将自动生成巡检路线。绿色为起点,红色为终点。
            </div>

            {/* 巡检点配置列表 */}
            {points.length > 0 && (
                <div className="mt-4 space-y-3">
                    <div className="text-sm font-medium text-gray-700">巡检点配置</div>
                    {points.map((point, index) => (
                        <div key={point.id} className="border rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                    <MapPin className={`h-4 w-4 ${index === 0 ? 'text-green-500' :
                                            index === points.length - 1 ? 'text-red-500' :
                                                'text-blue-500'
                                        }`} />
                                    <input
                                        type="text"
                                        value={point.name}
                                        onChange={(e) => handleUpdatePointName(point.id, e.target.value)}
                                        className="font-medium text-sm border-none focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-2 py-1"
                                        disabled={readOnly}
                                    />
                                </div>
                                {!readOnly && (
                                    <button
                                        onClick={(e) => handleRemovePoint(e, point.id)}
                                        className="text-red-500 hover:text-red-700 text-xs"
                                    >
                                        删除点
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs text-gray-600 mb-2">检查项目:</div>
                                {point.inspectionItems.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-2 text-sm">
                                        <select
                                            value={item.type}
                                            onChange={(e) => handleUpdateInspectionItem(point.id, item.id, { type: e.target.value as any })}
                                            className="text-xs border rounded px-2 py-1"
                                            disabled={readOnly}
                                        >
                                            <option value="visual">外观检查</option>
                                            <option value="temperature">温度检测</option>
                                            <option value="sound">声音检测</option>
                                            <option value="vibration">振动检测</option>
                                            <option value="other">其他</option>
                                        </select>
                                        <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => handleUpdateInspectionItem(point.id, item.id, { name: e.target.value })}
                                            className="flex-1 text-xs border rounded px-2 py-1"
                                            placeholder="检查项名称"
                                            disabled={readOnly}
                                        />
                                        <label className="flex items-center space-x-1 text-xs">
                                            <input
                                                type="checkbox"
                                                checked={item.required}
                                                onChange={(e) => handleUpdateInspectionItem(point.id, item.id, { required: e.target.checked })}
                                                disabled={readOnly}
                                            />
                                            <span>必填</span>
                                        </label>
                                        {!readOnly && (
                                            <button
                                                onClick={() => handleRemoveInspectionItem(point.id, item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {!readOnly && (
                                    <button
                                        onClick={() => handleAddInspectionItem(point.id)}
                                        className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                                    >
                                        + 添加检查项
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
