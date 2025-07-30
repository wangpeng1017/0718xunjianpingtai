import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

function TempTasks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">临时任务</h1>
        <p className="text-gray-600 mt-1">创建和管理临时巡检任务</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>临时任务管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">临时任务功能开发中...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TempTasks;
