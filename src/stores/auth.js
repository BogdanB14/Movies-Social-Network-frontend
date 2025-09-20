// /src/stores/auth.js
import { defineStore } from "pinia";

const saved = JSON.parse(localStorage.getItem("auth") || "null");

export const useAuthStore = defineStore("auth", {
  state: () => ({
    isLoggedIn: saved?.isLoggedIn ?? false,
    user: saved?.user ?? null, 
    role: saved?.role ?? "client",
  }),
  getters: {
    isAdminOrModerator: (state) =>
      state.isLoggedIn && (state.role === "admin" || state.role === "moderator"),
  },
  actions: {
    login(userData) {
      this.isLoggedIn = true;
      this.user = userData || null;
      this.role = (userData?.role || "client").toLowerCase();
      localStorage.setItem("auth", JSON.stringify({
        isLoggedIn: this.isLoggedIn,
        user: this.user,
        role: this.role,
      }));
    },
    logout() {
      this.isLoggedIn = false;
      this.user = null;
      this.role = "client";
      localStorage.removeItem("auth");
    },
  },
});
