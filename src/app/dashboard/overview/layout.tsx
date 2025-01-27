'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [totalLoans, setTotalLoans] = useState({
    all: 0,
    current: 0,
    previous: 0,
    change: 0
  });
  const [currentlyLoaned, setCurrentlyLoaned] = useState({ current: 0 });
  const [totalCollected, setTotalCollected] = useState({
    all: 0,
    current: 0,
    previous: 0,
    change: 0
  });
  const [totalContracts, setTotalContracts] = useState({
    current: 0,
    previous: 0,
    change: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/v1/aggregate');
        const json = await response.json();
        const data = json.message;

        setTotalLoans({
          all: data.totalLoans.all || 0,
          previous: data.totalLoans.previous || 0,
          current: data.totalLoans.current || 0,
          change: data.totalLoans.change || 0
        });
        setCurrentlyLoaned({
          current: data.currentlyLoaned.current || 0
        });
        setTotalCollected({
          all: data.totalCollected.all || 0,
          current: data.totalCollected.current || 0,
          previous: data.totalCollected.previous || 0,
          change: data.totalCollected.change || 0
        });
        setTotalContracts({
          current: data.totalContracts.current || 0,
          previous: data.totalContracts.previous || 0,
          change: data.totalContracts.change || 0
        });
      } catch (error) {
        console.error('Failed to fetch aggregate data:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Hi, Cloud Shop</h2>
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {/* Card for Total Loans */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Tổng cho vay
              </CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalLoans.all.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                })}
              </div>
              <p className='text-xs text-muted-foreground'>
                {totalLoans.change >= 0 ? '+' : ''}
                {totalLoans.change.toFixed(1)}% so với tháng trước (
                {totalLoans.previous.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                })}
                )
              </p>
            </CardContent>
          </Card>

          {/* Card for Currently Loaned */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Đang cho vay
              </CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {currentlyLoaned.current.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                })}
              </div>
            </CardContent>
          </Card>

          {/* Card for Total Collected */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Đã thu</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <rect width='20' height='14' x='2' y='5' rx='2' />
                <path d='M2 10h20' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalCollected.all.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                })}
              </div>
              <p className='text-xs text-muted-foreground'>
                {totalCollected.change >= 0 ? '+' : ''}
                {totalCollected.change.toFixed(1)}% so với tháng trước (
                {totalCollected.previous.toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                })}
                )
              </p>
            </CardContent>
          </Card>

          {/* Card for Total Contracts */}
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Số lượng KH</CardTitle>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                className='h-4 w-4 text-muted-foreground'
              >
                <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                <circle cx='9' cy='7' r='4' />
                <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
              </svg>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {totalContracts.current.toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground'>
                {totalContracts.change >= 0 ? '+' : ''}
                {totalContracts.change.toFixed(1)}% so với tháng trước (
                {totalContracts.previous.toLocaleString()})
              </p>
            </CardContent>
          </Card>
        </div>{' '}
        {/* <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
        </div> */}
      </div>
    </PageContainer>
  );
}
