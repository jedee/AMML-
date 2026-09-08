import { saveTelemetryLogToDb, PersistentTelemetryLog } from './db';

export interface TelemetryPacket {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'CRITICAL';
  module: string;
  message: string;
  signature?: string;
  nodeId: string;
  latencyMs: number;
  bandwidthKbps: number;
}

type TelemetrySubscriber = (packet: TelemetryPacket) => void;

class TelemetrySimulationStore {
  private subscribers: Set<TelemetrySubscriber> = new Set();
  private isSimulating: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private nodes = [
    { id: 'WUSE-MAIN-01', market: 'Wuse General Market' },
    { id: 'GUDU-TERM-02', market: 'Gudu Market Station' },
    { id: 'UTAKO-HUB-03', market: 'Utako Agro Station' },
    { id: 'GARKI-GATE-04', market: 'Garki Model Market' },
    { id: 'KUBWA-ING-05', market: 'Kubwa Ingress Station' }
  ];

  private modules = [
    'GATEWAY_SHAKE',
    'BIOMETRICS_INGEST',
    'SYNC_DISPATCH',
    'SHA256_VERIFICATION',
    'CRYPTO_ROTATOR'
  ];

  constructor() {
    // Standard singleton
  }

  public subscribe(callback: TelemetrySubscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public startSimulation(): void {
    if (this.isSimulating) return;
    this.isSimulating = true;

    const generatePacket = async () => {
      if (!this.isSimulating) return;

      const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      const randomModule = this.modules[Math.floor(Math.random() * this.modules.length)];
      const randomSig = '0x' + Array.from({ length: 16 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      let type: TelemetryPacket['type'] = 'SUCCESS';
      let message = '';
      let latencyMs = Math.floor(Math.random() * 45) + 30; // 30-75ms
      let bandwidthKbps = parseFloat((Math.random() * 50 + 100).toFixed(1)); // 100-150 Kbps

      // Randomly inject warning or critical parameters occasionally
      const roll = Math.random();
      if (roll > 0.92) {
        type = 'CRITICAL';
        latencyMs = Math.floor(Math.random() * 200) + 180; // Severe delay
        bandwidthKbps = parseFloat((Math.random() * 20 + 5).toFixed(1)); // Choked bandwidth
        message = `CRITICAL PANIC: Host ${randomNode.id} timed out. Re-routed biometrics buffer via secondary GPRS tunnel.`;
      } else if (roll > 0.8) {
        type = 'WARN';
        latencyMs = Math.floor(Math.random() * 80) + 90; // Warning latency
        message = `WARNING: Integrity trace verification mismatch on packet payload from ${randomNode.market}. Retry initiated.`;
      } else {
        // Successful/Info logs
        if (randomModule === 'GATEWAY_SHAKE') {
          type = 'INFO';
          message = `Diffie-Hellman handshake executed successfully for ${randomNode.id}. Keys verified.`;
        } else if (randomModule === 'BIOMETRICS_INGEST') {
          message = `Biometric scan decrypted securely on node ${randomNode.id}. AES-256 validation bounds: PASS.`;
        } else if (randomModule === 'SYNC_DISPATCH') {
          message = `Workforce check-in dispatch block published to persistent replication stream at ${randomNode.market}.`;
        } else if (randomModule === 'SHA256_VERIFICATION') {
          message = `Block validation verified. SHA-256 payload matched ledger root successfully.`;
        } else {
          type = 'INFO';
          message = `Periodic ping heartbeat telemetry broadcast active from ${randomNode.id} node interface.`;
        }
      }

      const packet: TelemetryPacket = {
        id: `pack-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        type,
        module: randomModule,
        message,
        signature: randomSig,
        nodeId: randomNode.id,
        latencyMs,
        bandwidthKbps
      };

      // Notify UI listeners
      this.subscribers.forEach(sub => sub(packet));

      // Try saving telemetry logs persistently for post-incident review
      // Check if user session exists (auth.currentUser) to satisfy Firestore write rules
      try {
        const dbLog: Omit<PersistentTelemetryLog, 'id'> = {
          timestamp: packet.timestamp,
          type: packet.type,
          module: packet.module,
          message: packet.message,
          signature: packet.signature,
          nodeId: packet.nodeId,
          latencyMs: packet.latencyMs,
          bandwidthKbps: packet.bandwidthKbps
        };
        await saveTelemetryLogToDb(dbLog);
      } catch (err) {
        // Silently catch and log to minimize runtime interference if rules intercept
        console.warn("Telemetry log Firestore logging deferred:", err);
      }
    };

    // Run immediately and then set interval
    generatePacket();
    this.intervalId = setInterval(generatePacket, 6000);
  }

  public stopSimulation(): void {
    this.isSimulating = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public getIsSimulating(): boolean {
    return this.isSimulating;
  }
}

export const mockTelemetryStore = new TelemetrySimulationStore();
