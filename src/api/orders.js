import { apiFetch } from "./client";

/**
 * Normalize sync-orders response into a flat array of orders.
 *
 * Actual API shape:
 * {
 *   status: "success",
 *   message: "Processed N orders",
 *   all_orders: [{ order_id, channel, style_number, size, color }],
 *   cutting_list: [...],
 *   sync_id: 11076
 * }
 */
function normalizeOrders(data) {
  // Primary: real API response has orders in `all_orders`
  if (data?.all_orders && Array.isArray(data.all_orders)) return data.all_orders;
  // Fallbacks for other shapes
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.data) return [data.data];
  if (data?.order_id || data?.id) return [data];
  return [];
}

/**
 * POST /sync-orders
 * @param {number|string} styleNumber
 * @param {string} size
 * @returns {Promise<Array>} list of synced orders
 */
export async function syncOrders(styleNumber, size) {
  const payload = [
    {
      channel: "Missing Pcs",
      style_number: Number(styleNumber),
      size,
      color: "other",
      found_in_inventory: false,
    },
  ];

  const data = await apiFetch("/sync-orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeOrders(data);
}

/**
 * POST /scan
 * @param {number|string} orderId
 * @param {number} userId
 * @returns {Promise<any>}
 */
export async function scanOrder(orderId, userId) {
  return apiFetch("/scan", {
    method: "POST",
    body: JSON.stringify({
      order_id: orderId,
      user_id: userId,
      user_location_id: 145,
    }),
  });
}
