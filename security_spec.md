# Security Specification (TDD) for AMML Operations Database

## 1. Data Invariants
- **AmmlEvent**: Must contain valid schema fields. Timestamp must be a valid ISO8601 string or date object. Cannot bypass write constraints.
- **AmmlDevice**: Cannot register device with negative ingestRate. Status must be upper-case 'ONLINE', 'OFFLINE', or 'DEGRADED'.
- **AmmlMarket**: Prices and changes cannot be negative or null. Volume must be positive.
- **AmmlAttendance**: Check-in time cannot be in the future.
- **AmmlZoneLoad**: Load must be between 0 and 100.

## 2. The "Dirty Dozen" Payloads
These payloads attempt to breach identity, integrity, and safety:

1. **Spoofed Author ID (Incident Event)**:
   ```json
   { "id": "event_001", "timestamp": "2026-06-07T22:00:00Z", "eventType": "CLASSIFIER", "zoneId": "ZONE_A", "staffId": "SPURIOUS_USER_ID", "status": "WARN", "details": "Unauthorized spoof attempt" }
   ```
2. **Missing Required Field (Device Registration)**:
   ```json
   { "id": "device_999", "name": "Rogue Node", "status": "ONLINE" }
   ```
3. **Invalid Status Enumeration (Device Status)**:
   ```json
   { "id": "device_001", "name": "Alpha Node", "status": "REBELD", "ipAddress": "192.168.1.1", "firmware": "v1.0" }
   ```
4. **Out of Range Load (Zone load overload)**:
   ```json
   { "id": "zone_A", "zoneId": "ZONE_A", "name": "Zone A", "load": -50, "deviceCount": 4, "status": "ACTIVE", "hotSpot": false }
   ```
5. **No Auth Ingestion (Unauthenticated Event Write)**:
   ```json
   { "id": "event_no_auth", "timestamp": "2026-06-07T22:00:00Z", "eventType": "INTRUSION", "zoneId": "ZONE_C", "status": "CRITICAL", "details": "Anonymously injected event" }
   ```
6. **Future Attendance Date**:
   ```json
   { "id": "att_001", "staffId": "AMML-002", "name": "Fake Node", "role": "Operator", "checkInTime": "2030-01-01T00:00:00Z", "status": "ACTIVE" }
   ```
7. **Negative Market Price**:
   ```json
   { "id": "market_sol", "name": "SOL-NODE", "price": -100.5, "change24h": -2.4, "volume": 10000, "status": "ACTIVE" }
   ```
8. **Malicious ID Ingestion (Junk characters ID injection)**:
   ```json
   { "id": "malicious_node_$$$%%%_junk", "name": "Hacker Node", "status": "ONLINE" }
   ```
9. **Spamming Payload Injection (1MB String overload for device details)**:
   ```json
   { "id": "event_spam", "timestamp": "2026-06-07T22:00:00Z", "eventType": "CLASSIFIER", "zoneId": "ZONE_A", "status": "WARN", "details": "AAAA... (extremely long string)" }
   ```
10. **Admin Self-Promotion Injection (A person trying to claim admin role)**:
    ```json
    { "id": "member_001", "isAdmin": true, "role": "Hacker" }
    ```
11. **Negative Device Ingest Rate**:
    ```json
    { "id": "device_002", "name": "Beta Node", "zoneId": "ZONE_B", "status": "ONLINE", "ipAddress": "10.0.0.1", "firmware": "v1", "lastSeen": "2026-06-07T00:00:00Z", "ingestRate": -50.2 }
    ```
12. **Tampering with Terminal Immutable Event Log**:
    ```json
    { "id": "event_001", "status": "RESOLVED", "details": "Tampering after event is final" }
    ```

## 3. The Test Runner
A mock test script framework is mapped inside the client codebase to run verification logs for security. Tests enforce `PERMISSION_DENIED` on all spurious uploads unless authenticated with proper operational schema rules.
