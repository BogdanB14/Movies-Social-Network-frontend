<template>
  <div class="signup-overlay" >
    <div class="signup-container" >
      <h2 class="signup-title">Registracija</h2>

      <form class="signup-form" @submit.prevent="registerUser">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" placeholder="Unesite svoju email adresu..." />
          <p v-if="emailError" class="error">{{ emailError }}</p>
        </div>

        <div class="form-group"> 
          <label for="name">Ime</label> 
          <input type="text" id="name" v-model="name" placeholder="Unesite svoje ime..." /> 
          <p v-if="nameError" class="error">{{ nameError }}</p> 
        </div>

        <div class="form-group"> 
          <label for="last_name">Prezime</label> 
          <input type="text" id="last_name" v-model="last_name" placeholder="Unesite svoje prezime..." />
          <p v-if="lastNameError" class="error">{{ lastNameError }}</p> 
        </div>

        <div class="form-group">
          <label for="username">Korisničko ime</label>
          <input type="text" id="username" v-model="username" placeholder="Unesite svoje korisničko ime..." />
          <p v-if="usernameError" class="error">{{ usernameError }}</p>
        </div>

        <div class="form-group">
          <label for="password">Šifra</label>
          <input type="password" id="password" v-model="password" placeholder="Unesite svoju šifru..." />
          <p v-if="passwordError" class="error">{{ passwordError }}</p>
        </div>

        <div class="checkbox-group">
          <label>
            <input type="checkbox" class="custom-checkbox" v-model="isAdult" />
            Potvrđujem da imam više od 18 godina
          </label>
        </div>

        <button type="submit" class="signup-button">Registruj se</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "@/axios";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "SignUpForm",
  data() {
    return {
      email: "",
      name: "",          
      last_name: "",     
      username: "",
      password: "",
      isAdult: false,
      emailError: "",
      nameError: "",      
      lastNameError: "",  
      passwordError: "",
      usernameError: ""
    };
  },
  methods: {
    async registerUser() {
      this.emailError = "";
      this.passwordError = "";
      this.usernameError = "";
      this.nameError = "";      
      this.lastNameError = "";  
      const emailRegex = /^[A-Za-z0-9._%+-]{2,}@(gmail|hotmail)\.com$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      const usernameRegex = /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z\d]{6,}$/;

      if (!this.name || this.name.trim().length < 2) {
        this.nameError = "Ime mora imati barem 2 karaktera.";
        return;
      }
      if (!this.last_name || this.last_name.trim().length < 2) {
        this.lastNameError = "Prezime mora imati barem 2 karaktera.";
        return;
      }

      if (!emailRegex.test(this.email)) {
        this.emailError = "Email mora biti u formatu: korisnik@gmail.com ili korisnik@hotmail.com";
        return;
      }
      if (!usernameRegex.test(this.username)) {
        this.usernameError = "Korisničko ime mora imati minimum 6 karaktera, jedno veliko i jedno malo slovo.";
        return;
      }
      if (!passwordRegex.test(this.password)) {
        this.passwordError = "Šifra mora imati bar 8 karaktera, jedno veliko slovo, jedno malo slovo, jedan broj i jedan specijalan znak.";
        return;
      }
      if (!this.isAdult) {
        alert("Morate potvrditi da imate više od 18 godina.");
        return;
      }
      const auth = useAuthStore();

      try {
        await axios.get("/sanctum/csrf-cookie");
        const { data } = await axios.post("/api/register", {
          email: this.email,
          username: this.username,
          password: this.password,
          name: this.name,
          last_name: this.last_name,
        });

        if (data?.success && data?.user) {
          auth.login(data.user);
          alert("Uspešno ste registrovani i ulogovani!");
          this.$router.push("/");
        } else {
          alert(data?.message || "Registracija neuspešna.");
        }
      } catch (error) {
        console.error(error);
        alert(error?.response?.data?.message || "Došlo je do greške prilikom registracije.");
      }
    }
  },
};
</script>
<style scoped>
.error {
  color: red;
  font-size: 0.8rem;
}
.signup-overlay {
  position: relative;
  width: 100vw;
  height: 70vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}
.signup-container {
  background: #1c1c1c;
  color: #fff;
  padding: 2rem;
  border-radius: 12px;
  width: 350px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}
.signup-title {
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #fff;
}
.signup-form {
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
.checkbox-group {
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}
.custom-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border: 2px solid #ccc;
  border-radius: 4px;
  margin-right: 0.5rem;
  position: relative;
  cursor: pointer;
}
.custom-checkbox:checked {
  background-color: #1db954;
  border-color: #1db954;
}
.custom-checkbox:checked::after {
  content: "✔";
  color: #fff;
  font-size: 12px;
  position: absolute;
  top: -2px;
  left: 2px;
}
.signup-button {
  background-color: #1db954;
  color: #fff;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}
.signup-button:hover {
  background-color: #17a94d;
}
</style>