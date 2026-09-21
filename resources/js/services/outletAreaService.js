// resources/js/services/outletAreaService.js
import axios from "axios";

/**
 * Fetch all areas with their cabangs
 */
export async function fetchOutletAreas() {
  const response = await axios.get("/outlet-areas");
  return response.data;
}

/**
 * Add a new area (Admin only)
 */
export async function addOutletArea(nama) {
  const response = await axios.post("/outlet-areas", { nama });
  return response.data;
}

/**
 * Delete an area by id (Admin only)
 */
export async function deleteOutletArea(id) {
  const response = await axios.delete(`/outlet-areas/${id}`);
  return response.data;
}

/**
 * Fetch cabangs optionally filtered by area
 */
export async function fetchOutletCabangs(area = "") {
  const response = await axios.get("/outlet-cabangs", {
    params: area ? { area } : {},
  });
  return response.data;
}

/**
 * Add a new cabang (Admin only)
 */
export async function addOutletCabang(area_nama, nama) {
  const response = await axios.post("/outlet-cabangs", { area_nama, nama });
  return response.data;
}

/**
 * Delete a cabang by id (Admin only)
 */
export async function deleteOutletCabang(id) {
  const response = await axios.delete(`/outlet-cabangs/${id}`);
  return response.data;
}
