'use client';

import PageContainer from '@/components/layout/page-container';
import OverViewPage from '@/features/overview/components/overview';
import { OverviewProvider } from '@/features/overview/context/overview-context';
import { TransactionProvider } from '@/features/transactions/context/TransactionContext';
import TransactionPage from '@/features/transactions/TransactionPage';
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
      <div className='flex flex-1 flex-col space-y-5'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Hi, Cloud Shop</h2>
        </div>

        <OverviewProvider>
          <OverViewPage />
        </OverviewProvider>

        <TransactionProvider>
          <div className='grid gap-4 md:grid-cols-1 lg:grid-cols-3'>
            <TransactionPage status='overdue' title='Trễ hạn' />
            <TransactionPage status='due' title='Đến hạn' />
            <TransactionPage status='upcoming' title='Sắp đến hạn' />
          </div>
        </TransactionProvider>

        {/* Future Placeholder */}
        {/* <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
        </div> */}
      </div>
    </PageContainer>
  );
}
