import React from 'react';
import TransactionRecordItem from './TransactionRecordItem';

interface TransactionRecordListProps {
  contracts: {
    _id: string;
    contractDate: string;
    customerName: string;
    customerPhone: string;
    transaction: {
      _id: string;
      amount: number;
      dueDate: string;
      status: string;
    };
  }[];
}

const TransactionRecordList: React.FC<TransactionRecordListProps> = ({
  contracts
}) => {
  return (
    <div className='space-y-4'>
      {contracts.map((contract) => (
        <TransactionRecordItem
          key={contract.transaction._id}
          contract={contract}
        />
      ))}
    </div>
  );
};

export default TransactionRecordList;
