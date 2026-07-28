// resources/js/Components/Layout/LazyComponents.js
// Ported to static imports to avoid next/dynamic Next.js specific wrapper in Laravel Vite.
import DashboardView from "../Dashboard";
import DataMaster from "../DataMaster";
import FormView from "../Form/FormView";
import PreviewView from "../Form/PreviewView";
import DataPrinter from "../DataPerangkat/DataPrinter";
import DataKomputer from "../DataPerangkat/DataKomputer";
import KelolaUser from "../Admin/KelolaUser";
import RiwayatTransaksi from "../Transaksi/RiwayatTransaksi";
import LogAktivitas from "../Admin/LogAktivitas";
import BangunanTanah from "../Bangunan/DaftarTanah";

import BangunanSewa from "../Bangunan/Sewa";
import BangunanRenovasi from "../Bangunan/Renovasi";
import BangunanSarana from "../Bangunan/SaranaPengamanan";
import BangunanSPK from "../Bangunan/SPK";
import NotificationPageView from "../Notification/NotificationPageView";
import SoppGenerator from "../Form/SoppGenerator";


export {
  DashboardView,
  DataMaster,
  FormView,
  PreviewView,
  DataPrinter,
  DataKomputer,
  KelolaUser,
  RiwayatTransaksi,
  LogAktivitas,
  BangunanTanah,

  BangunanSewa,
  BangunanRenovasi,
  BangunanSarana,
  BangunanSPK,
  NotificationPageView,
  SoppGenerator,
};