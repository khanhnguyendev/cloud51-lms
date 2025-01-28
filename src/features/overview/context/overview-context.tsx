import React, { createContext, useContext, useEffect, useState } from 'react';

type OverviewData = {
  loading: boolean;
  totalLoans: number;
  currentlyLoaned: number;
  totalCollected: number;
  totalFee: number;
  totalContracts: { in_process: number; completed: number };
};

const OverviewContext = createContext<OverviewData | undefined>(undefined);

export const useOverviewData = () => {
  const context = useContext(OverviewContext);
  if (!context) {
    throw new Error('useOverviewData must be used within an OverviewProvider');
  }
  return context;
};

export const OverviewProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [loading, setLoading] = useState(true);
  const [totalLoans, setTotalLoans] = useState(0);
  const [currentlyLoaned, setCurrentlyLoaned] = useState(0);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalContracts, setTotalContracts] = useState({
    in_process: 0,
    completed: 0
  });
  const [totalFee, setTotalFee] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/v1/aggregate');
        const json = await response.json();
        const data = json.message;

        setTotalLoans(data.totalLoans || 0);
        setCurrentlyLoaned(data.currentlyLoaned || 0);
        setTotalCollected(data.totalCollected || 0);
        setTotalContracts(
          data.totalContracts || { in_process: 0, completed: 0 }
        );
        setTotalFee(data.totalFee || 0);
      } catch (error) {
        console.error('Failed to fetch aggregate data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <OverviewContext.Provider
      value={{
        loading,
        totalLoans,
        currentlyLoaned,
        totalCollected,
        totalFee,
        totalContracts
      }}
    >
      {children}
    </OverviewContext.Provider>
  );
};
