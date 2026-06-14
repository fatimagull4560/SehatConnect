import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';

export interface Patient {
  id: string; mrn: string; name: string; nameUrdu?: string;
  phone: string; dob: string; gender: 'male' | 'female' | 'other';
  address: string; bloodGroup?: string; createdAt: string; updatedAt: string; synced: boolean;
}
export interface Appointment {
  id: string; patientId: string; patientName: string; doctorId: string; doctorName: string;
  date: string; time: string; token: number; status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  fee: number; notes?: string; createdAt: string; synced: boolean;
}
export interface Medicine {
  id: string; barcode?: string; name: string; generic: string; category: string;
  price: number; costPrice: number; stock: number; minStock: number;
  expiryDate: string; manufacturer: string; updatedAt: string; synced: boolean;
}
export interface Transaction {
  id: string; invoiceNo: string; patientId?: string; patientName?: string;
  type: 'consultation' | 'pharmacy' | 'lab' | 'other';
  items: TransactionItem[]; subtotal: number; tax: number; discount: number;
  total: number; paid: number; balance: number;
  paymentMethod: 'cash' | 'card' | 'split' | 'pending';
  status: 'paid' | 'partial' | 'pending' | 'refunded';
  createdAt: string; createdBy: string; synced: boolean;
}
export interface TransactionItem {
  id: string; name: string; quantity: number; unitPrice: number; total: number;
}
export interface Doctor {
  id: string; name: string; specialization: string; phone: string; email: string;
  fee: number; available: boolean; schedule: string[]; synced: boolean;
}
export interface LabTest {
  id: string; patientId: string; patientName: string; tests: string[];
  status: 'pending' | 'sample-collected' | 'processing' | 'completed';
  total: number; reportUrl?: string; createdAt: string; synced: boolean;
}

interface SehatDB extends DBSchema {
  patients: { key: string; value: Patient; indexes: { 'by-name': string; 'by-phone': string; 'by-synced': string } };
  appointments: { key: string; value: Appointment; indexes: { 'by-date': string; 'by-patient': string; 'by-synced': string } };
  medicines: { key: string; value: Medicine; indexes: { 'by-name': string; 'by-barcode': string } };
  transactions: { key: string; value: Transaction; indexes: { 'by-date': string; 'by-patient': string; 'by-synced': string } };
  doctors: { key: string; value: Doctor };
  labTests: { key: string; value: LabTest; indexes: { 'by-patient': string; 'by-synced': string } };
}

let dbInstance: IDBPDatabase<SehatDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<SehatDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<SehatDB>('sehat-connect-db', 1, {
    upgrade(db) {
      const ps = db.createObjectStore('patients', { keyPath: 'id' });
      ps.createIndex('by-name', 'name'); ps.createIndex('by-phone', 'phone'); ps.createIndex('by-synced', 'synced');
      const as = db.createObjectStore('appointments', { keyPath: 'id' });
      as.createIndex('by-date', 'date'); as.createIndex('by-patient', 'patientId'); as.createIndex('by-synced', 'synced');
      const ms = db.createObjectStore('medicines', { keyPath: 'id' });
      ms.createIndex('by-name', 'name'); ms.createIndex('by-barcode', 'barcode');
      const ts = db.createObjectStore('transactions', { keyPath: 'id' });
      ts.createIndex('by-date', 'createdAt'); ts.createIndex('by-patient', 'patientId'); ts.createIndex('by-synced', 'synced');
      db.createObjectStore('doctors', { keyPath: 'id' });
      const ls = db.createObjectStore('labTests', { keyPath: 'id' });
      ls.createIndex('by-patient', 'patientId'); ls.createIndex('by-synced', 'synced');
    },
  });
  return dbInstance;
}

export function generateId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }
export function generateMRN() { return `MRN-${Date.now().toString(36).toUpperCase()}`; }
export function generateInvoiceNo() {
  const d = new Date();
  return `INV-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
}
