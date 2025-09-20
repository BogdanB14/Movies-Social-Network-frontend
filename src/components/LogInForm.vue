<template>
  <div class="login-overlay" @click="handleOverlayClick">
    <div class="login-container" @click.stop>
      <h2 class="login-title">Prijava</h2>

      <form class="login-form" @submit.prevent="loginUser">
        <!-- Username -->
        <div class="form-group">
          <label for="username">Korisničko ime</label>
          <input type="text" id="username" v-model="username" placeholder="Unesite svoje korisničko ime..." />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">Šifra</label>
          <input type="password" id="password" v-model="password" placeholder="Unesite svoju šifru..." />
        </div>


        <p v-if="loginError" class="error">{{ loginError }}</p>


        <!-- Button -->
        <button type="submit" class="login-button">Prijavi se</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";
import { useAuthStore } from "@/stores/auth";
export default {
  name: "LoginForm",
  data() {
    return {
      username: "",
      password: "",
      loginError: ""
    }
  },
  methods: {
    handleOverlayClick() {
      this.$emit("close");
    },
    async loginUser() {
      this.loginError = "";
      if (!this.username || !this.password) {
        this.loginError = "Molimo unesite korisničko ime i šifru.";
        return;
      }
      try {
        // 1) Get CSRF cookie (required by Sanctum)
        await axios.get("/sanctum/csrf-cookie");

        // 2) Hit our Laravel API
        const { data } = await axios.post("/api/login", {
          username: this.username,
          password: this.password,
        });

        if (data?.success) {
          const auth = useAuthStore();
          auth.login(data.user); 
          this.$router.push("/");
          console.log('MJAU AASDJ');
        } else {
          this.loginError = data?.message || "Neuspešna prijava.";
        }
      } catch (err) {
        console.error(err);
        this.loginError = err?.response?.data?.message || "Došlo je do greške prilikom prijave.";
      }
    }
  },
  setup() {
    const auth = useAuthStore();
    return { auth };
  },

};
</script>

<style scoped>
.error {
  color: red;
  font-size: 0.9rem;
}

.login-overlay {
  position: relative;
  width: 100vw;
  height: 70vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

/* box */
.login-container {
  background: #1c1c1c;
  color: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 350px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.login-title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #fff;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.form-group input {
  width: 100%;
  padding: 0.6rem;
  border: none;
  border-radius: 6px;
  outline: none;
  font-size: 0.9rem;
}

/* dugme */
.login-button {
  background-color: #1db954;
  color: #fff;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.login-button:hover {
  background-color: #17a94d;
}
</style>