"use client";

import MasterBarang from "./MasterBarang";
import MasterOutlet from "./MasterOutlet";
import MasterVendor from "./MasterVendor";

export default function DataMaster(props) {
  const isMasterBarang =
    props.activeMenu === "master_barang" ||
    props.activeMenu === "master_barang_meubelair" ||
    props.activeMenu === "master_barang_non_meubelair";

  const activeSubMenu =
    props.activeMenu === "master_barang_non_meubelair"
      ? "non_meubelair"
      : props.activeMenu === "master_barang_meubelair"
      ? "meubelair"
      : props.activeSubMenu || "meubelair";

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
      {isMasterBarang && <MasterBarang {...props} activeSubMenu={activeSubMenu} />}
      {props.activeMenu === "master_outlet" && <MasterOutlet {...props} />}
      {props.activeMenu === "master_vendor" && <MasterVendor {...props} />}
    </div>
  );
}