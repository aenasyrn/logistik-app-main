// resources/js/Components/Layout/LazyComponents.js
// Ported to static imports to avoid next/dynamic Next.js specific wrapper in Laravel Vite.
import DashboardView from "../Dashboard";
import DataMaster from "../DataMaster";
import FormView from "../Form/FormView";
import PreviewView from "../Form/PreviewView";
import DataPrinter from "../DataPerangkat/DataPrinter";
import DataKomputer from "../DataPerangkat/DataKomputer";
import DataLaptop from "../DataPerangkat/DataLaptop";
import RiwayatTransaksi from "../Transaksi/RiwayatTransaksi";
import LogAktivitas from "../Admin/LogAktivitas";
import KelolaAkses from "../Admin/KelolaAkses";
import BangunanTanah from "../Bangunan/DaftarTanah";

import BangunanSewa from "../Bangunan/Sewa";
import BangunanRenovasi from "../Bangunan/Renovasi";
import BangunanSarana from "../Bangunan/SaranaPengamanan";
import BangunanSPK from "../Bangunan/SPK";
import NotificationPageView from "../Notification/NotificationPageView";
import SoppGenerator from "../Form/SoppGenerator";
import PusatDataBarang from "../DataMaster/PusatDataBarang";
import Mebelair from "../Inventaris/Meubelair/MeubelairView";
import DataMeja from "../Inventaris/Meubelair/DataMeja";
import DataKursi from "../Inventaris/Meubelair/DataKursi";
import DataLemari from "../Inventaris/Meubelair/DataLemari";
import DataSofa from "../Inventaris/Meubelair/DataSofa";
import DataAC from "../Inventaris/Meubelair/DataAC";


export {
  DashboardView,
  DataMaster,
  FormView,
  PreviewView,
  DataPrinter,
  DataKomputer,
  DataLaptop,
  RiwayatTransaksi,
  LogAktivitas,
  KelolaAkses,
  BangunanTanah,

  BangunanSewa,
  BangunanRenovasi,
  BangunanSarana,
  BangunanSPK,
  NotificationPageView,
  SoppGenerator,
  PusatDataBarang,
  Mebelair,
  DataMeja,
  DataKursi,
  DataLemari,
  DataSofa,
  DataAC,
};