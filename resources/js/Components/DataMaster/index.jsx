"use client";

import MasterBarang from "./MasterBarang";
import MasterOutlet from "./MasterOutlet";

export default function DataMaster(props) {
  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col gap-6">
      {props.activeMenu === "master_barang" && <MasterBarang {...props} />}
      {props.activeMenu === "master_outlet" && <MasterOutlet {...props} />}
    </div>
  );
}