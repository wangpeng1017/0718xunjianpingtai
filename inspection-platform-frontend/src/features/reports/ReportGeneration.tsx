import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

function ReportGeneration() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">报告生成</h1>
        <p className="text-gray-600 mt-1">模板化文档和报告生成</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>报告生成管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">报告生成功能开发中...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportGeneration;
