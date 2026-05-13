import { apiFetch } from "./client";

/**
 * Fetch all employees from the server.
 * @returns {Promise<Array>}
 */
export async function fetchUsers() {
  const json = await apiFetch("/getUsers");
  const list = json?.data ?? json;
  return Array.isArray(list) ? list : [];
}
