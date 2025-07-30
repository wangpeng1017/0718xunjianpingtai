import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

function Exceptions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">异常处理</h1>
        <p className="text-gray-600 mt-1">异常监控和处理管理</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>异常处理管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">异常处理功能开发中...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Exceptions;
