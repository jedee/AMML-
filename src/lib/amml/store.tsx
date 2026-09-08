import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AmmlMarket, AmmlStaff, AmmlDevice, AmmlAttendance, AmmlUser, AmmlActivityLog, AmmlSettings, AmmlAsset, AmmlAssetStock, AmmlPurchaseOrder, AmmlLeave } from './types';
import { seedMarkets, seedStaff, seedDevices, generateSeedAttendance, seedUsers, seedActivityLogs, calcDur, seedAssets, seedAssetStocks, seedPurchaseOrders, seedLeaves } from './mock';
import { db, auth, signInAnonymously } from './firebase';
import { collection, doc, getDocs, setDoc, onSnapshot, getDocFromServer, deleteDoc } from 'firebase/firestore';

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
  session: AmmlUser | null;
  setSession: React.Dispatch<React.SetStateAction<AmmlUser | null>>;
  
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
  
  // Actions
  auditLog: (type: string, action: string, details: string) => void;
  handleLoginSim: (email: string, level: string, pass?: string) => Promise<boolean>;
  handleLogout: () => void;
  saveAttSettings: (s: Partial<AmmlSettings>) => void;
  savePaySettings: (s: Partial<AmmlSettings>) => void;
  clockInOut: (staffId: string, market: string, deviceName: string, action: 'In' | 'Out', timeStr?: string, dateStr?: string, isDemo?: boolean) => boolean;
  bulkClockIn: (staffIds: string[], market: string) => number;
  triggerSimulateScan: (staffId: string) => void;
  dbClear: () => void;
}

const getCorrectedName = (name: string): string => {
  const u = name.toUpperCase().replace(/[-.]/g, ' ').trim();
  if (u.includes("MANGER JUSTINE") || u.includes("JUSTINE MANGER")) return "JUSTINE MANGER";
  if (u.includes("MADINA RAZAQ HASSAN") || u.includes("MADINA RASAK HASSAN")) return "MADINA RASAK HASSAN";
  if (u.includes("HALIMA MUHAMMAD RABIU") || u.includes("HALIMA RABIU MUHAMMAD")) return "HALIMA RABIU MUHAMMAD";
  if (u.includes("SANGOTOYE A ABIGAIL") || u.includes("SANGOTOYE ABIGAIL")) return "SANGOTOYE ABIGAIL";
  if (u.includes("MUHAMMAD HAUWA KAKA") || u.includes("HAUWA KAKA MUHAMMAD")) return "HAUWA KAKA MUHAMMAD";
  if (u.includes("BAIDI AISHA GAJO") || u.includes("AISHA BAIDI GAJO")) return "AISHA BAIDI GAJO";
  if (u.includes("AHMED UMAR ABUBAKAR") || u.includes("ABUBAKAR AHMED UMAR")) return "ABUBAKAR AHMED UMAR";
  if (u.includes("SARAH T BROWN") || u.includes("SARAH BROWN")) return "SARAH BROWN TAMUNOTARIBO";
  if (u.includes("WILLIAMS JOY OKRI") || u.includes("WILLIAMS JOY OKOI")) return "WILLIAMS JOY OKOI";
  if (u.includes("OGUNYEMI RAFIAT") || u.includes("RAFAIAT OGUNYEMI")) return "RAFAIAT OGUNYEMI OPEYEMI";
  if (u.includes("ONYA N OJIJI") || u.includes("ONYA OJIJI")) return "ONYA OJIJI";
  if (u.includes("MICHEAL O OKPEWHO") || u.includes("MICHAEL OKPEWHO")) return "MICHAEL OKPEWHO";
  if (u.includes("BENEDICT AJIO") || u.includes("AJIO BENEDICT")) return "AJIO BENEDICT BEMSHIMA (DISPATCH)";
  if (u.includes("BASHIRU DAUDA")) return "BASHIR DAUDA";
  return u;
};

const areNamesMatching = (staffName: string, memoTo: string, memoMarket?: string, staffMarket?: string): boolean => {
  if (memoMarket && staffMarket) {
    const mktMemo = memoMarket.toLowerCase().replace(/market|operations|international|model|farmers/g, '').trim();
    const mktStaff = staffMarket.toLowerCase().replace(/market|operations|international|model|farmers/g, '').trim();
    if (mktMemo !== mktStaff && mktMemo !== "head office" && mktStaff !== "head office") {
      return false;
    }
  }

  const sNorm = getCorrectedName(staffName);
  const mNorm = getCorrectedName(memoTo);

  if (sNorm === mNorm) return true;
  if (sNorm.includes(mNorm) || mNorm.includes(sNorm)) return true;

  const sWords = sNorm.split(' ').filter(w => w.length > 2);
  const mWords = mNorm.split(' ').filter(w => w.length > 2);

  const overlap = sWords.filter(w => mWords.includes(w));
  if (overlap.length >= 2) return true;
  if (overlap.length > 0 && (overlap.length === sWords.length || overlap.length === mWords.length)) return true;

  return false;
};

