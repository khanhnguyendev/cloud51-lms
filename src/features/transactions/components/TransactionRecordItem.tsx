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
  transaction: {
    id: string;
    customerName: string;
    amount: number;
    dueDate: string;
    status: string;
  };
}

const TransactionRecordItem: React.FC<TransactionRecordItemProps> = ({
  transaction
}) => {
  const { customerName, amount, dueDate, status } = transaction;

  const handleAction = (action: string) => {
    console.log(
      `Action "${action}" triggered for transaction ID: ${transaction.id}`
    );
    // Add logic for actions here
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{customerName}</CardTitle>
      </CardHeader>
      <CardContent className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-muted-foreground'>Due Date: {dueDate}</p>
          <p className='text-sm font-medium'>
            Amount:{' '}
            {amount.toLocaleString('vi-VN', {
              style: 'currency',
              currency: 'VND'
            })}
          </p>
          <p
            className={`text-sm ${status === 'overdue' ? 'text-red-500' : ''}`}
          >
            Status: {status}
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
      </CardContent>
    </Card>
  );
};

export default TransactionRecordItem;
