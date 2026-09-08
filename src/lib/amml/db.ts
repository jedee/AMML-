import { db, auth } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, limit, orderBy } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface PersistentTelemetryLog {
  id?: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'CRITICAL';
  module: string;
  message: string;
  signature?: string;
  nodeId?: string;
  latencyMs?: number;
  bandwidthKbps?: number;
}

const COLLECTION_NAME = 'telemetry_logs';

/**
 * Saves a single telemetry log to Firestore for persistent review
 */
export async function saveTelemetryLogToDb(log: Omit<PersistentTelemetryLog, 'id'>): Promise<string> {
  // If the user isn't logged in, log warning/info and silently gracefully return to protect execution
  // First check if they are signed in so we don't violate Firestore security rules
  if (!auth.currentUser) {
    console.info("Telemetry log Firestore logging deferred: User is not authenticated.");
    return "deferred-unauthenticated";
  }

  const path = COLLECTION_NAME;
  try {
    const docRef = await addDoc(collection(db, path), {
      ...log,
      timestamp: log.timestamp || new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Retrieves lists of persistent telemetry logs for post-incident review
 */
export async function fetchTelemetryLogsFromDb(limitCount: number = 50): Promise<PersistentTelemetryLog[]> {
  if (!auth.currentUser) {
    console.info("Cannot fetch telemetry logs: User is not authenticated.");
    return [];
  }

  const path = COLLECTION_NAME;
  try {
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    const logs: PersistentTelemetryLog[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      logs.push({
        id: docSnap.id,
        timestamp: data.timestamp,
        type: data.type,
        module: data.module,
        message: data.message,
        signature: data.signature,
        nodeId: data.nodeId,
        latencyMs: data.latencyMs,
        bandwidthKbps: data.bandwidthKbps,
      } as PersistentTelemetryLog);
    });
    return logs;
  } catch (error) {
    // If it fails (e.g. index is building or permissions fail), return an empty array or throw
    console.warn("Could not query sorted telemetry, falling back to unsorted fetch...", error);
    try {
      const snapshot = await getDocs(collection(db, path));
      const logs: PersistentTelemetryLog[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        logs.push({
          id: docSnap.id,
          timestamp: data.timestamp,
          type: data.type,
          module: data.module,
          message: data.message,
          signature: data.signature,
          nodeId: data.nodeId,
          latencyMs: data.latencyMs,
          bandwidthKbps: data.bandwidthKbps,
        } as PersistentTelemetryLog);
      });
      return logs;
    } catch (fallbackError) {
      if (!auth.currentUser) return [];
      return handleFirestoreError(fallbackError, OperationType.LIST, path);
    }
  }
}

/**
 * Deletes/Flushes logs out of database
 */
export async function clearTelemetryLogsFromDb(): Promise<void> {
  if (!auth.currentUser) {
    console.info("Cannot clear telemetry logs: User is not authenticated.");
    return;
  }

  const path = COLLECTION_NAME;
  try {
    const snapshot = await getDocs(collection(db, path));
    const deletePromises = snapshot.docs.map((docSnap) => 
      deleteDoc(doc(db, path, docSnap.id))
    );
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
