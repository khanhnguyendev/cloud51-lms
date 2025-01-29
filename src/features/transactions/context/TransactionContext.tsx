import React, { createContext, useContext, useState, useEffect } from 'react';

interface TransactionsResponse {
  overdue: Contract[];
  due: Contract[];
  upcoming: Contract[];
}

interface Contract {
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
}

interface TransactionContextType {
  contracts: TransactionsResponse;
  loading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const useTransactionData = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      'useTransactionData must be used within a TransactionProvider'
    );
  }
  return context;
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [contracts, setContracts] = useState<TransactionsResponse>({
    overdue: [],
    due: [],
    upcoming: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const response = await fetch('/api/v1/transactions');
        const json = await response.json();
        const data: TransactionsResponse = json.message;
        setContracts(data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  return (
    <TransactionContext.Provider value={{ contracts, loading }}>
      {children}
    </TransactionContext.Provider>
  );
};
