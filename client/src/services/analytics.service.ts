import api from "@/lib/api";

export const analyticsService = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getYear: () => api.get("/analytics/year"),
  getRings: () => api.get("/analytics/rings"),
  getCalendar: (month: string) => api.get(`/analytics/calendar?month=${month}`),
};
