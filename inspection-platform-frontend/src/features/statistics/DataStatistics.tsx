import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

function DataStatistics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">数据统计</h1>
        <p className="text-gray-600 mt-1">多维度数据分析和统计</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>数据统计分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">数据统计功能开发中...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default DataStatistics;