const AmmlContext = createContext<AmmlContextProps | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'amml_mmis_v2';

export const AmmlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading initial state from local storage
  const loadSaved = () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed;
      }
    } catch (e) {
      console.warn("Local storage parse failed:", e);
    }
    return null;
  };

  const saved = loadSaved();

  const [session, setSession] = useState<AmmlUser | null>(saved?.session || null);
  const [markets, setMarkets] = useState<AmmlMarket[]>(() => {
    const defaultM = seedMarkets;
    if (saved?.markets) {
      if (saved.markets.length < defaultM.length) return defaultM;
      return saved.markets;
    }
    return defaultM;
  });
  
  // Asset state initialisation
  const [assets, setAssets] = useState<AmmlAsset[]>(() => {
    if (saved?.assets) {
      const existingIds = new Set(saved.assets.map((a: AmmlAsset) => a.id));
      const missing = seedAssets.filter(s => !existingIds.has(s.id));
      if (missing.length > 0) {
        return [...missing, ...saved.assets];
      }
      return saved.assets;
    }
    return seedAssets;
  });
  const [assetStocks, setAssetStocks] = useState<AmmlAssetStock[]>(() => {
    if (saved?.assetStocks) {
      const key = (st: AmmlAssetStock) => `${st.itemId}_${st.warehouseId}`;
      const existingKeys = new Set(saved.assetStocks.map((st: AmmlAssetStock) => key(st)));
      const missing = seedAssetStocks.filter(st => !existingKeys.has(key(st)));
      if (missing.length > 0) {
        return [...saved.assetStocks, ...missing];
      }
      return saved.assetStocks;
    }
    return seedAssetStocks;
  });
  const [purchaseOrders, setPurchaseOrders] = useState<AmmlPurchaseOrder[]>(() => {
    if (saved?.purchaseOrders) return saved.purchaseOrders;
    return seedPurchaseOrders;
  });
  const [leaves, setLeaves] = useState<AmmlLeave[]>(() => {
    let initialLeaves = seedLeaves;
    if (saved?.leaves) {
      const existingIds = new Set(saved.leaves.map((l: AmmlLeave) => l.id));
      const missingLeaves = seedLeaves.filter(l => !existingIds.has(l.id));
      initialLeaves = missingLeaves.length > 0 ? [...saved.leaves, ...missingLeaves] : saved.leaves;
    }
    const today = '2026-12-31';
    // Sort chronologically (oldest to newest)
    return initialLeaves
      .filter(l => l.startDate <= today)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  });

  const [staff, setStaff] = useState<AmmlStaff[]>(() => {
    const defaultS = seedStaff;
    if (saved?.staff) {
      const hasHq = saved.staff.some((s: AmmlStaff) => s.market === 'Head Office');
      const hasMD = saved.staff.some((s: AmmlStaff) => s.role === 'Ag. MD/CEO' || s.id === 'AMML-001');
      const hasMinka = saved.staff.some((s: AmmlStaff) => s.id === 'AMML-089');
      if (saved.staff.length < defaultS.length || !hasHq || !hasMD || !hasMinka) {
        return defaultS;
      }
      return saved.staff;
    }
    return defaultS;
  });
  const [devices, setDevices] = useState<AmmlDevice[]>(() => {
    const defaultD = seedDevices;
    if (saved?.devices) {
      if (saved.devices.length < defaultD.length) return defaultD;
      return saved.devices;
    }
    return defaultD;
  });
  const [att, setAtt] = useState<AmmlAttendance[]>(() => {
    const defaultA = generateSeedAttendance();
    if (saved?.att) {
      // In case we migrated staff, keep attendance synced or fall back
      return saved.att;
    }
    return defaultA;
  });
  const [users, setUsers] = useState<AmmlUser[]>(() => {
    const defaultU = seedUsers;
    if (saved?.users) {
      const hasMD = saved.users.some((u: AmmlUser) => u.level === 'MD' && u.name.includes('Onya'));
      if (saved.users.length < defaultU.length || !hasMD) {
        return defaultU;
      }
      return saved.users;
    }
    return defaultU;
  });
  const [activityLog, setActivityLog] = useState<AmmlActivityLog[]>(saved?.activityLog || seedActivityLogs);
  const [settings, setSettings] = useState<AmmlSettings>(saved?.settings || {
    startTime: '08:00',
    endTime: '17:00',
    lateMinutes: 15,
    minHours: 7,
    dailyRate: 5000,
    lateDeduction: 500,
    absentDeductPct: 100,
  });

  const [activePage, setActivePage] = useState<string>('dashboard');
  const [mktFilter, setMktFilter] = useState<string>('');
  const [isPulseActive, setIsPulseActive] = useState<boolean>(false);
  const [toast, setToast] = useState<AmmlAttendance | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);

  const pulseTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-Save Effect
  useEffect(() => {
    try {
      const payload = {
        session,
        markets,
        staff,
        devices,
        att: att.slice(-1000), // Keep latest 1000 for size limits
        users,
        activityLog: activityLog.slice(0, 300),
        settings,
        assets,
        assetStocks,
        purchaseOrders,
        leaves
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn("Storage save failed:", err);
    }
  }, [session, markets, staff, devices, att, users, activityLog, settings, assets, assetStocks, purchaseOrders, leaves]);

  // Handle Firebase Anon Auth check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthReady(true);
      } else {
        setIsAuthReady(false);
        if (session) {
          signInAnonymously(auth).catch(e => {
            if (e?.code === 'auth/admin-restricted-operation') {
              // Anonymous auth disabled in console - operating with memory session
              console.info("Firestore operating in memory session mode.");
            } else {
              console.info("Firebase auth status:", e?.message || e);
            }
          });
        }
      }
    });
    return () => unsubscribe();
  }, [session]);

  // Helper to sync local changes to Firestore by comparing state diffs
  const syncChangesToFirestore = <T extends Record<string, any>>(
    prev: T[],
    next: T[],
    collectionName: string,
    getId: (item: T) => string
  ) => {
    if (!isAuthReady) return;
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
          console.warn(`Firestore sync failed for ${collectionName}/${id}:`, e)
        );
      }
    });

    // Clean deletions if any
    const nextKeys = new Set(next.map(getId));
    prev.forEach(item => {
      const id = getId(item);
      if (id && !nextKeys.has(id)) {
        deleteDoc(doc(db, collectionName, id)).catch(e => 
          console.warn(`Firestore delete failed for ${collectionName}/${id}:`, e)
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
      syncChangesToFirestore(prev, next, 'telemetry_logs', item => item.id);
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

  // Firestore real-time stream subscription on system startup
  useEffect(() => {
    if (!session || !isAuthReady) return;

    let unsubscribers: (() => void)[] = [];

    const initializeAndStreamFirestore = async () => {
      try {
        setIsLoading(true);
        // Test connection
        await getDocFromServer(doc(db, 'test', 'connection')).catch(() => {});
        
        // Push initial local dataset up if Firestore empty
        const mktCol = collection(db, 'markets');
        const qSnap = await getDocs(mktCol);
        if (qSnap.empty) {
          for (const m of markets) {
            await setDoc(doc(db, 'markets', m.id), m);
          }
          for (const s of staff) {
            await setDoc(doc(db, 'staff', s.id), s);
          }
          for (const d of devices) {
            await setDoc(doc(db, 'devices', d.id), d);
          }
          for (const a of att) {
            await setDoc(doc(db, 'attendance', a.id), a);
          }
          for (const log of activityLog) {
            await setDoc(doc(db, 'telemetry_logs', log.id), log);
          }
          for (const asset of assets) {
            await setDoc(doc(db, 'assets', asset.id), asset);
          }
          for (const stock of assetStocks) {
            await setDoc(doc(db, 'asset_stocks', `${stock.itemId}_${stock.warehouseId}`), stock);
          }
          for (const po of purchaseOrders) {
            await setDoc(doc(db, 'purchase_orders', po.id), po);
          }
          for (const lv of leaves) {
            await setDoc(doc(db, 'leaves', lv.id), lv);
          }
        }

        // Establish onSnapshot real-time streaming listeners
        unsubscribers.push(onSnapshot(collection(db, 'markets'), (snap) => {
          const list: AmmlMarket[] = [];
          snap.forEach(doc => list.push(doc.data() as AmmlMarket));
          if (list.length > 0) setMarkets(list);
        }));

        unsubscribers.push(onSnapshot(collection(db, 'staff'), (snap) => {
          const list: AmmlStaff[] = [];
          snap.forEach(doc => list.push(doc.data() as AmmlStaff));
          if (list.length > 0) setStaff(list);
        }));

        unsubscribers.push(onSnapshot(collection(db, 'devices'), (snap) => {
          const list: AmmlDevice[] = [];
          snap.forEach(doc => list.push(doc.data() as AmmlDevice));
          if (list.length > 0) setDevices(list);
        }));

        unsubscribers.push(onSnapshot(collection(db, 'attendance'), (snap) => {
          const list: AmmlAttendance[] = [];
          snap.forEach(doc => list.push(doc.data() as AmmlAttendance));
          if (list.length > 0) {
            list.sort((a, b) => {
              const dateDiff = b.date.localeCompare(a.date);
              if (dateDiff !== 0) return dateDiff;
              return b.clockIn.localeCompare(a.clockIn);
            });
            setAtt(list);
          }
        }));

        unsubscribers.push(onSnapshot(collection(db, 'telemetry_logs'), (snap) => {
          const list: AmmlActivityLog[] = [];
          snap.forEach(doc => list.push(doc.data() as AmmlActivityLog));
          if (list.length > 0) {
            list.sort((a, b) => b.id.localeCompare(a.id));
            setActivityLog(list);
          }
        }));

        unsubscribers.push(onSnapshot(collection(db, 'assets'), (snap) => {
          const list: AmmlAsset[] = [];
          snap.forEach(doc => list.push(doc.data() as AmmlAsset));
          if (list.length > 0) setAssets(list);
        }));

        unsubscribers.push(onSnapshot(collection(db, 'asset_stocks'), (snap) => {
          const list: AmmlAssetStock[] = [];
          snap.forEach(doc => list.push(doc.data() as AmmlAssetStock));
          if (list.length > 0) setAssetStocks(list);
        }));

        unsubscribers.push(onSnapshot(collection(db, 'purchase_orders'), (snap) => {
          const list: AmmlPurchaseOrder[] = [];
          snap.forEach(doc => list.push(doc.data() as AmmlPurchaseOrder));
          if (list.length > 0) setPurchaseOrders(list);
        }));

        unsubscribers.push(onSnapshot(collection(db, 'leaves'), (snap) => {
          const list: AmmlLeave[] = [];
          snap.forEach(doc => list.push(doc.data() as AmmlLeave));
          if (list.length > 0) setLeaves(list);
        }));

        console.log("Firestore real-time streams successfully established.");
      } catch (e) {
        console.warn("Operating in offline-first localStorage sync mode.", e);
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
    const logUser = session ? `${session.name} (${session.level})` : 'Anonymous';

    const newLog: AmmlActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      time: cleanTime,
      date: cleanDate,
      user: logUser,
      type,
      action,
      details,
      status: 'Success',
    };

    setActivityLog(prev => [newLog, ...prev.slice(0, 499)]);
  };

  // Pulse stream timer simulation: simulates realistic check-ins/outs when active!
  useEffect(() => {
    if (isPulseActive) {
      pulseTimer.current = setInterval(() => {
        const randomStaff = staff[Math.floor(Math.random() * staff.length)];
        const todayStr = new Date().toISOString().slice(0, 10);
        
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Find existing attendance log
        const existing = att.find(a => a.date === todayStr && a.staffId === randomStaff.id);
        const randDev = devices.find(d => d.market === randomStaff.market && d.active) || devices[0];

        if (existing && !existing.clockOut) {
          // Clock out
          clockInOut(randomStaff.id, randomStaff.market, randDev?.name || 'Gate Terminal', 'Out', timeStr, todayStr, true);
        } else if (!existing) {
          // Clock in
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
  }, [isPulseActive, staff, att, devices]);

  // Core Authentication Process
  const handleLoginSim = async (email: string, level: string, pass?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.active);
      if (matched) {
        // Validation of password if provided (for demo or live simulation)
        if (pass && matched._demoPass && matched._demoPass !== pass) {
          throw new Error('Incorrect password');
        }
        
        const updatedUser = { ...matched, lastLogin: `Today ${new Date().toLocaleTimeString('en-NG', {hour:'2-digit', minute:'2-digit'})}` };
        setSession(updatedUser);
        setUsers(prev => prev.map(u => u.id === matched.id ? updatedUser : u));

        // Create log entry
        const cleanDate = new Date().toISOString().slice(0, 10);
        const logId = `log-${Date.now()}`;
        const newLog: AmmlActivityLog = {
          id: logId,
          time: new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          date: cleanDate,
          user: updatedUser.name + ' (' + updatedUser.level + ')',
          type: 'LOGIN',
          action: 'User logged in',
          details: `${updatedUser.email} accessed portal via dashboard`,
          status: 'Success'
        };
        setActivityLog(prev => [newLog, ...prev]);

        return true;
      }
      
      // Fallback: Dynamically generate an ad-hoc session profile if requested email does not exist in seed
      if (email.includes('@')) {
        const namePart = email.split('@')[0];
        const readableName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._-]/g, ' ');
        const adhocUser: AmmlUser = {
          id: `u-${Date.now()}`,
          name: readableName,
          email,
          level: (level as any) || 'SUPERVISOR',
          market: 'all',
          lastLogin: 'Just now',
          active: true,
          _demoPass: pass || 'password'
        };
        setUsers(prev => [...prev, adhocUser]);
        setSession(adhocUser);
        
        // Log log in
        auditLog('LOGIN', 'User account registered & logged in', email);
        return true;
      }
      
      throw new Error('User not found. Enter a valid email address.');
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Terminate Log Session
  const handleLogout = () => {
    setIsLoading(true);
    if (session) {
      auditLog('LOGIN', 'User logged out', `${session.email} closed session`);
    }
    setSession(null);
    setIsPulseActive(false);
    setIsLoading(false);
  };

  // Helper late calculation
  const lateThreshTime = () => {
    const start = settings.startTime || '08:00';
    const [h, m] = start.split(':').map(Number);
    const lateLimit = h * 60 + (m + settings.lateMinutes);
    const lh = String(Math.floor(lateLimit / 60)).padStart(2, '0');
    const lm = String(lateLimit % 60).padStart(2, '0');
    return `${lh}:${lm}`;
  };

  // Clock in / out operation
  const clockInOut = (
    staffId: string, 
    market: string, 
    deviceName: string, 
    action: 'In' | 'Out', 
    timeStr?: string, 
    dateStr?: string,
    isDemo?: boolean
  ): boolean => {
    const s = staff.find(x => x.id === staffId);
    if (!s) return false;

    const todayStr = dateStr || new Date().toISOString().slice(0, 10);
    const now = new Date();
    const clockTime = timeStr || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Dynamic approved & synced leave memo check to set 'On Leave' status & block clock-ins
    let sIsOnLeave = false;
    try {
      const savedMemoData = typeof window !== 'undefined' ? localStorage.getItem('amml_leave_memos') : null;
      if (savedMemoData) {
        const memos: any[] = JSON.parse(savedMemoData);
        const staffName = `${s.first} ${s.last}`;
        const idNorm = staffId.toUpperCase().trim();

        sIsOnLeave = memos.some(memo => {
          if (memo.status !== 'approved' && !memo.synced) return false;

          const memoStaffId = memo.staffId ? memo.staffId.toUpperCase().trim() : '';

          const isNameMatch = areNamesMatching(staffName, memo.to || '', memo.market || '', s.market || '');
          const isIdMatch = idNorm && memoStaffId && idNorm === memoStaffId;

          if (!isNameMatch && !isIdMatch) return false;

          // Check if todayStr falls between startDate and endDate
          if (memo.startDate && memo.endDate) {
            const check = new Date(todayStr + 'T00:00:00');
            const start = new Date(memo.startDate + 'T00:00:00');
            const end = new Date(memo.endDate + 'T00:00:00');
            return check >= start && check <= end;
          }
          return false;
        });
      }
    } catch (e) {
      console.error("error checking leave memos in clockInOut", e);
    }

    if (sIsOnLeave && action === 'In') {
      auditLog('ATTENDANCE', 'Clock In BLOCKED (On Leave)', `${s.first} ${s.last} clock-in aborted: active leave dates match ${todayStr}`);
      return false;
    }

    if (action === 'In') {
      const existing = att.find(a => a.date === todayStr && a.staffId === staffId);
      if (existing) return false;

      const thresh = lateThreshTime();
      const late = clockTime > thresh;

      const newAtt: AmmlAttendance = {
        id: `att-${staffId}-${Date.now()}`,
        staffId,
        staffName: `${s.first} ${s.last}`,
        market,
        dept: s.dept,
        date: todayStr,
        clockIn: clockTime,
        clockOut: null,
        device: deviceName,
        late,
        duration: null,
      };

      setAtt(prev => [newAtt, ...prev]);
      
      // Update clocks count for associated device
      setDevices(prev => prev.map(d => d.name === deviceName && d.market === market ? { ...d, clocksToday: d.clocksToday + 1 } : d));

      if (!isDemo) {
        auditLog('ATTENDANCE', 'Clock In recorded', `${s.first} ${s.last} checked in at ${clockTime}`);
      } else {
        setToast(newAtt);
      }
      return true;
    } else {
      // Find active clock-in that does not have a clock-out
      const matchIndex = att.findIndex(a => a.date === todayStr && a.staffId === staffId && !a.clockOut);
      if (matchIndex === -1) return false;

      setAtt(prev => {
        const next = [...prev];
        const match = { ...next[matchIndex] };
        match.clockOut = clockTime;
        match.duration = `${calcDur(match.clockIn, clockTime)} hrs`;
        next[matchIndex] = match;
        
        if (isDemo) {
          setToast(match);
        }
        return next;
      });

      if (!isDemo) {
        auditLog('ATTENDANCE', 'Clock Out recorded', `${s.first} ${s.last} checked out at ${clockTime}`);
      }
      return true;
    }
  };

  // Bulk clock in process
  const bulkClockIn = (staffIds: string[], market: string): number => {
    let addedCount = 0;
    const now = new Date();
    const tStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dStr = now.toISOString().slice(0, 10);

    staffIds.forEach(sid => {
      const done = clockInOut(sid, market, 'Bulk Clocking Terminal', 'In', tStr, dStr);
      if (done) addedCount++;
    });

    if (addedCount > 0) {
      auditLog('ATTENDANCE', 'Bulk marked present', `${addedCount} staff marked present at ${market}`);
    }

    return addedCount;
  };

  // Trigger simulate local badge scan
  const triggerSimulateScan = (staffId: string) => {
    const s = staff.find(x => x.id === staffId);
    if (!s) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const existing = att.find(a => a.date === todayStr && a.staffId === staffId);

    const now = new Date();
    const clockTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const targetDevName = devices.find(d => d.market === s.market && d.active)?.name || 'Main Gate Terminal';

    if (existing && !existing.clockOut) {
      const ok = clockInOut(staffId, s.market, targetDevName, 'Out', clockTime, todayStr, true);
      if (ok) {
        auditLog('ATTENDANCE', 'Simulated badge scan Out', `${s.first} ${s.last} clocked out`);
      }
    } else {
      const ok = clockInOut(staffId, s.market, targetDevName, 'In', clockTime, todayStr, true);
      if (ok) {
        auditLog('ATTENDANCE', 'Simulated badge scan In', `${s.first} ${s.last} clocked in`);
      }
    }
  };

  // Save general settings
  const saveAttSettings = (newS: Partial<AmmlSettings>) => {
    setSettings(prev => ({ ...prev, ...newS }));
    auditLog('SETTINGS', 'Attendance rules updated', `Start: ${newS.startTime || settings.startTime}, Late limit: ${newS.lateMinutes || settings.lateMinutes} mins`);
  };

  const savePaySettings = (newS: Partial<AmmlSettings>) => {
    setSettings(prev => ({ ...prev, ...newS }));
    auditLog('SETTINGS', 'Payroll rules updated', `Daily rate: ₦${newS.dailyRate || settings.dailyRate}, late penalty: ₦${newS.lateDeduction || settings.lateDeduction}`);
  };

  // Data Reset Function
  const dbClear = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setSession(null);
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

    if (isAuthReady) {
      seedMarkets.forEach(m => setDoc(doc(db, 'markets', m.id), m).catch(() => {}));
      seedStaff.forEach(s => setDoc(doc(db, 'staff', s.id), s).catch(() => {}));
      seedDevices.forEach(d => setDoc(doc(db, 'devices', d.id), d).catch(() => {}));
      seedAssets.forEach(asset => setDoc(doc(db, 'assets', asset.id), asset).catch(() => {}));
      seedAssetStocks.forEach(stock => setDoc(doc(db, 'asset_stocks', `${stock.itemId}_${stock.warehouseId}`), stock).catch(() => {}));
      seedPurchaseOrders.forEach(po => setDoc(doc(db, 'purchase_orders', po.id), po).catch(() => {}));
      seedLeaves.forEach(lv => setDoc(doc(db, 'leaves', lv.id), lv).catch(() => {}));
    }
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
      activePage, setActivePage,
      mktFilter, setMktFilter,
      isPulseActive, setIsPulseActive,
      toast, setToast,
      isLoading, setIsLoading,
      auditLog,
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
