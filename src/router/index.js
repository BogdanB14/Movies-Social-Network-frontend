import { createRouter, createWebHistory } from "vue-router";
import AboutUs from "@/views/AboutUs.vue";
import HomePage from "@/views/HomePage.vue";
import LogInPage from "@/views/LogInPage.vue";
import MoviePage from "@/views/MoviePage.vue";
import ProfilePage from "@/views/ProfilePage.vue";
import SignInPage from "@/views/SignInPage.vue";
import Footer from "@/components/Footer.vue";
import Header from "@/components/Header.vue";
import SignUpForm from "@/components/SignUpForm.vue";
import LogInForm from "@/components/LogInForm.vue";
import HelpPage from '@/views/Help.vue';
import AddMoviePage from '@/views/AddMovie.vue'

const routes = [
  { path: "/", name: "Home", component: HomePage },
  { path: "/footer", name: "Footer", component: Footer },
  { path: "/header", name: "Header", component: Header },
  { path: "/about-us", name: "AboutUs", component: AboutUs },
  { path: "/sign-in", name: "SignIn", component: SignInPage },
  { path: "/log-in", name: "LogIn", component: LogInPage },
  { path: "/profile", name: "ProfilePage", component: ProfilePage },
  { path: "/sign-up-form", name: "SignUpForm", component: SignUpForm },
  { path: "/log-in-form", name: "LogInForm", component: LogInForm },
  { path: "/movie/:title", name: "Movie", component: MoviePage, props: true},
  { path: '/help', name: 'Help', component: HelpPage},
  { path: "/add-movie", name: "AddMovie", component: AddMoviePage},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
