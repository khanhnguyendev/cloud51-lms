import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { convertDateToDDMMYYYY } from '@/utils/date-util';

interface TransactionRecordItemProps {
  contract: {
    _id: string;
    contractCode: string;
    contractDate: string;
    customerName: string;
    customerPhone: string;
    transaction: {
      _id: string;
      amount: number;
      partialAmount: number;
      dueDate: string;
      status: string;
    };
  };
  status: 'overdue' | 'due' | 'upcoming';
}

const TransactionRecordItem: React.FC<TransactionRecordItemProps> = ({
  contract,
  status
}) => {
  const router = useRouter();

  const handleAction = (action: string) => {
    if (action === 'view') {
      router.push(`/dashboard/contract/${contract._id}`);
    }
    if (action === 'remind') {
      window.open(`https://zalo.me/${contract.customerPhone}`, '_blank');
    }
  };

  // Dynamically set status styles
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-red-500 bg-red-100';
      case 'due':
        return 'text-yellow-500 bg-yellow-100';
      case 'upcoming':
        return 'text-green-500 bg-green-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };

  const getTransactionStatusStyle = (status: string) => {
    switch (status) {
      case 'NOT_PAID':
        return 'text-red-500 bg-red-200';
      case 'PAID_ALL':
        return 'text-green-500 bg-green-100';
      case 'PARTIALLY_PAID':
        return 'text-blue-500 bg-blue-100';
      default:
    }
  };

  const convertTransactionStatus = (status: string) => {
    switch (status) {
      case 'NOT_PAID':
        return 'Chưa thanh toán';
      case 'PAID_ALL':
        return 'Đã thanh toán';
      case 'PARTIALLY_PAID':
        return 'Thanh toán một phần';
      default:
        return 'Chưa xác định';
    }
  };

  return (
    <Card className={`border ${getStatusStyle(status)} rounded-lg`}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center'>
            <span className='mr-2 text-xl'>{contract.contractCode}</span>
          </div>
          <span
            className={`rounded-lg px-2 py-1 text-xs font-semibold ${getTransactionStatusStyle(contract.transaction.status)}`}
          >
            {convertTransactionStatus(contract.transaction.status)}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className='flex items-center justify-between'>
        <div className='grid grid-cols-2 gap-x-10'>
          <div>
            <p className='text-md font-semibold text-gray-700'>Tên:</p>
            <p className='text-md font-semibold text-gray-700'>SĐT:</p>
            <p className='text-md font-semibold text-gray-700'>Ngày đến hạn:</p>
            <p className='text-md font-semibold text-gray-700'>
              Cần thanh toán:
            </p>
            <p className='text-md font-semibold text-gray-700'>
              Đã thanh toán:
            </p>
          </div>

          <div>
            <p className='text-base font-semibold text-gray-900'>
              {contract.customerName}
            </p>
            <p className='text-base font-semibold text-gray-900'>
              {contract.customerPhone}
            </p>
            <p className='text-base font-semibold text-gray-900'>
              {convertDateToDDMMYYYY(new Date(contract.transaction.dueDate))}
            </p>
            <p className='text-md font-semibold text-red-600'>
              {contract.transaction.amount.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND'
              })}
            </p>
            <p className='text-md font-semibold text-green-600'>
              {contract.transaction.partialAmount.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND'
              })}
            </p>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div className='ml-4'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='icon'>
                <MoreHorizontal className='h-6 w-6' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-40'>
              <DropdownMenuItem onClick={() => handleAction('view')}>
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleAction('remind')}
                className='text-red-500'
              >
                Nhắc hẹn
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionRecordItem;
