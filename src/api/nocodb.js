import axios from 'axios';
import { NOCODB_URL, NOCODB_ORDERS_URL } from '../constants/index.js';
import { NOCODB_TOKEN } from '../constants/index.js';
const SCAN_VIEW_ID = 'vwx3yogyd9jcoqbk';

const nocoAxios = axios.create({
  headers: { 'xc-token': NOCODB_TOKEN, 'Content-Type': 'application/json' },
});

// ── Existing helpers (kept intact) ───────────────────────────────────────────

export async function updateScannedItems(order_id, payload) {
  const response = await fetch(`${NOCODB_URL}`, {
    method: 'PATCH',
    body: JSON.stringify({ system_id: order_id, ...payload }),
    headers: { 'Content-Type': 'application/json', 'xc-token': NOCODB_TOKEN },
  });
  return response.json();
}

export async function TodayMissingPcs(date) {
  const formatted_date = new Date(date).toISOString();
  const { data } = await nocoAxios.get(NOCODB_ORDERS_URL, {
    params: {
      offset: 0,
      limit: 25,
      where: `(channel,eq,Missing Pcs)~and(created_at,eq,exactDate,${formatted_date})`,
    },
  });
  return data?.list ?? [];
}

// ── New: UpdateScannedItem feature ───────────────────────────────────────────

/**
 * Step 1 — Fetch all Missing Pcs orders for a given date (YYYY-MM-DD).
 * Uses NocoDB exactDate filter on created_at.
 */
export async function fetchMissingPcsOrders(date) {
  const isoDate = new Date(date).toISOString();
  const { data } = await nocoAxios.get(NOCODB_ORDERS_URL, {
    params: {
      limit: 1000,
      where: `(channel,eq,Missing Pcs)~and(created_at,eq,exactDate,${isoDate})`,
    },
  });
  return data?.list ?? [];
}

/**
 * Step 2 — Fetch all scanned records for the given order_ids.
 * Batches requests in groups of 50 to stay within URL length limits.
 */
export async function fetchScannedRecordsByOrderIds(orderIds) {
  if (!orderIds.length) return [];

  const BATCH = 50;
  const results = [];

  for (let i = 0; i < orderIds.length; i += BATCH) {
    const batch = orderIds.slice(i, i + BATCH);
    const { data } = await nocoAxios.get(NOCODB_URL, {
      params: {
        limit: 1000,
        where: `(order_id,in,${batch.join(',')})`,
      },
    });
    results.push(...(data?.list ?? []));
  }

  return results;
}
