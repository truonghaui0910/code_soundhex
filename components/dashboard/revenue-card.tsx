"use client";

import { useEffect, useState } from 'react';

interface RevenueData {
  monthly: number;
  daily: number;
}

export default function RevenueCard({ initialData }: { initialData: RevenueData }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Revenue</h2>
      <div className="space-y-4">
        <div>
          <div className="text-4xl font-bold text-gray-900">
            {isClient ? `$${initialData.monthly.toLocaleString()}` : "$2,000"}
          </div>
          <div className="text-gray-600">This Month</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-700">
            {isClient ? `$${initialData.daily.toLocaleString()}` : "$150"}
          </div>
        </div>
      </div>
    </div>
  );
}