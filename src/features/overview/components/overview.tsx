import React from 'react';
import { useOverviewData } from '@/features/overview/context/overview-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function OverViewPage() {
  const {
    loading,
    totalLoans,
    currentlyLoaned,
    totalCollected,
    totalFee,
    totalContracts
  } = useOverviewData();

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
      {/* Total Loans */}
      <CardComponent
        title='Tổng cho vay'
        value={totalLoans}
        loading={loading}
        icon={
          <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
        }
      />

      {/* Currently Loaned */}
      <CardComponent
        title='Đang cho vay'
        value={currentlyLoaned}
        loading={loading}
        icon={<path d='M22 12h-4l-3 9L9 3l-3 9H2' />}
      />

      {/* Total Collected */}
      <CardComponent
        title='Đã thu'
        value={totalCollected}
        loading={loading}
        icon={
          <>
            <rect width='20' height='14' x='2' y='5' rx='2' />
            <path d='M2 10h20' />
          </>
        }
      />

      {/* Total Fee */}
      <CardComponent
        title='Tổng phí HĐ'
        value={totalFee}
        loading={loading}
        icon={
          <path d='M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' />
        }
      />

      {/* Total Contracts */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Số lượng HĐ</CardTitle>
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
        <CardContent className='flex flex-col space-y-1'>
          {loading ? (
            <Skeleton className='h-14 w-full' />
          ) : (
            <>
              <div className='flex items-center justify-between'>
                <div className='text-xs text-muted-foreground'>Đang thu</div>
                <div className='text-xl font-bold text-yellow-500'>
                  {totalContracts.in_process}
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <div className='text-xs text-muted-foreground'>
                  Đã hoàn thành
                </div>
                <div className='text-xl font-bold text-green-500'>
                  {totalContracts.completed}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type CardComponentProps = {
  title: string;
  value: number;
  loading: boolean;
  icon: React.ReactNode;
};

function CardComponent({ title, value, loading, icon }: CardComponentProps) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
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
          {icon}
        </svg>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className='h-10 w-full' />
        ) : (
          <div className='text-2xl font-bold'>
            {value.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND'
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
