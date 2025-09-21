<template>
    <div class="movie-list-container">
        <Header></Header>

        <div class="movie-list-content">
            <div class="sort-bar">
                <span class="sort-label">Sortiraj po:</span>

                <select v-model="titleSort" @change="onTitleSortChange" class="sort-select">
                    <option value="placeholder" disabled>-- Naziv --</option>
                    <option value="title-asc">Naziv (A → Ž)</option>
                    <option value="title-desc">Naziv (Ž → A)</option>
                </select>
                <select v-model="yearSort" @change="onYearSortChange" class="sort-select">
                    <option value="placeholder" disabled>-- Godina --</option>
                    <option value="year-asc">Godina (Rastuće)</option>
                    <option value="year-desc">Godina (Opadajuće)</option>
                </select>

                <div class="search-bar">
                    <input type="text" placeholder="Pretraži film..." v-model="searchQuery" />
                </div>
            </div>

            <p v-if="loading" class="state">Učitavanje…</p>
            <p v-else-if="error" class="state error">{{ error }}</p>

            <div v-else class="movies-grid">
                <OneMovieInList v-for="movie in sortedMovies" :key="movie.id" :title="movie.title" :year="movie.year"
                    :poster="movie.poster || defaultPoster"
                    class="movie-card" @click="goToMovie(movie.title)" />
            </div>
        </div>

        <Footer></Footer>
    </div>
</template>

<script>
import Footer from "@/components/Footer.vue";
import Header from "@/components/Header.vue";
import OneMovieInList from "@/components/OneMovieInList.vue";
import axios from "@/axios"; 

export default {
    name: "MovieList",
    components: { Header, Footer, OneMovieInList },
    data() {
        return {
            movies: [],                 
            loading: false,             
            error: "",                  

            sortOption: "",
            titleSort: "placeholder",
            yearSort: "placeholder",
            searchQuery: "",
            defaultPoster: "https://via.placeholder.com/210x300?text=No+Poster", 
            page: 1,                    
        };
    },
    methods: {
        async fetchMovies(page = 1) {
            this.loading = true;
            this.error = "";
            try {
                const { data } = await axios.get("/api/movies", { params: { page } });
                const payload = Array.isArray(data?.data) ? data.data
                    : Array.isArray(data?.data?.data) ? data.data.data
                        : [];

                this.movies = payload.map((m) => ({
                    id: m.id,
                    title: m.title ?? "",
                    director: m.director ?? "",
                    genre: m.genre ?? "",
                    year: typeof m.year === "number" ? m.year : Number(m.year) || null,
                    description: m.description ?? "",
                    actors: Array.isArray(m.actors) ? m.actors : [],   
                    poster: m.poster || null,                          
                }));
            } catch (e) {
                console.error(e);
                this.error = e?.response?.data?.message || "Greška pri učitavanju filmova.";
                this.movies = [];
            } finally {
                this.loading = false;
            }
        },

        onTitleSortChange() {
            this.sortOption = this.titleSort;
            this.yearSort = "placeholder";
        },
        onYearSortChange() {
            this.sortOption = this.yearSort;
            this.titleSort = "placeholder";
        },
        slugify(str) {
            return str
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");
        },
        goToMovie(title) {
            const realTitleValue = title;
            const slug = this.slugify(title);
            this.$router.push({
                name: "Movie",
                params: {
                    title: slug,
                    realTitle: realTitleValue,
                },
            });
        },
    },
    computed: {
        sortedMovies() {
            const q = this.searchQuery.trim().toLowerCase();
            let arr = q ? this.movies.filter((m) => (m.title || "").toLowerCase().includes(q)) : [...this.movies];

            switch (this.sortOption) {
                case "title-asc":
                    return arr.sort((a, b) => a.title.localeCompare(b.title));
                case "title-desc":
                    return arr.sort((a, b) => b.title.localeCompare(a.title));
                case "year-asc":
                    return arr.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
                case "year-desc":
                    return arr.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
                default:
                    return arr;
            }
        },
    },
    async mounted() {
        await this.fetchMovies(); 
    },
};
</script>

<style>
.sort-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
    padding: 0.75rem 1rem;
    background: #1c1c1c;
    border: 1px solid #1db954;
    border-radius: 8px;
}

.sort-label {
    font-weight: 600;
    font-size: 0.95rem;
    color: #f0f0f0;
}

.sort-select {
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
    border: 1px solid #444;
    border-radius: 6px;
    background-color: #2b2b2b;
    color: #e0e0e0;
    cursor: pointer;
    transition: all 0.2s;
    text-align-last: center;
}

.sort-select:hover {
    background-color: #3a3a3a;
}

.sort-select:focus {
    outline: none;
    border-color: #1db954;
    box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.3);
}

.sort-select option {
    text-align: left;
}

.movie-list-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.movie-list-content {
    flex-grow: 1;
    padding: 2rem;
}

.movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 210px));
    gap: 2rem;
    justify-content: center;
    justify-items: center;
    align-items: start;
}

.movie-card {
    width: 100%;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.movie-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

.search-bar {
    display: flex;
    align-items: center;
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
    border: 1px solid #444;
    border-radius: 6px;
    background-color: #2b2b2b;
    color: #e0e0e0;
    transition: all 0.2s;
    width: 100%;
    max-width: 20vw;
}

.search-bar:hover {
    background-color: #3a3a3a;
}

.search-bar:focus-within {
    outline: none;
    border-color: #1db954;
    box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.3);
}

.search-bar input {
    background: transparent;
    border: none;
    outline: none;
    color: #e0e0e0;
    margin-left: 0.5rem;
    flex: 1;
}

.search-bar input::placeholder {
    color: #aaa;
}

.icon-search img {
    width: 16px;
    height: 16px;
    display: block;
}

.state {
    padding: 0.5rem 0;
    opacity: 0.95;
}

.state.error {
    color: #ff6b6b;
}
</style>
