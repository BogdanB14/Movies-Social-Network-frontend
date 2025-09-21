<template>
  <div class="add-movie-page">
    <Header></Header>

    <main class="add-movie-content">
      <h1 class="page-title">Dodaj novi film</h1>

      <form class="add-movie-form" @submit.prevent="submitMovie">
        <div class="form-group">
          <label for="title">Ime filma</label>
          <input type="text" id="title" v-model.trim="movie.title" placeholder="Unesite ime filma" required />
        </div>

        <div class="form-group">
          <label for="director">Reditelj</label>
          <input type="text" id="director" v-model.trim="movie.director" placeholder="Unesite reditelja" required />
        </div>

        <div class="form-group">
          <label for="year">Godina</label>
          <input type="number" id="year" v-model.number="movie.year" placeholder="Unesite godinu" required />
        </div>

        <div class="form-group">
          <label for="genre">Žanr</label>
          <input type="text" id="genre" v-model.trim="movie.genre" placeholder="Unesite žanr (npr. Drama, Komedija)"
            required />
        </div>

        <div class="form-group">
          <label for="description">Opis</label>
          <textarea id="description" v-model.trim="movie.description" placeholder="Unesite kratak opis filma" rows="4"
            required></textarea>
        </div>

        <div class="form-group">
          <label for="actors">Glumci (odvojeni zarezom ili novim redom)</label>
          <textarea id="actors" v-model.trim="actorsText" placeholder="npr. Keanu Reeves, Carrie-Anne Moss"
            rows="2"></textarea>
          <small v-if="actorsArray.length">
            Biće poslato: [{{ actorsArray.join(', ') }}]
          </small>
        </div>

        <div class="form-group">
          <label for="poster">Poster filma</label>
          <input type="file" id="poster" @change="handlePosterUpload" accept="image/*" />
          <small v-if="posterName">Izabrano: {{ posterName }}</small>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? "Slanje…" : "Dodaj film" }}
        </button>

        <p v-if="error" class="state error">{{ error }}</p>
        <p v-if="success" class="state success">{{ success }}</p>
      </form>
    </main>

    <Footer></Footer>
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import axios from "@/axios";

export default {
  name: "AddMovie",
  components: { Header, Footer },
  data() {
    return {
      movie: {
        title: "",
        year: null,
        genre: "",
        description: "",
        director: ""
      },
      posterFile: null,
      posterName: "",
      actorsText: "",
      loading: false,
      error: "",
      success: "",
    };
  },
  computed: {
    actorsArray() {
      return (this.actorsText || "")
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    },
  },
  methods: {
    handlePosterUpload(event) {
      const file = event.target.files?.[0];
      this.posterFile = file || null;
      this.posterName = file ? file.name : "";
    },

    async submitMovie() {
      this.error = "";
      this.success = "";

      if (
        !this.movie.title ||
        !this.movie.year ||
        !this.movie.genre ||
        !this.movie.director ||
        !this.movie.description
      ) {
        this.error = "Molimo popunite sva obavezna polja.";
        return;
      }

      const year = Number(this.movie.year);
      if (
        !Number.isInteger(year) ||
        year < 1888 ||
        year > new Date().getFullYear() + 1
      ) {
        this.error = "Unesite validnu godinu.";
        return;
      }

      if (!this.posterFile) {
        this.error = "Niste dodali poster.";
        return;
      }

      const formData = new FormData();
      formData.append("title", this.movie.title);
      formData.append("year", String(year));
      formData.append("genre", this.movie.genre);
      formData.append("description", this.movie.description);
      formData.append("director", this.movie.director);
      this.actorsArray.forEach((actor) =>
        formData.append("actors[]", actor)
      );

      if (this.posterFile) {
        formData.append("poster", this.posterFile);
      }

      this.loading = true;
      try {
        const { data } = await axios.post(
          "/api/movies",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        if (data?.success) {
          this.success = data?.message || "Film je uspešno dodat.";
          this.resetForm();
        } else {
          this.error =
            data?.message ||
            "Došlo je do greške prilikom dodavanja filma.";
        }
      } catch (e) {
        this.error =
          e?.response?.data?.message || "Greška na serveru ili mreži.";
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.movie = { title: "", year: null, genre: "", description: "" };
      this.posterFile = null;
      this.posterName = "";
      this.actorsText = "";
      const input = document.getElementById("poster");
      if (input) input.value = "";
    },
  },
};
</script>

<style scoped>
.add-movie-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  color: #fff;
}

.add-movie-content {
  flex: 1;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #1db954;
}

.add-movie-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: #2b2b2b;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}

label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1db954;
}

input,
textarea {
  padding: 0.8rem;
  border-radius: 8px;
  border: none;
  outline: none;
  background-color: #444;
  color: #fff;
  font-size: 1rem;
}

input::placeholder,
textarea::placeholder {
  color: #aaa;
}

textarea {
  resize: none;
}

.submit-btn {
  padding: 0.8rem;
  font-size: 1.2rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  background-color: #1db954;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #17a846;
}

.state.error {
  margin-top: -0.5rem;
  color: #ff6b6b;
  font-weight: 600;
}

.state.success {
  margin-top: -0.5rem;
  color: #53d769;
  font-weight: 600;
}
</style>
