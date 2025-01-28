import React from 'react';
import TransactionRecordItem from './TransactionRecordItem';

interface TransactionRecordListProps {
  transactions: {
    id: string;
    customerName: string;
    amount: number;
    dueDate: string;
    status: string;
  }[];
}

const TransactionRecordList: React.FC<TransactionRecordListProps> = ({
  transactions
}) => {
  return (
    <div className='space-y-4'>
      {transactions.map((transaction) => (
        <TransactionRecordItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
};

export default TransactionRecordList;
