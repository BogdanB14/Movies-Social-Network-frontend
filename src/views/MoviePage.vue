<template>
    <div class="movie-page">
        <Header></Header>

        <div class="content">
            <div v-if="loading" class="state">Učitavanje…</div>
            <div v-else-if="error" class="state error">{{ error }}</div>

            <div v-else-if="movie" class="movie-details">
                <div class="poster-wrapper">
                    <img class="poster" :src="movie.poster" :alt="movie.title" />
                </div>

                <div class="info">
                    <h1 class="title">{{ movie.title }}</h1>
                    <p class="year">{{ movie.year }}</p>
                    <p v-if="movie.genre" class="genre">{{ movie.genre }}</p>
                    <p v-if="movie.description" class="description">{{ movie.description }}</p>

                    <button v-if="canDelete" class="btn-danger" :disabled="deleteLoading" @click="deleteMovie">
                        {{ deleteLoading ? 'Brisanje…' : 'Obriši film' }}
                    </button>


                </div>
            </div>

            <div v-else class="state">Film nije pronađen.</div>
        </div>

        <section v-if="movie" class="comments-section">
            <div class="comments-header">
                <h2>Komentari</h2>
                <span class="count" v-if="displayedComments.length">{{ displayedComments.length }}</span>
            </div>

            <div v-if="displayedComments.length" class="comments-list">
                <PersonsComment v-for="(c, idx) in displayedComments" :key="c.id || idx" :id="c.id" :author="c.author"
                    :movie="c.movieName" :time="c.timeItwasCommented" :content="c.content"
                    @deleted="onCommentDeleted" />

            </div>

            <div v-else class="state muted">Još nema komentara za ovaj film.</div>
        </section>

        <div v-if="auth.isLoggedIn" class="add-comment">
            <h3>Dodaj komentar</h3>

            <textarea v-model="newComment" class="comment-textarea" placeholder="Napiši svoj utisak o filmu…"
                rows="4"></textarea>

            <div class="actions">
                <button class="btn-submit" :disabled="submitLoading || !newComment.trim()" @click="submitComment">
                    {{ submitLoading ? 'Slanje…' : 'Objavi' }}
                </button>

                <span v-if="submitError" class="error-inline">{{ submitError }}</span>
            </div>
        </div>

        <div v-else class="login-hint">
            Prijavi se da bi ostavio komentar.
        </div>
        <Footer></Footer>
    </div>
</template>

<script>
import axios from "@/axios";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import PersonsComment from "@/components/PersonsComment.vue";
import { useAuthStore } from "@/stores/auth";
import { computed } from "vue";

export default {
    name: "MoviePage",
    components: { Header, Footer, PersonsComment },
    setup() {
        const auth = useAuthStore();
        const canDelete = computed(() => auth.isLoggedIn && auth.role === "admin");
        return { auth, canDelete };
    },
    data() {
        return {
            loading: false,
            error: "",
            newComment: "",
            submitLoading: false,
            submitError: "",
            deleteLoading: false,
            movie: null,
            comments: [],
        };
    },
    computed: {
        slug() {
            return this.$route.params.title || "";
        },
        titleFromSlug() {
            try {
                const spaced = this.slug.replace(/-/g, " ");
                console.log(spaced);
                return decodeURIComponent(spaced);
            } catch {
                return this.slug.replace(/-/g, " ");
            }
        },
        displayedComments() {
            const title = (this.movie?.title || this.titleFromSlug || "").toLowerCase();
            return this.comments.filter(
                (c) => (c.movieName || "").toLowerCase() === title
            );
        },
    },
    methods: {
        async fetchCommentsForMovie(movieTitle) {
            try {
                let resp;

                if (this.movie?.id) {
                    resp = await axios.get(`/api/movies/${this.movie.id}/comments`);
                } else {
                    const t = encodeURIComponent(movieTitle || this.titleFromSlug);
                    resp = await axios.get(`/api/comments/by-movie-title/${t}`);
                }
                console.log("RESP:")
                console.log(resp.data);
                const rows = Array.isArray(resp?.data?.data) ? resp.data.data : [];

                this.comments = rows.map((c) => ({
                    id: c.id,
                    author:
                        c.user?.username ||
                        c.user?.name ||
                        "Nepoznato",
                    movieName: c.movie?.title || (this.movie?.title || this.titleFromSlug),
                    timeItwasCommented: c.created_at || "",
                    content: c.content || "",
                }));
            } catch (e) {
                console.error("Greška pri učitavanju komentara za film:", e);
                this.comments = [];
            }
        }
        ,
        async deleteMovie() {
            if (!this.movie?.title) return;

            this.deleteLoading = true;
            try {
                await axios.get("/sanctum/csrf-cookie");

                if (this.movie?.id) {
                    await axios.delete(`/api/movies/${this.movie.id}`);
                } else {
                    const t = encodeURIComponent(this.movie.title);
                    await axios.delete(`/api/movies/by-title/${t}`);
                }

                window.alert("Film je uspešno obrisan.");
                this.$router.push("/");
            } catch (e) {
                console.error(e);
                const msg = e?.response?.data?.message || "Greška pri brisanju filma.";
                window.alert(msg);
            } finally {
                this.deleteLoading = false;
            }
        },
        async submitComment() {
            if (!this.newComment.trim()) return;

            this.submitLoading = true;
            this.submitError = "";

            const payload = {
                content: this.newComment.trim(),
            };
            if (this.movie?.id) {
                payload.for_movie = this.movie.id;
            } else {
                payload.movie_title = this.movie?.title || this.titleFromSlug;
            }

            try {
                await axios.get("/sanctum/csrf-cookie");

                const { data } = await axios.post("/api/comments", payload);

                if (data?.success && data?.data) {
                    const c = data.data;

                    const saved = {
                        id: c.id,
                        author:
                            c.user?.username ||
                            c.user?.name ||
                            this.auth.user?.username ||
                            this.auth.user?.name ||
                            "Korisnik",
                        movieName: c.movie?.title || (this.movie?.title || this.titleFromSlug),
                        timeItwasCommented: c.created_at || "now",
                        content: c.content,
                    };

                    this.comments.unshift(saved);
                    this.newComment = "";
                } else {
                    this.submitError = data?.message || "Greška pri slanju komentara.";
                }
            } catch (e) {
                console.error(e);
                this.submitError = e?.response?.data?.message || "Greška pri slanju komentara.";
            } finally {
                this.submitLoading = false;
            }
        },
        async fetchMovie() {
            this.loading = true;
            this.error = "";
            this.movie = null;
            try {
                console.log("Title from slug:")
                console.log(this.titleFromSlug)
                const res = await axios.get('/api/movies/search', { params: { title: this.titleFromSlug }, withCredentials: true })

                this.movie = res.data || null;
                if (!this.movie || !this.movie.title) {
                    this.error = "Film nije pronađen.";
                }
            } catch (e) {
                console.error(e);
                this.error = "Greška pri učitavanju podataka o filmu.";
            } finally {
                this.loading = false;
            }
        },
        async onCommentDeleted(deletedId) {
            if (!deletedId) return;

            try {
                await axios.get("/sanctum/csrf-cookie");
                await axios.delete(`/api/comments/${deletedId}`);
                this.comments = this.comments.filter((c) => c.id !== deletedId);
            } catch (e) {
                console.error(e);
                const msg = e?.response?.data?.message || "Greška pri brisanju komentara.";
                alert(msg);
            }
        },
    },
    async mounted() {
        if (!this.movie || !this.movie.title) {
            await this.fetchMovie();
        }
        const movieTitle = this.movie?.title || this.titleFromSlug;
        if (movieTitle) {
            await this.fetchCommentsForMovie(movieTitle);
        }
    },
};
</script>


