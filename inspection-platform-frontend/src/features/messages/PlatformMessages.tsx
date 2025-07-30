import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Bell,
  Mail,
  MessageSquare,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Send,
  Users,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 消息类型定义
interface PlatformMessage {
  id: string;
  title: string;
  content: string;
  type: 'notification' | 'alert' | 'warning' | 'info' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'system' | 'task' | 'device' | 'maintenance' | 'security' | 'user';
  status: 'unread' | 'read' | 'archived' | 'deleted';
  sender: {
    id: string;
    name: string;
    type: 'system' | 'user' | 'device';
  };
  recipients: {
    id: string;
    name: string;
    type: 'user' | 'group' | 'role';
    readAt?: string;
  }[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  actions?: {
    id: string;
    label: string;
    type: 'primary' | 'secondary' | 'danger';
    url?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  readCount: number;
  totalRecipients: number;
}

// Mock数据
const mockMessages: PlatformMessage[] = [
  {
    id: 'msg-1',
    title: '主变压器A1温度异常警报',
    content: '主变压器A1在巡检过程中检测到温度异常，当前温度85°C，超出正常运行范围。建议立即停机检查冷却系统。',
    type: 'alert',
    priority: 'urgent',
    category: 'device',
    status: 'unread',
    sender: {
      id: 'device-1',
      name: '巡检无人机-01',
      type: 'device'
    },
    recipients: [
      { id: 'user-1', name: '张工程师', type: 'user' },
      { id: 'user-2', name: '李主管', type: 'user' },
      { id: 'group-1', name: '运维组', type: 'group' }
    ],
    actions: [
      { id: 'action-1', label: '查看详情', type: 'primary', url: '/tasks/tracking' },
      { id: 'action-2', label: '紧急停机', type: 'danger' }
    ],
    createdAt: '2024-07-17T09:15:00Z',
    updatedAt: '2024-07-17T09:15:00Z',
    expiresAt: '2024-07-18T09:15:00Z',
    readCount: 0,
    totalRecipients: 3
  },
  {
    id: 'msg-2',
    title: '系统维护通知',
    content: '系统将于今晚22:00-24:00进行例行维护，期间可能影响部分功能使用。请提前安排相关工作。',
    type: 'info',
    priority: 'medium',
    category: 'system',
    status: 'read',
    sender: {
      id: 'system',
      name: '系统管理员',
      type: 'system'
    },
    recipients: [
      { id: 'role-1', name: '所有用户', type: 'role', readAt: '2024-07-17T08:30:00Z' }
    ],
    createdAt: '2024-07-17T08:00:00Z',
    updatedAt: '2024-07-17T08:00:00Z',
    readCount: 15,
    totalRecipients: 15
  },
  {
    id: 'msg-3',
    title: '巡检任务完成通知',
    content: '东区巡检路径检查任务已成功完成，未发现异常情况。详细报告已生成，请查看。',
    type: 'success',
    priority: 'low',
    category: 'task',
    status: 'read',
    sender: {
      id: 'device-3',
      name: '安防机器人-03',
      type: 'device'
    },
    recipients: [
      { id: 'user-3', name: '刘维护员', type: 'user', readAt: '2024-07-17T07:05:00Z' },
      { id: 'user-2', name: '李主管', type: 'user', readAt: '2024-07-17T07:10:00Z' }
    ],
    actions: [
      { id: 'action-3', label: '查看报告', type: 'primary', url: '/reports' }
    ],
    createdAt: '2024-07-17T07:00:00Z',
    updatedAt: '2024-07-17T07:00:00Z',
    readCount: 2,
    totalRecipients: 2
  },
  {
    id: 'msg-4',
    title: '设备维护提醒',
    content: '巡检机器人-02已连续运行30天，建议安排例行维护检查。',
    type: 'warning',
    priority: 'medium',
    category: 'maintenance',
    status: 'unread',
    sender: {
      id: 'system',
      name: '维护管理系统',
      type: 'system'
    },
    recipients: [
      { id: 'user-4', name: '王技术员', type: 'user' },
      { id: 'group-2', name: '维护组', type: 'group' }
    ],
    actions: [
      { id: 'action-4', label: '安排维护', type: 'primary' },
      { id: 'action-5', label: '延期提醒', type: 'secondary' }
    ],
    createdAt: '2024-07-17T06:00:00Z',
    updatedAt: '2024-07-17T06:00:00Z',
    readCount: 0,
    totalRecipients: 2
  }
];

// 消息表单组件
interface MessageFormProps {
  message?: PlatformMessage;
  onSubmit: (message: Partial<PlatformMessage>) => void;
  onCancel: () => void;
}

function MessageForm({ message, onSubmit, onCancel }: MessageFormProps) {
  const [formData, setFormData] = useState({
    title: message?.title || '',
    content: message?.content || '',
    type: message?.type || 'info',
    priority: message?.priority || 'medium',
    category: message?.category || 'system',
    recipients: message?.recipients?.map(r => r.name).join(', ') || '',
    expiresAt: message?.expiresAt?.split('T')[0] || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const messageTypes = [
    { value: 'notification', label: '通知' },
    { value: 'alert', label: '警报' },
    { value: 'warning', label: '警告' },
    { value: 'info', label: '信息' },
    { value: 'success', label: '成功' },
    { value: 'error', label: '错误' }
  ];

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'urgent', label: '紧急' }
  ];

  const categoryOptions = [
    { value: 'system', label: '系统' },
    { value: 'task', label: '任务' },
    { value: 'device', label: '设备' },
    { value: 'maintenance', label: '维护' },
    { value: 'security', label: '安全' },
    { value: 'user', label: '用户' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '消息标题不能为空';
    }
    if (!formData.content.trim()) {
      newErrors.content = '消息内容不能为空';
    }
    if (!formData.recipients.trim()) {
      newErrors.recipients = '接收人不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const messageData: Partial<PlatformMessage> = {
      ...formData,
      sender: message?.sender || { id: 'current-user', name: '当前用户', type: 'user' },
      recipients: formData.recipients.split(',').map(name => ({
        id: `user-${Date.now()}`,
        name: name.trim(),
        type: 'user' as const
      })),
      status: 'unread',
      readCount: 0,
      totalRecipients: formData.recipients.split(',').length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt + 'T23:59:59').toISOString() : undefined
    };

    if (message) {
      messageData.id = message.id;
    } else {
      messageData.id = `msg-${Date.now()}`;
    }

    onSubmit(messageData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="消息标题" required error={errors.title}>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="请输入消息标题"
          />
        </FormField>

        <FormField label="消息类型">
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as PlatformMessage['type'] })}
            options={messageTypes}
          />
        </FormField>

