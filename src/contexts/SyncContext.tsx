import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncEngine } from '../lib/syncEngine';

interface SyncContextType {
  syncStatus: string; pendingCount: number; isOnline: boolean; triggerSync: () => void;
}

const SyncContext = createContext<SyncContextType>({ syncStatus: 'online', pendingCount: 0, isOnline: true, triggerSync: () => {} });

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [syncStatus, setSyncStatus] = useState(syncEngine.getStatus());
  const [pendingCount, setPendingCount] = useState(syncEngine.getPendingCount());

  useEffect(() => {
    return syncEngine.subscribe((status, count) => { setSyncStatus(status); setPendingCount(count); });
  }, []);

  return (
    <SyncContext.Provider value={{ syncStatus, pendingCount, isOnline: syncStatus !== 'offline', triggerSync: () => syncEngine.sync() }}>
      {children}
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
export const useSyncContext = useSync;
