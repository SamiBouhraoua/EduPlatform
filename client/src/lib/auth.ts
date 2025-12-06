export type UserPayload = {
  _id?: string;
  id?: string;
  role: "student" | "teacher" | "admin" | "superadmin" | "parent";
  email: string;
  firstName?: string;
  lastName?: string;
  collegeId?: string;
};
export const auth = {
  save(token: string, payload: UserPayload) { localStorage.setItem("token", token); localStorage.setItem("user", JSON.stringify(payload)); },
  token() { return typeof window !== "undefined" ? localStorage.getItem("token") : null; },
  user(): UserPayload | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    try {
      const u = raw ? JSON.parse(raw) : null;
      if (u) {
        u.collegeId = u.collegeId || localStorage.getItem("collegeId");
      }
      return u;
    } catch { return null }
  },
  clear() { localStorage.removeItem("token"); localStorage.removeItem("user"); }
}
