"use client";

import { useEffect, useState } from 'react';

interface AgreementOverviewData {
  total: number;
  active: number;
  pending: number;
}

export default function AgreementOverview({ data }: { data: AgreementOverviewData }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Agreement Overview</h2>
      <div className="flex border-b pb-4">
        <div className="flex-1 text-center border-r">
          <div className="text-4xl font-bold text-gray-900">
            {isClient ? data.total : "25"}
          </div>
          <div className="text-gray-600">Total</div>
        </div>
        <div className="flex-1 text-center border-r">
          <div className="text-4xl font-bold text-gray-900">
            {isClient ? data.active : "5"}
          </div>
          <div className="text-gray-600">Active</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-4xl font-bold text-gray-900">
            {isClient ? data.pending : "2"}
          </div>
          <div className="text-gray-600">Pending</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-gray-800 font-semibold">Agreements</div>
        <div className="text-4xl font-bold text-gray-900">
          {isClient ? data.total : "25"}
        </div>
      </div>
    </div>
  );
}