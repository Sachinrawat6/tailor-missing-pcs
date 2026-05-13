import { useState, useCallback } from "react";
import { syncOrders, scanOrder } from "../api/orders";
import { SCAN_STATUS, LOG_TYPE } from "../constants";

function createLog(message, type = LOG_TYPE.INFO) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    message,
    type,
    time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

/**
 * Manages the full scan flow:
 *   1. POST /sync-orders
 *   2. POST /scan for each returned order
 *
 * @param {number} userId - logged-in employee's ID
 */
export function useScanner(userId) {
  const [status, setStatus] = useState(SCAN_STATUS.IDLE);
  const [logs, setLogs] = useState([]);
  const [syncedCount, setSyncedCount] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);

  const pushLog = useCallback((message, type) => {
    setLogs((prev) => [...prev, createLog(message, type)]);
  }, []);

  const reset = useCallback(() => {
    setStatus(SCAN_STATUS.IDLE);
    setLogs([]);
    setSyncedCount(0);
    setScannedCount(0);
  }, []);

  const scan = useCallback(
    async (styleNumber, size) => {
      reset();
      setStatus(SCAN_STATUS.SYNCING);
      pushLog(`Syncing — Style: ${styleNumber} | Size: ${size}`, LOG_TYPE.INFO);

      // ── Step 1: sync-orders ─────────────────────────────────────────────
      let orders = [];
      try {
        orders = await syncOrders(styleNumber, size);
        setSyncedCount(orders.length);
        pushLog(`${orders.length} order(s) sync hua.`, LOG_TYPE.SUCCESS);
      } catch (err) {
        pushLog(`Sync failed: ${err.message}`, LOG_TYPE.ERROR);
        setStatus(SCAN_STATUS.ERROR);
        return;
      }

      if (orders.length === 0) {
        pushLog("Koi order sync nahi hua, scan skip.", LOG_TYPE.WARN);
        setStatus(SCAN_STATUS.DONE);
        return;
      }

      // ── Step 2: scan each order ─────────────────────────────────────────
      setStatus(SCAN_STATUS.SCANNING);
      let scanned = 0;

      for (const order of orders) {
        const orderId = order?.order_id ?? order?.id ?? order?.orderId;

        if (!orderId) {
          pushLog(
            `Order ID nahi mila: ${JSON.stringify(order).slice(0, 60)}`,
            LOG_TYPE.WARN
          );
          continue;
        }

        try {
          await scanOrder(orderId, userId);
          scanned++;
          setScannedCount(scanned);
          pushLog(`Order #${orderId} scan ho gaya.`, LOG_TYPE.SUCCESS);
        } catch (err) {
          pushLog(`Order #${orderId} scan error: ${err.message}`, LOG_TYPE.ERROR);
        }
      }

      setStatus(SCAN_STATUS.DONE);
      pushLog(
        `Complete! ${scanned}/${orders.length} orders scan hue.`,
        scanned === orders.length ? LOG_TYPE.SUCCESS : LOG_TYPE.WARN
      );
    },
    [userId, pushLog, reset]
  );

  const isLoading =
    status === SCAN_STATUS.SYNCING || status === SCAN_STATUS.SCANNING;

  return {
    status,
    logs,
    syncedCount,
    scannedCount,
    isLoading,
    isDone: status === SCAN_STATUS.DONE,
    isError: status === SCAN_STATUS.ERROR,
    scan,
    reset,
  };
}
