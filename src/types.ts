export interface EDCData {
  TAHUN: string;
  PERIODE: string;
  POSISI: string;
  NAMA_KANCA: string;
  NAMA_UKER: string;
  TID: string;
  MID: string;
  NAMA_MERCHANT: string;
  SALES_VOLUME: string | number;
  SALDO_POSISI: string | number;
  RATAS_SALDO: string | number;
  JML_TRANSAKSI: string | number;
  NAMA_USER_PEMRAKARSA: string;
  [key: string]: any;
}

export interface QRISData {
  PERIODE: string;
  POSISI: string;
  MBDESC: string; // Kanca
  BRDESC: string; // Uker
  STOREID: string;
  NAMA_MERCHANT: string;
  AKUMULASI_SV_TOTAL: string | number;
  SALDO_POSISI: string | number;
  RATAS_SALDO: string | number;
  AKUMULASI_TRX_TOTAL: string | number;
  PN_PEMRAKASA: string;
  STATUS: string;
  [key: string]: any;
}

export interface AppData {
  edc: EDCData[];
  qris: QRISData[];
}
