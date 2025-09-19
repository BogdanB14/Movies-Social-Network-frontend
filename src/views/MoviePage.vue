<template>
    <div class="movie-page">
        <Header></Header>

        <div class="content">
            <div v-if="loading" class="state">Učitavanje…</div>
            <div v-else-if="error" class="state error">{{ error }}</div>

            <div v-else-if="movie" class="movie-details">
                <!-- Poster -->
                <div class="poster-wrapper">
                    <img class="poster" :src="movie.poster" :alt="movie.title" />
                </div>

                <!-- Info -->
                <div class="info">
                    <h1 class="title">{{ movie.title }}</h1>
                    <p class="year">{{ movie.year }}</p>
                    <p v-if="movie.genre" class="genre">{{ movie.genre }}</p>
                    <p v-if="movie.description" class="description">{{ movie.description }}</p>

                    <!-- Admin-only Delete button -->
                    <button v-if="canDelete" class="btn-danger" :disabled="deleteLoading" @click="deleteMovie">
                        {{ deleteLoading ? 'Brisanje…' : 'Obriši film' }}
                    </button>


                </div>
            </div>

            <div v-else class="state">Film nije pronađen.</div>
        </div>

        <!-- Comments (Letterboxd-like panel) -->
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

        <!-- Ako nije ulogovan, možeš prikazati info -->
        <div v-else class="login-hint">
            Prijavi se da bi ostavio komentar.
        </div>
        <Footer></Footer>
    </div>
</template>

<script>
import axios from "axios";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import PersonsComment from "@/components/PersonsComment.vue";
import inception from "../img/inception.jpg";
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
            movie: {
                title: "Inception",
                genre: "Thriller",
                year: "2015",
                description:
                    "Blasdiqewdkaoksdosmdnvowjfiqjdasd aKSDI WIQEJFIF0QKWD KQasdkoasd",
                poster: inception,
            },
            comments: [],
        };
    },
    computed: {
        slug() {
            return this.$route.params.slug || "";
        },
        titleFromSlug() {
            try {
                const spaced = this.slug.replace(/-/g, " ");
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
                const res = await axios.get(
                    "http://localhost/backend/get_comments_by_movie.php",
                    {
                        params: { movieTitle },
                        withCredentials: true,
                    }
                );
                const rows = Array.isArray(res.data) ? res.data : [];
                this.comments = rows.map((c) => ({
                    id: c.id ?? c.comment_id ?? c.ID ?? undefined,
                    author: c.author ?? c.username ?? c.user ?? "Nepoznato",
                    movieName: c.movieName ?? c.movie_title ?? movieTitle,
                    timeItwasCommented: c.timeItwasCommented ?? c.created_at ?? c.time ?? "",
                    content: c.content ?? c.text ?? "",
                }));
            } catch (e) {
                console.error("Greška pri učitavanju komentara za film:", e);
                this.comments = [];
            }
        },
        async deleteMovie() {
            if (!this.movie?.title) return;

            this.deleteLoading = true;
            try {
                const { data } = await axios.post(
                    "http://localhost/backend/delete_movie.php",
                    { title: this.movie.title },
                    { withCredentials: true }
                );
                if (data?.success) {
                    window.alert(data?.message || "Film je uspešno obrisan.");
                    this.$router.push("/");
                } else {
                    window.alert(data?.message || "Brisanje nije uspelo.");
                }
            } catch (e) {
                console.error(e);
                window.alert("Greška pri brisanju filma.");
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
                movieTitle: this.movie?.title || this.titleFromSlug,
            };

            try {
                const res = await axios.post(
                    "http://localhost/backend/add_comment.php",
                    payload,
                    { withCredentials: true }
                );

                const saved =
                    res.data && res.data.comment
                        ? res.data.comment
                        : {
                            author:
                                this.auth.user?.name ||
                                this.auth.user?.username ||
                                "Korisnik",
                            movieName: payload.movieTitle,
                            timeItwasCommented: "now",
                            content: payload.content,
                        };

                this.comments.unshift(saved);
                this.newComment = "";
            } catch (e) {
                console.error(e);
                this.submitError = "Greška pri slanju komentara.";
            } finally {
                this.submitLoading = false;
            }
        },
        async fetchMovie() {
            this.loading = true;
            this.error = "";
            this.movie = null;
            try {
                const res = await axios.get("http://localhost/backend/get_movie.php", {
                    params: { title: this.titleFromSlug },
                    withCredentials: true,
                });
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
        onCommentDeleted(deletedId) {
            this.comments = this.comments.filter((c) => c.id !== deletedId);
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
