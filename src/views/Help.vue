<template>
  <div class="help-page">
    <Header></Header>

    <main class="help-content">
      <h1 class="help-title">Šta Vam sajt MovieManiacs pruža:</h1>

      <section class="help-grid">
        
        <div class="help-box">
          <h2>Pretraži filmove koje si odgledao</h2>
          <p>
            Koristi našu pretragu da brzo pronađeš filmove koje si već gledao. 
            Na taj način možeš da vodiš evidenciju o onome što si pogledao i 
            da lakše otkriješ nove filmove slične tvojim omiljenima.
          </p>
        </div>

        
        <div class="help-box placeholder">
          <img src="../img/goredesno.jpg" alt="">
        </div>

        
        <div class="help-box placeholder">
          <img src="../img/dolelevo.png" alt="">
        </div>

        
        <div class="help-box">
          <h2>Recite nam šta ste videli</h2>
          <p>
            Napravite svoj nalog i podelite mišljenja o filmovima sa zajednicom. 
            Vaše recenzije i komentari pomažu drugim korisnicima da otkriju 
            šta vredi pogledati i otvore prostor za diskusiju.
          </p>
        </div>
      </section>
    </main>

    <Footer></Footer>
  </div>
</template>

<script>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

export default {
  name: "HelpPage",
  components: { Header, Footer },
};
</script>

<style scoped>

.help-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.help-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.help-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #1db954;
}

.help-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1.5rem;
}

.help-box {
  background-color: #2b2b2b;
  border-radius: 10px;
  padding: 1.5rem;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.help-box h2 {
  margin-bottom: 0.8rem;
  color: #1db954;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #444;
  color: #aaa;
  font-size: 0.95rem;
  font-style: italic;
}

img{
    height: 300px;
    width: 400px;
}

</style>
