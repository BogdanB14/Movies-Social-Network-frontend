<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-links">
        <a href="about-us">O nama</a>
        <router-link to="/help">Pomoć</router-link>
      </div>
      <div class="footer-center">
        <p>© 2025 MovieManiacs. All rights reserved by Bogi and Ćofi.</p>
      </div>
      <div class="footer-icons">
        <a href="https://www.instagram.com/movie_._maniacs/" target="_blank" aria-label="Instagram">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" 
               viewBox="0 0 24 24" class="icon">
            <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.75-.5a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"/>
          </svg>
        </a>

        <a href="https://x.com/Movie_Maniacs45" target="_blank" aria-label="Twitter">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" 
               viewBox="0 0 24 24" class="icon">
            <path d="M22 5.8c-.8.4-1.7.6-2.6.8a4.5 4.5 0 0 0 2-2.5c-.9.6-1.9 1-3 1.2A4.5 4.5 0 0 0 12 9a12.7 12.7 0 0 1-9.3-4.7 4.5 4.5 0 0 0 1.4 6A4.4 4.4 0 0 1 2 9.6v.1a4.5 4.5 0 0 0 3.6 4.4 4.6 4.6 0 0 1-2 .1 4.5 4.5 0 0 0 4.2 3.1A9 9 0 0 1 2 19.5 12.7 12.7 0 0 0 8.9 21c7.5 0 11.6-6.3 11.6-11.8v-.5c.8-.6 1.6-1.4 2.5-2.3Z"/>
          </svg>
        </a>
        <a href="https://www.facebook.com/profile.php?id=61580938890582" target="_blank" aria-label="Facebook">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" 
               viewBox="0 0 24 24" class="icon">
            <path d="M13 3h4V0h-4c-2.8 0-5 2.2-5 5v3H5v4h3v12h4V12h3.1l.9-4H12V5c0-.6.4-1 1-1Z"/>
          </svg>
        </a>
      </div>
    </div>
  </footer>
</template>
<script>
export default {
  name: "Footer",
};
</script>
<style scooped>
.footer {
  background-color: #1c1c1c;
  color: #fff; 
  padding: 0.5rem 1rem;
  min-width: 100vw;
  display: flex;
  min-height: 20vh;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.5);
}
.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 60vw;
  margin: 0 auto;
  width: 100%;
  flex-wrap: wrap;
}
.footer-links {
  display: flex;
  gap: 2rem;
}
.footer-links a {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.4rem;
  transition: color 0.3s;
  background: none;   
}
.footer-links a:hover {
  color: #1db954;     
}
.footer-center {
  font-size: 1rem;
  text-align: center;
  flex: 1;
}
.footer-icons {
  display: flex;
  gap: 2rem;
}
.footer-icons a {
  color: #fff;        
  transition: color 0.3s;
  background: none;   
  display: flex;      
  align-items: center;
}
.footer-icons a:hover {
  color: #1db954; 
}
.icon {
  width: 3vw;
  height: 3vh;
  display: block;   
}
</style>









