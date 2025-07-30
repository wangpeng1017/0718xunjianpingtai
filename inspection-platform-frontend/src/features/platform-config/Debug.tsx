import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

function Debug() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">能力调试</h1>
        <p className="text-gray-600 mt-1">可视化调试界面和工具</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>能力调试工具</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">能力调试功能开发中...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Debug;
