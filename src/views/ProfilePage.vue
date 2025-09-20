<template>
  <div class="profile-page">
    <Header />

    <main class="profile-container">
      <!-- If not logged in -->
      <section v-if="!auth.isLoggedIn" class="loading">
        Morate biti prijavljeni da biste videli profil.
      </section>

      <!-- Logged-in profile -->
      <section v-else>
        <section class="profile-top">
          <div class="profile-icon" aria-hidden="true">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="3.2" fill="#2b2b2b" stroke="#444" stroke-width="0.8" />
              <path d="M4 20c0-3.3 4.5-5 8-5s8 1.7 8 5" fill="#2b2b2b" stroke="#444" stroke-width="0.8" />
            </svg>
          </div>

          <div class="profile-info">
            <h1 class="fullname">{{ fullName }}</h1>
            <div class="meta-line">
              <span class="username" v-if="username">@{{ username }}</span>
              <span class="role">{{ roleLabel }}</span>
            </div>
            <p class="bio" v-if="bio">{{ bio }}</p>
          </div>
        </section>

        <section class="comments-section">
          <div class="comments-header">
            <h2>Komentari</h2>
            <span class="count">{{ loading ? "..." : comments.length }}</span>
          </div>

          <div v-if="loading" class="loading">Učitavanje komentara...</div>
          <div v-else>
            <div v-if="comments.length === 0" class="no-comments">Korisnik još nije ostavio komentare.</div>
            <div class="comments-list">
              <PersonsComment
                v-for="c in comments"
                :key="c.id"
                :id="c.id"
                :author="c.author"
                :movie="c.movie"
                :time="c.time"
                :content="c.content"
              />
            </div>
          </div>
        </section>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import PersonsComment from "@/components/PersonsComment.vue";
import axios from "@/axios";
import { useAuthStore } from "@/stores/auth";
import { computed } from "vue";

export default {
  name: "ProfilePage",
  components: { Header, Footer, PersonsComment },
  setup() {
    const auth = useAuthStore();

    // Pull the real user from the session/local storage via Pinia
    const fullName = computed(() => {
      const n = auth.user?.name ?? "";
      const ln = auth.user?.last_name ?? "";
      const space = n && ln ? " " : "";
      return `${n}${space}${ln}` || "Korisnik";
    });
    const username = computed(() => auth.user?.username ?? auth.user?.user_name ?? "");
    const roleLabel = computed(() => (auth.role || "client"));
    const bio = computed(() => auth.user?.bio ?? "");

    return { auth, fullName, username, roleLabel, bio };
  },
  data() {
    return {
      loading: true,
      comments: [],
      error: null,
    };
  },
  async mounted() {
    if (this.auth.isLoggedIn && this.auth.user?.id) {
      await this.fetchCommentsForProfile(this.auth.user.id);
    } else {
      this.loading = false;
    }
  },
  methods: {
    async fetchCommentsForProfile(userId) {
      this.loading = true;
      this.error = null;
      try {
        // Public GET: /api/users/{user}/comments
        const res = await axios.get(`/api/users/${userId}/comments`);
        const rows = Array.isArray(res?.data?.data) ? res.data.data : [];

        // PersonsComment expects: { id, author, movie, time, content }
        this.comments = rows.map((c) => ({
          id: c.id,
          author: c.user?.username || c.user?.name || "Nepoznato",
          movie: c.movie?.title || "",
          time: c.created_at || "",
          content: c.content || "",
        }));
      } catch (e) {
        console.error("Failed to load comments", e);
        this.error = e?.response?.data?.message || "Greška pri učitavanju komentara.";
        this.comments = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.profile-page { display: flex; flex-direction: column; min-height: 100vh; }
.profile-container { max-width: 980px; margin: 2rem auto; padding: 1.25rem; color: #eaeaea; }
.profile-top { display: flex; gap: 1rem; align-items: center; padding: 1rem; background: #151515; border: 1px solid #262626; border-radius: 10px; }
.profile-icon { width: 72px; height: 72px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: linear-gradient(180deg, #1b1b1b, #252525); border: 1px solid #2f2f2f; }
.profile-info .fullname { margin: 0; font-size: 1.4rem; color: #fff; }
.meta-line { display: flex; gap: 0.75rem; align-items: center; margin-top: 0.35rem; }
.username { color: #bfbfbf; font-weight: 600; }
.role { background: rgba(29, 185, 84, 0.12); color: #bfeec4; padding: 0.2rem 0.5rem; border-radius: 999px; font-size: 0.82rem; border: 1px solid rgba(29, 185, 84, 0.18); }
.bio { margin: 0.5rem 0 0; color: #cfcfcf; font-size: 0.95rem; }
.comments-section { margin-top: 1.25rem; }
.comments-header { display: flex; align-items: baseline; gap: 0.75rem; }
.comments-header h2 { margin: 0; color: #fff; font-size: 1.1rem; }
.comments-header .count { color: #9f9f9f; font-size: 0.95rem; }
.comments-list { margin-top: 0.75rem; display: flex; flex-direction: column; }
.loading, .no-comments { padding: 1rem; color: #bdbdbd; background: #111; border: 1px solid #222; border-radius: 8px; margin-top: 0.75rem; }
</style>
