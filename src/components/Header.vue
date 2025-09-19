<template>
  <header class="app-header">
    <!-- Logo -->
    <div class="header-left">
      <h1 class="logo">
        <router-link to="/" class="movie-maniacs-logo-router"><span class="movie">Movie</span><span
            class="maniacs">Maniacs</span></router-link>
      </h1>
    </div>

    <!-- Search bar -->

    <!-- Funkcionalnosti u headeru -->
    <div class="header-right">
      <router-link class="pages" to="log-in">
        Prijavi se
      </router-link>
      <router-link class="pages" to="/sign-in">
        Registruj se
      </router-link>
      <router-link class="pages" to="/add-movie" v-if="canAddMovie">
        Dodaj film
      </router-link>

      <!-- Profile Icon with dropdown -->
      <div class="profile-menu-wrapper">
        <!-- Ikonica vodi direktno na profil -->
        <router-link to="/profile">
          <img src="../img/profil.png" alt="Profil" class="profile-icon" />
        </router-link>

        <!-- Strelica otvara dropdown -->
        <div class="dropdown-toggle" @click.stop="toggleDropdown">▼</div>

        <!-- Dropdown meni -->
        <div v-if="showProfileMenu && auth.isLoggedIn" class="profile-dropdown">
          <button class="dropdown-item" @click="logout">Odjavi se</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import router from '@/router';
import { useAuthStore } from "@/stores/auth";
import axios from "axios";
import { computed } from "vue";

export default {
  name: "AppHeader",
  data() {
    return {
      searchQuery: "",
      showProfileMenu: false,
    };
  },
  setup() {
    const auth = useAuthStore();
    const canAddMovie = computed(() => auth.isLoggedIn && (auth.role === "admin"));
    return { auth, canAddMovie };
  },
  methods: {
    onSearch() {
      console.log("Pretraga:", this.searchQuery);
    },

    toggleDropdown() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    logout() {
      const auth = useAuthStore();
      axios.post("http://localhost/backend/logout.php", {}, { withCredentials: true })
        .then(() => {
          auth.logout();
          this.$router.push("/log-in");
        })
        .catch((error) => {
          console.error("Greška pri odjavi:", error);
        });
    }
  },
};
</script>

<style scoped>
.app-header {
  position: relative;
  min-width: 100%;
  height: 10vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #1f1f1f;
  padding: 0 5rem;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  z-index: 1000;
  box-sizing: border-box;
  flex-wrap: wrap;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.header-left {
  flex: 0 0 auto;
}

.logo {
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.logo .movie {
  color: #fff;
  /* belo */
}

.logo .maniacs {
  color: #1db954;
  /* zeleno kao dugmad */
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #2b2b2b;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  width: 100%;
  max-width: 20vw;
}

.search-bar input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  margin-left: 0.5rem;
  flex: 1;
}

.search-bar input::placeholder {
  color: #aaa;
}

.header-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 5rem;
}

.pages {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.profile-menu-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-dropdown {
  position: absolute;
  top: 80px;
  /* distance from icon */
  right: 0;
  background-color: #2b2b2b;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  min-width: 6vw;
  z-index: 1001;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  color: #fff;
  text-align: left;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  display: flex;

}

.dropdown-item:hover {
  background-color: #1db954;
  color: #fff;
}

.pages:hover {
  color: #1db954;
}

img {
  height: 14px;
  width: 14px;
}

.pages img {
  height: 35px;
  width: 35px;
}

.profile-menu-wrapper,
.profile-icon {
  height: 3vh;
  width: 3vw;
}

.dropdown-toggle {
  margin-left: 0.4rem;
  font-size: 0.9rem;
  color: #fff;
  cursor: pointer;
  user-select: none;
}

.dropdown-toggle:hover {
  color: #1db954;
}
</style>