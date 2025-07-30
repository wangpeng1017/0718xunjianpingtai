import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

function PlanningTargets() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">巡检目标</h1>
        <p className="text-gray-600 mt-1">设置和管理巡检目标</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>巡检目标管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">巡检目标功能开发中...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlanningTargets;
