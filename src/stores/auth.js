import { defineStore } from "pinia";

// CHANGED: choose storage per env
const STORAGE = import.meta.env.DEV ? sessionStorage : localStorage;

// CHANGED: read from chosen storage
const saved = JSON.parse(STORAGE.getItem("auth") || "null");

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

      // CHANGED: write to chosen storage
      STORAGE.setItem(
        "auth",
        JSON.stringify({
          isLoggedIn: this.isLoggedIn,
          user: this.user,
          role: this.role,
        })
      );
    },
    logout() {
      this.isLoggedIn = false;
      this.user = null;
      this.role = "client";
      STORAGE.removeItem("auth"); // CHANGED
    },
  },
});
