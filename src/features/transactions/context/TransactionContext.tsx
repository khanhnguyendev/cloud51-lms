import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

interface TransactionContextType {
  transactions: any[];
  loading: boolean;
  fetchTransactions: (status: string) => void;
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
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/transactions/?status=${status}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await response.json();
      const data = json.message;
      setTransactions(data || []);
    } catch (error) {
      console.error(
        `Failed to fetch transactions for status "${status}":`,
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <TransactionContext.Provider
      value={{ transactions, loading, fetchTransactions }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