<style scoped>
.movie-page {
    display: flex;
    flex-direction: column;
    background-color: #14181c;
    /* Letterboxd dark */
    color: #eaeaea;
    min-height: 100vh;
    align-items: center;
    justify-content: flex-start;
}

.content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4rem 2rem;
    width: 100%;
}

.state {
    padding: 2rem 0;
    opacity: 0.9;
    font-size: 1.1rem;
}

.state.error {
    color: #ff6b6b;
}

.state.muted {
    color: #9ab;
}

.movie-details {
    display: flex;
    flex-direction: row;
    gap: 3rem;
    max-width: 1000px;
    width: 100%;
    align-items: flex-start;
    background-color: #1c2025;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.poster-wrapper {
    flex: 0 0 280px;
}

.poster {
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
    object-fit: cover;
}

.info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
}

.year {
    font-size: 1.2rem;
    color: #9ab;
    margin: 0;
}

.genre {
    font-size: 1.1rem;
    color: #1db954;
    font-weight: 600;
}

.description {
    font-size: 1.05rem;
    line-height: 1.6;
    color: #d0d0d0;
    max-width: 600px;
}

/* --- Comments panel --- */
.comments-section {
    width: 100%;
    max-width: 1000px;
    background: #171b20;
    border: 1px solid rgba(157, 204, 255, 0.08);
    border-radius: 12px;
    margin: 1.5rem 0 3rem;
    padding: 1.25rem 1.5rem;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
}

.comments-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid rgba(157, 204, 255, 0.08);
    padding-bottom: 0.75rem;
    margin-bottom: 1rem;
}

.comments-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: #e6f0ff;
    letter-spacing: 0.2px;
}

.comments-header .count {
    background: #1db95422;
    color: #9ff5bf;
    border: 1px solid #1db95455;
    padding: 0.1rem 0.5rem;
    border-radius: 999px;
    font-size: 0.85rem;
}

.comments-list {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
}

.add-comment {
    margin-top: 1.25rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(157, 204, 255, 0.08);
}

.add-comment h3 {
    margin: 0 0 0.75rem 0;
    font-size: 1.1rem;
    color: #e6f0ff;
}

.comment-textarea {
    width: 50vw;
    background: #14181c;
    color: #eaeaea;
    border: 1px solid #2a2f36;
    border-radius: 10px;
    padding: 0.9rem 0.5rem;
    outline: none;
    resize: vertical;
    transition: border-color .15s ease, box-shadow .15s ease;
}

.comment-textarea:focus {
    border-color: #1db954;
    box-shadow: 0 0 0 2px rgba(29, 185, 84, .18);
}

.actions {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    padding-bottom: 2rem;
}

.btn-submit {
    background: #1db954;
    color: #0b0f14;
    border: none;
    border-radius: 999px;
    padding: 0.55rem 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform .05s ease, box-shadow .15s ease;
}

.btn-submit:disabled {
    opacity: .6;
    cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
    box-shadow: 0 6px 18px rgba(29, 185, 84, .25);
    transform: translateY(-1px);
}

.error-inline {
    color: #ff6b6b;
    font-size: .95rem;
}

.login-hint {
    margin-top: 1rem;
    color: #9ab;
    font-size: 0.95rem;
    padding-bottom: 2rem;
}

.btn-danger {
    margin-top: .5rem;
    background: #e74c3c;
    color: #0b0f14;
    border: none;
    border-radius: 999px;
    padding: 0.55rem 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform .05s ease, box-shadow .15s ease, opacity .15s ease;
}

.btn-danger:hover {
    box-shadow: 0 6px 18px rgba(231, 76, 60, .25);
    transform: translateY(-1px);
}

.btn-danger:disabled {
    opacity: .6;
    cursor: not-allowed;
}
</style>
