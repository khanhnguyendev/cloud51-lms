import React from 'react';
import { useTransactionData } from './context/TransactionContext';
import TransactionRecordList from './components/TransactionRecordList';
import FormCardSkeleton from '@/components/form-card-skeleton';

interface TransactionPageProps {
  status: 'overdue' | 'due' | 'upcoming';
  title: string;
}

const TransactionPage: React.FC<TransactionPageProps> = ({ status, title }) => {
  const { contracts, loading } = useTransactionData();

  return (
    <div className='card w-full rounded-lg p-4 shadow-md'>
      <h2 className='mb-4 text-2xl font-bold'>{title}</h2>
      {loading ? (
        <FormCardSkeleton />
      ) : (
        <TransactionRecordList contracts={contracts[status]} />
      )}
    </div>
  );
};

export default TransactionPage;