        <FormField label="优先级">
          <Select
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as PlatformMessage['priority'] })}
            options={priorityOptions}
          />
        </FormField>

        <FormField label="消息分类">
          <Select
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as PlatformMessage['category'] })}
            options={categoryOptions}
          />
        </FormField>

        <FormField label="过期时间">
          <Input
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
          />
        </FormField>
      </div>

      <FormField label="消息内容" required error={errors.content}>
        <TextArea
          value={formData.content}
          onChange={(value) => setFormData({ ...formData, content: value })}
          placeholder="请输入消息内容"
          rows={4}
        />
      </FormField>

      <FormField label="接收人" required error={errors.recipients}>
        <Input
          value={formData.recipients}
          onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
          placeholder="请输入接收人，用逗号分隔"
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          <Send className="h-4 w-4 mr-2" />
          {message ? '更新' : '发送'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function PlatformMessages() {
  const [messages, setMessages] = useState<PlatformMessage[]>(mockMessages);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<PlatformMessage | null>(null);
  
  // 模态框状态
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 筛选消息
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || message.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || message.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  // 事件处理函数
  const handleSendMessage = (messageData: Partial<PlatformMessage>) => {
    setMessages([messageData as PlatformMessage, ...messages]);
    setShowSendModal(false);
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: 'read', readCount: msg.readCount + 1 }
        : msg
    ));
  };

  const handleDeleteMessage = () => {
    if (selectedMessage?.id) {
      setMessages(messages.filter(msg => msg.id !== selectedMessage.id));
      setShowDeleteModal(false);
      setSelectedMessage(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      case 'success': return CheckCircle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'alert': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'success': return 'text-green-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      system: '系统',
      task: '任务',
      device: '设备',
      maintenance: '维护',
      security: '安全',
      user: '用户'
    };
    return categoryMap[category] || category;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">平台消息</h1>
        <p className="text-gray-600 mt-1">管理系统通知和消息推送</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">消息总数</p>
                <p className="text-2xl font-bold">{messages.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">未读消息</p>
                <p className="text-2xl font-bold text-red-600">
                  {messages.filter(m => m.status === 'unread').length}
                </p>
              </div>
              <Mail className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">紧急消息</p>
                <p className="text-2xl font-bold text-orange-600">
                  {messages.filter(m => m.priority === 'urgent').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">系统通知</p>
                <p className="text-2xl font-bold text-purple-600">
                  {messages.filter(m => m.category === 'system').length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>消息列表</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                设置
              </Button>
              <Button onClick={() => setShowSendModal(true)}>
                <Send className="h-4 w-4 mr-2" />
                发送消息
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索消息标题或内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'notification', label: '通知' },
                { value: 'alert', label: '警报' },
                { value: 'warning', label: '警告' },
                { value: 'info', label: '信息' },
                { value: 'success', label: '成功' },
                { value: 'error', label: '错误' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'unread', label: '未读' },
                { value: 'read', label: '已读' },
                { value: 'archived', label: '已归档' }
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'all', label: '全部优先级' },
                { value: 'urgent', label: '紧急' },
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' }
              ]}
            />
          </div>

          {/* 消息表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>消息信息</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>发送者</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>阅读情况</TableHead>
                <TableHead>发送时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => {
                const TypeIcon = getTypeIcon(message.type);
                return (
                  <TableRow
                    key={message.id}
                    className={message.status === 'unread' ? 'bg-blue-50' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <TypeIcon className={`h-5 w-5 ${getTypeColor(message.type)}`} />
                        <div>
                          <div className="font-medium flex items-center">
                            {message.title}
                            {message.status === 'unread' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        message.type === 'alert' ? 'bg-red-100 text-red-800' :
                        message.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        message.type === 'success' ? 'bg-green-100 text-green-800' :
                        message.type === 'error' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {message.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        {getCategoryLabel(message.category)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{message.sender.name}</div>
                        <div className="text-gray-500">{message.sender.type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={message.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{message.readCount}/{message.totalRecipients}</div>
                        <div className="text-gray-500">
                          {((message.readCount / message.totalRecipients) * 100).toFixed(0)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatRelativeTime(message.createdAt)}</div>
                        {message.expiresAt && (
                          <div className="text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            过期: {formatRelativeTime(message.expiresAt)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowDetailModal(true);
                            if (message.status === 'unread') {
                              handleMarkAsRead(message.id);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {message.status === 'unread' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(message.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 发送消息模态框 */}
      <Modal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        title="发送消息"
        size="lg"
      >
        <MessageForm
          onSubmit={handleSendMessage}
          onCancel={() => setShowSendModal(false)}
        />
      </Modal>

      {/* 消息详情模态框 */}
      {selectedMessage && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedMessage(null);
          }}
          title="消息详情"
          size="lg"
        >
          <div className="space-y-4">
            {/* 消息头部 */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{selectedMessage.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedMessage.priority)}`}>
                    {selectedMessage.priority}
                  </span>
                  <StatusBadge status={selectedMessage.status} />
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div>发送者: {selectedMessage.sender.name}</div>
                <div>分类: {getCategoryLabel(selectedMessage.category)}</div>
                <div>发送时间: {formatRelativeTime(selectedMessage.createdAt)}</div>
              </div>
            </div>

            {/* 消息内容 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">消息内容</h4>
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                {selectedMessage.content}
              </div>
            </div>

            {/* 接收人 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">接收人</h4>
              <div className="space-y-2">
                {selectedMessage.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{recipient.name}</span>
                      <span className="text-xs text-gray-500">({recipient.type})</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {recipient.readAt ? `已读 ${formatRelativeTime(recipient.readAt)}` : '未读'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 操作按钮 */}
            {selectedMessage.actions && selectedMessage.actions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">相关操作</h4>
                <div className="flex space-x-2">
                  {selectedMessage.actions.map((action) => (
                    <Button
                      key={action.id}
                      variant={action.type === 'primary' ? 'default' : action.type === 'danger' ? 'outline' : 'outline'}
                      size="sm"
                      className={action.type === 'danger' ? 'text-red-600 hover:text-red-700' : ''}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 附件 */}
            {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">附件</h4>
                <div className="space-y-2">
                  {selectedMessage.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center space-x-3 p-2 border rounded">
                      <div className="text-sm font-medium">{attachment.name}</div>
                      <Button variant="ghost" size="sm">
                        下载
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            {selectedMessage.status === 'unread' && (
              <Button onClick={() => handleMarkAsRead(selectedMessage.id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                标记已读
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMessage(null);
        }}
        onConfirm={handleDeleteMessage}
        title="删除消息"
        message={`确定要删除消息 "${selectedMessage?.title}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default PlatformMessages;
