import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  AmmlMarket, AmmlStaff, AmmlDevice, AmmlAttendance, AmmlUser, 
  AmmlActivityLog, AmmlSettings, AmmlAsset, AmmlAssetStock, 
  AmmlPurchaseOrder, AmmlLeave 
} from './types';
import { 
  seedMarkets, seedStaff, seedDevices, generateSeedAttendance, 
  seedUsers, seedActivityLogs, calcDur, seedAssets, seedAssetStocks, 
  seedPurchaseOrders, seedLeaves 
} from './mock';
import { 
  db, auth, getAuthBearerToken, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signInWithPopup, googleProvider, 
  signOut, onAuthStateChanged, FirebaseUser 
} from './firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, onSnapshot, 
  getDocFromServer, deleteDoc 
} from 'firebase/firestore';

interface AmmlContextProps {
  markets: AmmlMarket[];
  setMarkets: React.Dispatch<React.SetStateAction<AmmlMarket[]>>;
  staff: AmmlStaff[];
  setStaff: React.Dispatch<React.SetStateAction<AmmlStaff[]>>;
  devices: AmmlDevice[];
  setDevices: React.Dispatch<React.SetStateAction<AmmlDevice[]>>;
  att: AmmlAttendance[];
  setAtt: React.Dispatch<React.SetStateAction<AmmlAttendance[]>>;
  users: AmmlUser[];
  setUsers: React.Dispatch<React.SetStateAction<AmmlUser[]>>;
  activityLog: AmmlActivityLog[];
  setActivityLog: React.Dispatch<React.SetStateAction<AmmlActivityLog[]>>;
  settings: AmmlSettings;
  setSettings: React.Dispatch<React.SetStateAction<AmmlSettings>>;
  
  // Real Firebase Authentication & Role Session
  session: AmmlUser | null;
  setSession: React.Dispatch<React.SetStateAction<AmmlUser | null>>;
  firebaseUser: FirebaseUser | null;
  isAuthReady: boolean;
  
  // Asset Inventory management system
  assets: AmmlAsset[];
  setAssets: React.Dispatch<React.SetStateAction<AmmlAsset[]>>;
  assetStocks: AmmlAssetStock[];
  setAssetStocks: React.Dispatch<React.SetStateAction<AmmlAssetStock[]>>;
  purchaseOrders: AmmlPurchaseOrder[];
  setPurchaseOrders: React.Dispatch<React.SetStateAction<AmmlPurchaseOrder[]>>;

  // Leave system
  leaves: AmmlLeave[];
  setLeaves: React.Dispatch<React.SetStateAction<AmmlLeave[]>>;
  
  // Navigation / Filter States
  activePage: string;
  setActivePage: (page: string) => void;
  mktFilter: string;
  setMktFilter: (mkt: string) => void;
  
  // Simulation / Heartbeat
  isPulseActive: boolean;
  setIsPulseActive: (val: boolean) => void;
  toast: AmmlAttendance | null;
  setToast: (toast: AmmlAttendance | null) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  
  // Real Authentication Actions
  handleLogin: (email: string, pass: string) => Promise<boolean>;
  handleGoogleLogin: () => Promise<boolean>;
  handleSignUp: (name: string, email: string, pass: string, level?: AmmlUser['level'], market?: string) => Promise<boolean>;
  handleLoginSim: (email: string, level: string, pass?: string) => Promise<boolean>;
  handleLogout: () => Promise<void>;

  // Operations
  auditLog: (type: string, action: string, details: string) => void;
  saveAttSettings: (s: Partial<AmmlSettings>) => void;
  savePaySettings: (s: Partial<AmmlSettings>) => void;
  clockInOut: (staffId: string, market: string, deviceName: string, action: 'In' | 'Out', timeStr?: string, dateStr?: string, isDemo?: boolean) => boolean;
  bulkClockIn: (staffIds: string[], market: string) => number;
  triggerSimulateScan: (staffId: string) => void;
  dbClear: () => void;
}

const AmmlContext = createContext<AmmlContextProps | undefined>(undefined);

const PREF_STORAGE_KEY = 'amml_ui_preferences_v1';

