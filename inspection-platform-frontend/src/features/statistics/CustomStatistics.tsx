import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

function CustomStatistics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">定制统计</h1>
        <p className="text-gray-600 mt-1">定制化统计分析和图表</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>定制统计分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">定制统计功能开发中...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CustomStatistics;
