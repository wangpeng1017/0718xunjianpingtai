import React from 'react';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  className?: string;
}

export function LineChart({ data, width = 400, height = 200, className = '' }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded ${className}`} style={{ width, height }}>
        <span className="text-gray-500">暂无数据</span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * (width - 40) + 20;
    const y = height - 40 - ((point.value - minValue) / range) * (height - 80);
    return { x, y, ...point };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height} className="overflow-visible">
        {/* 网格线 */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        
        {/* 数据线 */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* 数据点 */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="2"
          />
        ))}
        
        {/* Y轴标签 */}
        <text x="5" y="20" fontSize="12" fill="#6b7280">{maxValue}</text>
        <text x="5" y={height - 10} fontSize="12" fill="#6b7280">{minValue}</text>
      </svg>
      
      {/* X轴标签 */}
      <div className="flex justify-between mt-2 px-5">
        {data.map((point, index) => (
          <span key={index} className="text-xs text-gray-500">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface BarChartProps {
  data: ChartDataPoint[];
  width?: number;
  height?: number;
  className?: string;
}

export function BarChart({ data, width = 400, height = 200, className = '' }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded ${className}`} style={{ width, height }}>
        <span className="text-gray-500">暂无数据</span>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 40) / data.length - 10;

  return (
    <div className={`relative ${className}`}>
      <svg width={width} height={height}>
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * (height - 60);
          const x = 20 + index * ((width - 40) / data.length);
          const y = height - 40 - barHeight;
          
          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={point.color || '#3b82f6'}
                rx="2"
              />
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="12"
                fill="#6b7280"
              >
                {point.value}
              </text>
            </g>
          );
        })}
        
        {/* X轴 */}
        <line x1="20" y1={height - 40} x2={width - 20} y2={height - 40} stroke="#e5e7eb" />
      </svg>
      
      {/* X轴标签 */}
      <div className="flex justify-between mt-2 px-5">
        {data.map((point, index) => (
          <span key={index} className="text-xs text-gray-500 text-center" style={{ width: barWidth }}>
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface PieChartProps {
  data: ChartDataPoint[];
  size?: number;
  className?: string;
}

export function PieChart({ data, size = 200, className = '' }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-full ${className}`} style={{ width: size, height: size }}>
        <span className="text-gray-500">暂无数据</span>
      </div>
    );
  }

  const total = data.reduce((sum, point) => sum + point.value, 0);
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = -90; // 从顶部开始

  const slices = data.map((point, index) => {
    const percentage = (point.value / total) * 100;
    const angle = (point.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    currentAngle += angle;

    return {
      ...point,
      pathData,
      percentage: percentage.toFixed(1),
      color: point.color || `hsl(${index * 360 / data.length}, 70%, 50%)`
    };
  });

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size}>
        {slices.map((slice, index) => (
          <path
            key={index}
            d={slice.pathData}
            fill={slice.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
      
      {/* 图例 */}
      <div className="mt-4 space-y-2">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center text-sm">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-gray-700">{slice.label}</span>
            <span className="ml-auto text-gray-500">{slice.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
