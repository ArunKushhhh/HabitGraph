import api from "@/lib/api";

export const checkinService = {
  toggle: (habitId: string, date: string, status: boolean) =>
    api.patch("/checkin/toggle", { habitId, date, status }),
  getToday: () => api.get("/checkin/today"),
};
