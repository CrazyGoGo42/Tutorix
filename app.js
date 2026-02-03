// Navigation & Parallax
const nav = document.querySelector(".nav-island");
const heroBg = document.querySelector(".hero-bg");
const heroContent = document.querySelector(".hero-content");

const scrollThreshold = 50;
const isMobile = () => window.innerWidth <= 768;

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  // Nav shrink (nur desktop)
  if (!isMobile()) {
    if (scrollY > scrollThreshold) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  }

  // Parallax fuer hero background
  if (heroBg) {
    heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
  }

  // Fade hero content
  if (heroContent) {
    const opacity = Math.max(0, 1 - scrollY / 400);
    heroContent.style.opacity = opacity;
    heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
  }
});

// Smooth scroll fuer den Pfeil
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// Fuer den Footer das aktuelle Jahr anzeigen
document.getElementById("year").textContent = new Date().getFullYear();
