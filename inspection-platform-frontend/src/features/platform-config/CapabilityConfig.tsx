import React from 'react';
import { 
  Plus, 
  Settings, 
  Play, 
  Save, 
  Download, 
  Upload,
  Zap,
  Eye,
  Video,
  Database,
  Command,
  Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useCapabilities, useDeviceStore } from '../../stores/useDeviceStore';
import { mockCapabilities } from '../../mocks/data';

// 能力类型图标映射
const capabilityIcons = {
  logic: Cpu,
  orchestration: Settings,
  video_processing: Video,
  data_parsing: Database,
  control: Command,
  command: Command,
};

// 能力类型颜色映射
const capabilityColors = {
  logic: 'bg-blue-100 text-blue-800 border-blue-200',
  orchestration: 'bg-purple-100 text-purple-800 border-purple-200',
  video_processing: 'bg-green-100 text-green-800 border-green-200',
  data_parsing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  control: 'bg-red-100 text-red-800 border-red-200',
  command: 'bg-gray-100 text-gray-800 border-gray-200',
};

function CapabilityConfig() {
  const capabilities = useCapabilities();
  const { setCapabilities } = useDeviceStore();
  const [selectedCapability, setSelectedCapability] = React.useState<string | null>(null);
  const [showEditor, setShowEditor] = React.useState(false);

  // 初始化能力数据
  React.useEffect(() => {
    if (capabilities.length === 0) {
      setCapabilities(mockCapabilities);
    }
  }, [capabilities.length, setCapabilities]);

  // 按类型分组的能力
  const capabilitiesByType = React.useMemo(() => {
    return capabilities.reduce((acc, capability) => {
      if (!acc[capability.type]) {
        acc[capability.type] = [];
      }
      acc[capability.type].push(capability);
      return acc;
    }, {} as Record<string, typeof capabilities>);
  }, [capabilities]);

  const handleCreateCapability = () => {
    // 打开创建能力模态框
    console.log('创建新能力');
  };

  const handleEditCapability = (capabilityId: string) => {
    setSelectedCapability(capabilityId);
    // 打开编辑模态框
    console.log('编辑能力:', capabilityId);
  };

  const handleOpenEditor = () => {
    setShowEditor(true);
  };

  const handleSaveWorkflow = () => {
    // 保存工作流配置
    console.log('保存工作流');
  };

  const handleExportWorkflow = () => {
    // 导出工作流配置
    console.log('导出工作流');
  };

  const handleImportWorkflow = () => {
    // 导入工作流配置
    console.log('导入工作流');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">能力配置</h1>
          <p className="text-gray-600 mt-1">管理平台能力和可视化编排</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleImportWorkflow}>
            <Upload className="h-4 w-4 mr-2" />
            导入配置
          </Button>
          <Button variant="outline" onClick={handleExportWorkflow}>
            <Download className="h-4 w-4 mr-2" />
            导出配置
          </Button>
          <Button onClick={handleCreateCapability}>
            <Plus className="h-4 w-4 mr-2" />
            新建能力
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总能力数</p>
                <p className="text-2xl font-bold">{capabilities.length}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃能力</p>
                <p className="text-2xl font-bold text-green-600">
                  {capabilities.filter(c => c.isActive).length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">能力类型</p>
                <p className="text-2xl font-bold">
                  {Object.keys(capabilitiesByType).length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">编排数量</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Cpu className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 可视化编排器入口 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>可视化编排器</span>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleSaveWorkflow}>
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
              <Button onClick={handleOpenEditor}>
                <Eye className="h-4 w-4 mr-2" />
                打开编排器
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <Cpu className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                类似Unity3D蓝图编辑器
              </h3>
              <p className="text-gray-600 mb-4">
                拖拽式可视化编排界面，支持能力嵌套复用，基于图的编排方式
              </p>
              <div className="flex justify-center space-x-2">
                <Button onClick={handleOpenEditor}>
                  开始编排
                </Button>
                <Button variant="outline">
                  查看模板
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 能力列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(capabilitiesByType).map(([type, typeCapabilities]) => {
          const Icon = capabilityIcons[type as keyof typeof capabilityIcons] || Settings;
          const colorClass = capabilityColors[type as keyof typeof capabilityColors] || capabilityColors.command;
          
          return (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span className="capitalize">
                    {type === 'logic' ? '逻辑能力' :
                     type === 'orchestration' ? '编排调用' :
                     type === 'video_processing' ? '视频处理' :
                     type === 'data_parsing' ? '数据解析' :
                     type === 'control' ? '操控能力' :
                     type === 'command' ? '命令下达' : type}
                  </span>
                  <Badge variant="secondary">{typeCapabilities.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {typeCapabilities.map((capability) => (
                    <div
                      key={capability.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow ${colorClass}`}
                      onClick={() => handleEditCapability(capability.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{capability.name}</h4>
                            <Badge 
                              variant={capability.isActive ? 'success' : 'secondary'}
                              className="text-xs"
                            >
                              {capability.isActive ? '活跃' : '停用'}
                            </Badge>
                          </div>
                          <p className="text-sm opacity-80 mt-1">
                            {capability.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCapability(capability.id);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 数据规则定义 */}
      <Card>
        <CardHeader>
          <CardTitle>数据规则定义</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">设备姿态数据</h4>
              <p className="text-sm text-blue-700">
                包含位置、方向、速度等姿态信息的JSON格式定义
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  position, rotation, velocity
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">视频数据</h4>
              <p className="text-sm text-green-700">
                视频流、图像帧、元数据的标准化格式
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  stream, frame, metadata
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">GIS矢量数据</h4>
              <p className="text-sm text-purple-700">
                地理信息系统矢量数据的标准格式
              </p>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  coordinates, geometry, properties
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CapabilityConfig;
