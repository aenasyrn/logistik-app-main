// resources/js/services/outletAreaService.js
import { visitInertia } from "../utils/inertiaRequest";

/**
 * Add a new area (Admin only)
 */
export async function addOutletArea(nama) {
  const response = await visitInertia("/outlet-areas", { method: "post", data: { nama } });
  return response.data;
}

/**
 * Delete an area by id (Admin only)
 */
export async function deleteOutletArea(id) {
  const response = await visitInertia(`/outlet-areas/${id}`, { method: "delete" });
  return response.data;
}

/**
 * Add a new cabang (Admin only)
 */
export async function addOutletCabang(area_nama, nama) {
  const response = await visitInertia("/outlet-cabangs", { method: "post", data: { area_nama, nama } });
  return response.data;
}

/**
 * Delete a cabang by id (Admin only)
 */
export async function deleteOutletCabang(id) {
  const response = await visitInertia(`/outlet-cabangs/${id}`, { method: "delete" });
  return response.data;
}
