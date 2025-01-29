import React from 'react';
import TransactionRecordItem from './TransactionRecordItem';

interface TransactionRecordListProps {
  contracts: {
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
  }[];
  status: 'overdue' | 'due' | 'upcoming';
}

const TransactionRecordList: React.FC<TransactionRecordListProps> = ({
  contracts,
  status
}) => {
  return (
    <div className='max-h-[750px] space-y-4 overflow-y-auto'>
      {contracts.map((contract) => (
        <TransactionRecordItem
          key={contract.transaction._id}
          contract={contract}
          status={status}
        />
      ))}
    </div>
  );
};

export default TransactionRecordList;
