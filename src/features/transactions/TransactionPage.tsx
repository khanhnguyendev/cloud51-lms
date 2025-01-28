import React, { useEffect } from 'react';
import { useTransactionData } from './context/TransactionContext';
import TransactionRecordList from './components/TransactionRecordList';

interface TransactionPageProps {
  status: string;
  title: string;
}

const TransactionPage: React.FC<TransactionPageProps> = ({ status, title }) => {
  const { transactions, loading, fetchTransactions } = useTransactionData();

  useEffect(() => {
    fetchTransactions(status);
  }, [status, fetchTransactions]);

  return (
    <div className='card w-full rounded-lg p-4 shadow-md'>
      <h2 className='mb-4 text-2xl font-bold'>{title}</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <TransactionRecordList transactions={transactions} />
      )}
    </div>
  );
};

export default TransactionPage;
