'use client';

import PageContainer from '@/components/layout/page-container';
import OverViewPage from '@/features/overview/components/overview';
import { OverviewProvider } from '@/features/overview/context/overview-context';
import React, { useEffect, useState } from 'react';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Hi, Cloud Shop</h2>
        </div>

        <OverviewProvider>
          <OverViewPage />
        </OverviewProvider>

        {/* Future Placeholder */}
        {/* <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
        </div> */}
      </div>
    </PageContainer>
  );
}
