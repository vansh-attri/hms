'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Branch = 'hodal' | 'palwal' | null;

interface BranchContextType {
  branch: Branch;
  setBranch: (branch: Branch) => void;
  branchLabel: string;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [branch, setBranchState] = useState<Branch>(null);

  useEffect(() => {
    const stored = localStorage.getItem('hms_branch') as Branch;
    if (stored === 'hodal' || stored === 'palwal') {
      setBranchState(stored);
    }
  }, []);

  const setBranch = (newBranch: Branch) => {
    setBranchState(newBranch);
    if (newBranch) {
      localStorage.setItem('hms_branch', newBranch);
    } else {
      localStorage.removeItem('hms_branch');
    }
  };

  const branchLabel = branch === 'hodal' ? 'Hodal' : branch === 'palwal' ? 'Palwal' : '';

  return (
    <BranchContext.Provider value={{ branch, setBranch, branchLabel }}>
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
}

export default BranchContext;
