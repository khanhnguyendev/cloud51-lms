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

interface TransactionRecordItemProps {
  contract: {
    _id: string;
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
  const { contractDate, customerName, customerPhone, transaction } = contract;

  const handleAction = (action: string) => {
    console.log(
      `Action "${action}" triggered for transaction ID: ${transaction._id}`
    );
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
        return 'text-gray-500 bg-gray-100';
      case 'PAID_ALL':
        return 'text-green-500 bg-green-100';
      case 'PARTIALLY_PAID':
        return 'text-blue-500 bg-blue-100';
      default:
    }
  };

  return (
    <Card className={`border ${getStatusStyle(status)} rounded-lg`}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          {customerName} - {customerPhone}
          <span
            className={`rounded-lg px-2 py-1 text-xs font-semibold ${getTransactionStatusStyle(
              transaction.status
            )}`}
          >
            {transaction.status.toUpperCase()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium'>Contract Date: {contractDate}</p>
          <p className='text-sm font-medium'>Due Date: {transaction.dueDate}</p>
          <p className='text-sm font-medium'>
            Amount:{' '}
            {transaction.amount.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND'
            })}
          </p>
          <p className='text-sm font-medium'>
            Partial Amount:{' '}
            {transaction.partialAmount.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND'
            })}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon'>
              <MoreHorizontal className='h-5 w-5' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-40'>
            <DropdownMenuItem onClick={() => handleAction('view')}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAction('remind')}
              className='text-red-500'
            >
              Send Reminder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
};

export default TransactionRecordItem;