export const AmmlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge any legacy credentials from localStorage to satisfy security requirements
  useEffect(() => {
    try {
      localStorage.removeItem('amml_mmis_v2');
      localStorage.removeItem('amml_mmis_state');
    } catch {
      // ignore
    }
  }, []);

  // Load non-sensitive UI preferences only
  const loadPreferences = () => {
    try {
      const raw = localStorage.getItem(PREF_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Preferences parse notice:", e);
    }
    return null;
  };

  const savedPrefs = loadPreferences();

  // Authentication State
  const [session, setSession] = useState<AmmlUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  // Operational State
  const [markets, setMarkets] = useState<AmmlMarket[]>(seedMarkets);
  const [assets, setAssets] = useState<AmmlAsset[]>(seedAssets);
  const [assetStocks, setAssetStocks] = useState<AmmlAssetStock[]>(seedAssetStocks);
  const [purchaseOrders, setPurchaseOrders] = useState<AmmlPurchaseOrder[]>(seedPurchaseOrders);
  const [leaves, setLeaves] = useState<AmmlLeave[]>(seedLeaves);
  const [staff, setStaff] = useState<AmmlStaff[]>(seedStaff);
  const [devices, setDevices] = useState<AmmlDevice[]>(seedDevices);
  const [att, setAtt] = useState<AmmlAttendance[]>(generateSeedAttendance);
  const [users, setUsers] = useState<AmmlUser[]>(seedUsers);
  const [activityLog, setActivityLog] = useState<AmmlActivityLog[]>(seedActivityLogs);

  const [settings, setSettings] = useState<AmmlSettings>(savedPrefs?.settings || {
    startTime: '08:00',
    endTime: '17:00',
    lateMinutes: 15,
    minHours: 7,
    dailyRate: 5000,
    lateDeduction: 500,
    absentDeductPct: 100,
  });

  const [activePage, setActivePage] = useState<string>(savedPrefs?.activePage || 'dashboard');
  const [mktFilter, setMktFilter] = useState<string>(savedPrefs?.mktFilter || '');
  const [isPulseActive, setIsPulseActive] = useState<boolean>(false);
  const [toast, setToast] = useState<AmmlAttendance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const pulseTimer = useRef<NodeJS.Timeout | null>(null);

  // Persist only non-sensitive UI preferences
  useEffect(() => {
    try {
      const prefs = {
        mktFilter,
        activePage,
        settings,
      };
      localStorage.setItem(PREF_STORAGE_KEY, JSON.stringify(prefs));
    } catch (err) {
      console.warn("Preference save notice:", err);
    }
  }, [mktFilter, activePage, settings]);

  // Primary Firebase Authentication Listener (Sole source of identity truth)
  useEffect(() => {
    let userDocUnsub: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setFirebaseUser(currentUser);
        
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          
          // Real-time listener for user profile doc (updates role immediately on change)
          userDocUnsub = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as AmmlUser;
              setSession({
                ...data,
                id: currentUser.uid,
                uid: currentUser.uid,
                email: currentUser.email || data.email,
              });
            } else {
              // Provision initial profile doc for newly authenticated user
              const isSuperAdminEmail = currentUser.email?.toLowerCase().includes('admin@amml') || 
                                       currentUser.email?.toLowerCase().includes('md@amml');
              const initialLevel: AmmlUser['level'] = isSuperAdminEmail ? 'SUPERADMIN' : 'OFFICER';
              
              const newProfile: AmmlUser = {
                id: currentUser.uid,
                uid: currentUser.uid,
                name: currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0].toUpperCase() : 'AMML Staff'),
                email: currentUser.email || '',
                level: initialLevel,
                role: initialLevel,
                market: 'all',
                lastLogin: `Today ${new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`,
                active: true,
              };

              await setDoc(userDocRef, newProfile).catch(err => {
                console.warn("Notice during initial profile creation:", err);
              });
              setSession(newProfile);

              // Inform server to assign custom claims
              try {
                const token = await currentUser.getIdToken();
                await fetch('/api/amml/auth/set-claims', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    targetUid: currentUser.uid,
                    role: initialLevel,
                    market: 'all'
                  })
                });
                await currentUser.getIdToken(true);
              } catch (claimErr) {
                console.warn("Claims setup notice:", claimErr);
              }
            }
            setIsAuthReady(true);
          });
        } catch (e) {
          console.error("User profile load error:", e);
          setIsAuthReady(true);
        }
      } else {
        if (userDocUnsub) {
          userDocUnsub();
          userDocUnsub = null;
        }
        setFirebaseUser(null);
        setSession(null);
        setIsAuthReady(true);
      }
    });

    return () => {
      authUnsubscribe();
      if (userDocUnsub) userDocUnsub();
    };
  }, []);

  // Sync state changes to Firestore when authenticated
  const syncChangesToFirestore = <T extends Record<string, any>>(
    prev: T[],
    next: T[],
    collectionName: string,
    getId: (item: T) => string
  ) => {
    if (!isAuthReady || !session) return;
    const prevMap = new Map<string, string>();
    prev.forEach(item => {
      prevMap.set(getId(item), JSON.stringify(item));
    });

    next.forEach(item => {
      const id = getId(item);
      if (!id) return;
      const serialized = JSON.stringify(item);
      if (prevMap.get(id) !== serialized) {
        setDoc(doc(db, collectionName, id), item).catch(e => 
          console.warn(`Firestore sync notice for ${collectionName}/${id}:`, e?.message || e)
        );
      }
    });

    // Clean deletions if any
    const nextKeys = new Set(next.map(getId));
    prev.forEach(item => {
      const id = getId(item);
      if (id && !nextKeys.has(id)) {
        deleteDoc(doc(db, collectionName, id)).catch(e => 
          console.warn(`Firestore delete notice for ${collectionName}/${id}:`, e?.message || e)
        );
      }
    });
  };

  // Synced wrappers for state setters
  const setStaffAndSync = (val: React.SetStateAction<AmmlStaff[]>) => {
    setStaff(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncChangesToFirestore(prev, next, 'staff', item => item.id);
      return next;
    });
  };

  const setMarketsAndSync = (val: React.SetStateAction<AmmlMarket[]>) => {
    setMarkets(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncChangesToFirestore(prev, next, 'markets', item => item.id);
      return next;
    });
  };

  const setDevicesAndSync = (val: React.SetStateAction<AmmlDevice[]>) => {
    setDevices(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncChangesToFirestore(prev, next, 'devices', item => item.id);
      return next;
    });
  };

  const setAttAndSync = (val: React.SetStateAction<AmmlAttendance[]>) => {
    setAtt(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncChangesToFirestore(prev, next, 'attendance', item => item.id);
      return next;
    });
  };

  const setActivityLogAndSync = (val: React.SetStateAction<AmmlActivityLog[]>) => {
    setActivityLog(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      // Note: Telemetry logs are strictly append-only; update/delete is blocked in Firestore
      if (next.length > prev.length) {
        const newlyAdded = next[0];
        if (newlyAdded?.id) {
          setDoc(doc(db, 'telemetry_logs', newlyAdded.id), newlyAdded).catch(() => {});
        }
      }
      return next;
    });
  };

  const setAssetsAndSync = (val: React.SetStateAction<AmmlAsset[]>) => {
    setAssets(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncChangesToFirestore(prev, next, 'assets', item => item.id);
      return next;
    });
  };

  const setAssetStocksAndSync = (val: React.SetStateAction<AmmlAssetStock[]>) => {
    setAssetStocks(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncChangesToFirestore(prev, next, 'asset_stocks', item => `${item.itemId}_${item.warehouseId}`);
      return next;
    });
  };

  const setPurchaseOrdersAndSync = (val: React.SetStateAction<AmmlPurchaseOrder[]>) => {
    setPurchaseOrders(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncChangesToFirestore(prev, next, 'purchase_orders', item => item.id);
      return next;
    });
  };

  const setLeavesAndSync = (val: React.SetStateAction<AmmlLeave[]>) => {
    setLeaves(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      syncChangesToFirestore(prev, next, 'leaves', item => item.id);
      return next;
    });
  };

  // Real-time Firestore Stream Subscriptions (Activated when authenticated)
  useEffect(() => {
    if (!session || !isAuthReady) return;

    const unsubscribers: (() => void)[] = [];

    const initializeAndStreamFirestore = async () => {
      try {
        setIsLoading(true);

        // Markets Stream
        unsubscribers.push(onSnapshot(collection(db, 'markets'), (snap) => {
          const list: AmmlMarket[] = [];
          snap.forEach(d => list.push(d.data() as AmmlMarket));
          if (list.length > 0) setMarkets(list);
        }, () => {}));

        // Staff Stream
        unsubscribers.push(onSnapshot(collection(db, 'staff'), (snap) => {
          const list: AmmlStaff[] = [];
          snap.forEach(d => list.push(d.data() as AmmlStaff));
          if (list.length > 0) setStaff(list);
        }, () => {}));

        // Devices Stream
        unsubscribers.push(onSnapshot(collection(db, 'devices'), (snap) => {
          const list: AmmlDevice[] = [];
          snap.forEach(d => list.push(d.data() as AmmlDevice));
          if (list.length > 0) setDevices(list);
        }, () => {}));

        // Attendance Stream
        unsubscribers.push(onSnapshot(collection(db, 'attendance'), (snap) => {
          const list: AmmlAttendance[] = [];
          snap.forEach(d => list.push(d.data() as AmmlAttendance));
          if (list.length > 0) setAtt(list);
        }, () => {}));

        // Telemetry Logs Stream
        unsubscribers.push(onSnapshot(collection(db, 'telemetry_logs'), (snap) => {
          const list: AmmlActivityLog[] = [];
          snap.forEach(d => list.push(d.data() as AmmlActivityLog));
          if (list.length > 0) {
            list.sort((a, b) => b.id.localeCompare(a.id));
            setActivityLog(list);
          }
        }, () => {}));

        // Users Directory Stream (Supervisors and Administrators)
        unsubscribers.push(onSnapshot(collection(db, 'users'), (snap) => {
          const list: AmmlUser[] = [];
          snap.forEach(d => list.push(d.data() as AmmlUser));
          if (list.length > 0) setUsers(list);
        }, () => {}));

        // Assets Streams
        unsubscribers.push(onSnapshot(collection(db, 'assets'), (snap) => {
          const list: AmmlAsset[] = [];
          snap.forEach(d => list.push(d.data() as AmmlAsset));
          if (list.length > 0) setAssets(list);
        }, () => {}));

        unsubscribers.push(onSnapshot(collection(db, 'asset_stocks'), (snap) => {
          const list: AmmlAssetStock[] = [];
          snap.forEach(d => list.push(d.data() as AmmlAssetStock));
          if (list.length > 0) setAssetStocks(list);
        }, () => {}));

        unsubscribers.push(onSnapshot(collection(db, 'purchase_orders'), (snap) => {
          const list: AmmlPurchaseOrder[] = [];
          snap.forEach(d => list.push(d.data() as AmmlPurchaseOrder));
          if (list.length > 0) setPurchaseOrders(list);
        }, () => {}));

        unsubscribers.push(onSnapshot(collection(db, 'leaves'), (snap) => {
          const list: AmmlLeave[] = [];
          snap.forEach(d => list.push(d.data() as AmmlLeave));
          if (list.length > 0) setLeaves(list);
        }, () => {}));

      } catch (e) {
        console.warn("Firestore listener initialization notice:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAndStreamFirestore();

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [session, isAuthReady]);

  // Audit Logs helper
  const auditLog = (type: string, action: string, details: string) => {
    const now = new Date();
    const cleanTime = now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const cleanDate = now.toISOString().slice(0, 10);
    const logUser = session ? `${session.name} (${session.level})` : 'System';

    const newLog: AmmlActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: cleanTime,
      date: cleanDate,
      user: logUser,
      type,
      action,
      details,
      status: 'Success',
    };

    setActivityLogAndSync(prev => [newLog, ...prev.slice(0, 499)]);
  };

  // Live Pulse stream simulation for demo and operational tests
  useEffect(() => {
    if (isPulseActive && session) {
      pulseTimer.current = setInterval(() => {
        const randomStaff = staff[Math.floor(Math.random() * staff.length)];
        if (!randomStaff) return;
        const todayStr = new Date().toISOString().slice(0, 10);
        
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const existing = att.find(a => a.date === todayStr && a.staffId === randomStaff.id);
        const randDev = devices.find(d => d.market === randomStaff.market && d.active) || devices[0];

        if (existing && !existing.clockOut) {
          clockInOut(randomStaff.id, randomStaff.market, randDev?.name || 'Gate Terminal', 'Out', timeStr, todayStr, true);
        } else if (!existing) {
          clockInOut(randomStaff.id, randomStaff.market, randDev?.name || 'Gate Terminal', 'In', timeStr, todayStr, true);
        }
      }, 7000);
    } else {
      if (pulseTimer.current) {
        clearInterval(pulseTimer.current);
      }
    }

    return () => {
      if (pulseTimer.current) clearInterval(pulseTimer.current);
    };
  }, [isPulseActive, session, staff, att, devices]);

  // Production Firebase Sign-In (Official Email & Password)
  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      return true;
    } catch (err: any) {
      let friendly = 'Failed to sign in. Please verify your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendly = 'Invalid official email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        friendly = 'Account access temporarily throttled due to multiple failed attempts. Please wait a moment.';
      }
      throw new Error(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  // Production Google Workspace SSO Sign-In
  const handleGoogleLogin = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      return true;
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        throw new Error('Google Workspace sign-in was cancelled.');
      }
      throw new Error('Google Workspace SSO verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Production Account Registration
  const handleSignUp = async (
    name: string, 
    email: string, 
    pass: string, 
    level: AmmlUser['level'] = 'OFFICER', 
    market = 'all'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;

      const newProfile: AmmlUser = {
        id: user.uid,
        uid: user.uid,
        name: name.trim(),
        email: email.trim(),
        level,
        role: level,
        market,
        lastLogin: `Today ${new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}`,
        active: true
      };

      await setDoc(doc(db, 'users', user.uid), newProfile);
      setSession(newProfile);

      // Set server claims
      try {
        const token = await user.getIdToken();
        await fetch('/api/amml/auth/set-claims', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            targetUid: user.uid,
            role: level,
            market
          })
        });
      } catch (cErr) {
        console.warn("Claims setup notice on registration:", cErr);
      }

      return true;
    } catch (err: any) {
      let msg = 'Registration could not be completed.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this official email is already registered.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too short. Please use at least 6 characters.';
      }
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Backwards compatibility proxy
  const handleLoginSim = async (email: string, _level: string, pass?: string): Promise<boolean> => {
    if (!pass) {
      throw new Error('Password is required for production authentication.');
    }
    return handleLogin(email, pass);
  };

  // Secure Sign-Out
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      if (session) {
        auditLog('LOGIN', 'User logged out', `${session.email} ended session`);
      }
      await signOut(auth);
      setSession(null);
      setFirebaseUser(null);
      setIsPulseActive(false);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper late calculation
  const lateThreshTime = () => {
    const start = settings.startTime || '08:00';
    const [h, m] = start.split(':').map(Number);
    const totalM = h * 60 + m + (settings.lateMinutes || 15);
    const th = Math.floor(totalM / 60);
    const tm = totalM % 60;
    return `${String(th).padStart(2, '0')}:${String(tm).padStart(2, '0')}`;
  };

  // Save Attendance & Payroll Settings
  const saveAttSettings = (s: Partial<AmmlSettings>) => {
    const updated = { ...settings, ...s };
    setSettings(updated);
    auditLog('SETTINGS', 'Attendance threshold updated', `Late min: ${s.lateMinutes || settings.lateMinutes}m, Min hrs: ${s.minHours || settings.minHours}h`);
    if (session && (session.level === 'SUPERADMIN' || session.level === 'MD')) {
      setDoc(doc(db, 'settings', 'payroll_coefficients'), updated).catch(() => {});
    }
  };

  const savePaySettings = (s: Partial<AmmlSettings>) => {
    const updated = { ...settings, ...s };
    setSettings(updated);
    auditLog('SETTINGS', 'Payroll policy updated', `Daily rate: ₦${s.dailyRate || settings.dailyRate}, Late deduct: ₦${s.lateDeduction || settings.lateDeduction}`);
    if (session && (session.level === 'SUPERADMIN' || session.level === 'MD')) {
      setDoc(doc(db, 'settings', 'payroll_coefficients'), updated).catch(() => {});
    }
  };

  // Biometric Terminal Scan Trigger
  const clockInOut = (
    staffId: string, 
    market: string, 
    deviceName: string, 
    action: 'In' | 'Out', 
    timeStr?: string, 
    dateStr?: string, 
    isDemo = false
  ): boolean => {
    const s = staff.find(x => x.id === staffId);
    if (!s) return false;

    const now = new Date();
    const cleanDate = dateStr || now.toISOString().slice(0, 10);
    const cleanTime = timeStr || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const thresh = lateThreshTime();

    const staffFullName = `${s.first} ${s.last}`.trim();

    if (action === 'In') {
      const isLate = cleanTime > thresh;
      const newAtt: AmmlAttendance = {
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        staffId,
        staffName: staffFullName,
        market,
        dept: s.dept || 'Operations',
        date: cleanDate,
        clockIn: cleanTime,
        clockOut: null,
        late: isLate,
        duration: null,
        device: deviceName
      };

      setAttAndSync(prev => [newAtt, ...prev]);

      if (!isDemo) {
        auditLog('SCAN', `Staff Check-In (${isLate ? 'Late' : 'Present'})`, `${staffFullName} clocked in at ${cleanTime} via ${deviceName}`);
      }

      setToast(newAtt);
      setTimeout(() => setToast(null), 4000);
      return true;
    } else {
      const idx = att.findIndex(a => a.staffId === staffId && a.date === cleanDate && !a.clockOut);
      if (idx !== -1) {
        const target = att[idx];
        const dur = calcDur(target.clockIn, cleanTime);
        const updated: AmmlAttendance = {
          ...target,
          clockOut: cleanTime,
          duration: `${dur} hrs`
        };

        setAttAndSync(prev => {
          const clone = [...prev];
          clone[idx] = updated;
          return clone;
        });

        if (!isDemo) {
          auditLog('SCAN', 'Staff Check-Out', `${staffFullName} completed shift duration: ${dur} hrs`);
        }

        setToast(updated);
        setTimeout(() => setToast(null), 4000);
        return true;
      }
      return false;
    }
  };

  // Quick Bulk Clock-In
  const bulkClockIn = (staffIds: string[], market: string): number => {
    let count = 0;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = now.toISOString().slice(0, 10);
    
    staffIds.forEach(id => {
      const ok = clockInOut(id, market, 'Executive Bulk Validator', 'In', timeStr, dateStr, true);
      if (ok) count++;
    });

    auditLog('BULK', 'Bulk Clock-In Executed', `Enrolled ${count} staff into biometric attendance records`);
    return count;
  };

  const triggerSimulateScan = (staffId: string) => {
    const s = staff.find(x => x.id === staffId);
    if (!s) return;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const existing = att.find(a => a.staffId === staffId && a.date === dateStr && !a.clockOut);
    const randDev = devices.find(d => d.market === s.market && d.active) || devices[0];
    
    if (existing) {
      clockInOut(staffId, s.market, randDev?.name || 'Main Gate Terminal', 'Out');
    } else {
      clockInOut(staffId, s.market, randDev?.name || 'Main Gate Terminal', 'In');
    }
  };

  // Administrative Reset (Superadmin only)
  const dbClear = async () => {
    if (session?.level !== 'SUPERADMIN') {
      alert('Forbidden: Only SUPERADMIN can re-synchronize the system baseline.');
      return;
    }

    setMarkets(seedMarkets);
    setStaff(seedStaff);
    setDevices(seedDevices);
    setAtt(generateSeedAttendance());
    setUsers(seedUsers);
    setActivityLog(seedActivityLogs);
    setAssets(seedAssets);
    setAssetStocks(seedAssetStocks);
    setPurchaseOrders(seedPurchaseOrders);
    setLeaves(seedLeaves);
    setSettings({
      startTime: '08:00',
      endTime: '17:00',
      lateMinutes: 15,
      minHours: 7,
      dailyRate: 5000,
      lateDeduction: 500,
      absentDeductPct: 100,
    });
    setIsPulseActive(false);
    setActivePage('dashboard');

    auditLog('SECURITY', 'Baseline synchronization executed', 'Superadmin synchronized platform dataset');
  };

  return (
    <AmmlContext.Provider value={{
      markets, setMarkets: setMarketsAndSync,
      staff, setStaff: setStaffAndSync,
      devices, setDevices: setDevicesAndSync,
      att, setAtt: setAttAndSync,
      users, setUsers,
      activityLog, setActivityLog: setActivityLogAndSync,
      settings, setSettings,
      session, setSession,
      firebaseUser,
      isAuthReady,
      activePage, setActivePage,
      mktFilter, setMktFilter,
      isPulseActive, setIsPulseActive,
      toast, setToast,
      isLoading, setIsLoading,
      auditLog,
      handleLogin,
      handleGoogleLogin,
      handleSignUp,
      handleLoginSim,
      handleLogout,
      saveAttSettings,
      savePaySettings,
      clockInOut,
      bulkClockIn,
      triggerSimulateScan,
      dbClear,
      
      // Assets
      assets, setAssets: setAssetsAndSync,
      assetStocks, setAssetStocks: setAssetStocksAndSync,
      purchaseOrders, setPurchaseOrders: setPurchaseOrdersAndSync,
      
      // Leaves
      leaves, setLeaves: setLeavesAndSync
    }}>
      {children}
    </AmmlContext.Provider>
  );
};

export const useAmmlStore = () => {
  const context = useContext(AmmlContext);
  if (context === undefined) {
    throw new Error('useAmmlStore must be used within an AmmlProvider');
  }
  return context;
};
