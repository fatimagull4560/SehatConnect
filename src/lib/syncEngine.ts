import { getDB } from './db';
import { supabase } from './supabase';

type SyncStatus = 'online' | 'offline' | 'syncing' | 'error';
type SyncListener = (status: SyncStatus, pendingCount: number) => void;

class SyncEngine {
  private status: SyncStatus = navigator.onLine ? 'online' : 'offline';
  private listeners: SyncListener[] = [];
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private pendingCount = 0;

  constructor() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
    this.startPeriodicSync();
    this.checkPendingCount();
  }

  private handleOnline() { this.status = 'online'; this.notifyListeners(); this.sync(); }
  private handleOffline() { this.status = 'offline'; this.notifyListeners(); }
  private notifyListeners() { this.listeners.forEach(l => l(this.status, this.pendingCount)); }

  subscribe(listener: SyncListener) {
    this.listeners.push(listener);
    listener(this.status, this.pendingCount);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  getStatus() { return this.status; }
  getPendingCount() { return this.pendingCount; }

  private async checkPendingCount() {
    try {
      const db = await getDB();
      const [p, a, t, l] = await Promise.all([
        db.getAllFromIndex('patients', 'by-synced', 'false'),
        db.getAllFromIndex('appointments', 'by-synced', 'false'),
        db.getAllFromIndex('transactions', 'by-synced', 'false'),
        db.getAllFromIndex('labTests', 'by-synced', 'false'),
      ]);
      this.pendingCount = p.length + a.length + t.length + l.length;
      this.notifyListeners();
    } catch { /* ignore */ }
  }

  async sync() {
    if (!navigator.onLine || this.status === 'syncing') return;
    this.status = 'syncing'; this.notifyListeners();
    try {
      const db = await getDB();
      await this.syncStore('patients', db);
      await this.syncStore('appointments', db);
      await this.syncStore('transactions', db);
      await this.syncStore('labTests', db);
      await this.checkPendingCount();
      this.status = 'online';
    } catch { this.status = 'error'; }
    this.notifyListeners();
  }

  private async syncStore(storeName: 'patients' | 'appointments' | 'transactions' | 'labTests', db: Awaited<ReturnType<typeof getDB>>) {
    try {
      const items = await db.getAllFromIndex(storeName, 'by-synced', 'false');
      if (!items.length) return;
      const { error } = await supabase.from(storeName).upsert(items as never[]);
      if (!error) {
        const tx = db.transaction(storeName, 'readwrite');
        await Promise.all(items.map(item => tx.store.put({ ...item, synced: true } as never)));
        await tx.done;
      }
    } catch { /* ignore */ }
  }

  private startPeriodicSync() {
    this.syncInterval = setInterval(() => { if (navigator.onLine) this.sync(); }, 30000);
  }

  destroy() { if (this.syncInterval) clearInterval(this.syncInterval); }
}

export const syncEngine = new SyncEngine();
