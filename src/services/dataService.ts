import { AppData, EDCData, QRISData } from "../types";

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface StatsResponse {
  current: {
    total: number;
    sales_vol: number;
    casa: number;
    productive: number;
  };
  previous: {
    total: number;
    sales_vol: number;
    casa: number;
    productive: number;
  };
  lastUpdate: string | null;
}

export const DataService = {
  async getStats(type: "edc" | "qris"): Promise<StatsResponse> {
    const res = await fetch(`/api/stats/${type}`);
    return res.json();
  },

  async getList<T>(
    type: "edc" | "qris", 
    params: { 
      page: number; 
      limit: number; 
      search?: string; 
      unit?: string; 
      vendor?: string;
      pemrakarsa?: string;
      sort?: string; 
      order?: string; 
      filterType?: string 
    }
  ): Promise<ListResponse<T>> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`/api/list/${type}?${query}`);
    return res.json();
  },

  async getFilterOptions(type: "edc" | "qris"): Promise<{ units: string[], pms: string[], vendors?: string[] }> {
    const res = await fetch(`/api/filter-options/${type}`);
    return res.json();
  },

  async getMerchantDetail(type: "edc" | "qris", id: number): Promise<{ current: any, previous: any }> {
    const res = await fetch(`/api/merchant-detail/${type}/${id}`);
    return res.json();
  },

  async getUkerOptions(type: "edc" | "qris"): Promise<string[]> {
    const res = await this.getFilterOptions(type);
    return res.units;
  },

  async saveEDC(data: EDCData[]): Promise<{ success: boolean; count: number }> {
    const res = await fetch("/api/save-edc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async saveQRIS(data: QRISData[]): Promise<{ success: boolean; count: number }> {
    const res = await fetch("/api/save-qris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async clearData(type?: 'edc' | 'qris'): Promise<{ success: boolean }> {
    const res = await fetch("/api/clear-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    return res.json();
  },

  // Tambahkan di dalam DataService
  async getGlobalTrend(type: 'edc' | 'qris') {
    const res = await fetch(`/api/analytics/total/${type}`);
    return res.json();
  },
  async getMerchantTrend(type: 'edc' | 'qris', id: string) {
    const res = await fetch(`/api/analytics/merchant/${type}/${id}`);
    return res.json();
  }
};
