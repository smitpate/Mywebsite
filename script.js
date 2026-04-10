/* ═══════════════════════════════════════════════════════════════
   SMIT PATEL — PORTFOLIO  |  Interactive Engine
   Three.js · GSAP · Lenis · Custom Cursor · Preloader
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ─── UTILS ───
  const qs = (s, p) => (p || document).querySelector(s);
  const qsa = (s, p) => [...(p || document).querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;

  // ─── PRELOADER ───
  function initPreloader(onComplete) {
    const el = qs("#preloader");
    const counter = qs("#preloader-counter");
    const fill = qs("#preloader-fill");
    const letters = qsa(".preloader-text span");
    if (!el) { onComplete(); return; }

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(el, {
          yPercent: -100,
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            el.style.display = "none";
            onComplete();
          },
        });
      },
    });

    // Counter 0 → 100
    tl.to({ val: 0 }, {
      val: 100,
      duration: 2.2,
      ease: "power2.inOut",
      onUpdate: function () {
        const v = Math.round(this.targets()[0].val);
        counter.textContent = v;
        fill.style.width = v + "%";
      },
    });

    // Letters stagger in
    tl.from(letters, {
      y: 30,
      opacity: 0,
      stagger: 0.04,
      duration: 0.5,
      ease: "power2.out",
    }, "-=1.5");

    // Pause at 100 briefly
    tl.to({}, { duration: 0.3 });
  }

  // ─── CUSTOM CURSOR ───
  function initCursor() {
    if (window.matchMedia("(pointer:coarse)").matches) return;

    const dot = qs("#cursor-dot");
    const ring = qs("#cursor-ring");
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
    });

    // ring follows with lerp
    function tick() {
      rx = lerp(rx, mx, 0.12);
      ry = lerp(ry, my, 0.12);
      ring.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
      requestAnimationFrame(tick);
    }
    tick();

    // Hover state
    const hovers = qsa('a, button, .project-card, .bento-item, .cert-item, .contact-link, .magnetic');
    hovers.forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
    });

    document.addEventListener("mousedown", () => ring.classList.add("click"));
    document.addEventListener("mouseup", () => ring.classList.remove("click"));
  }

  // ─── THREE.JS PARTICLE FIELD ───
  function initParticles() {
    const canvas = qs("#hero-canvas");
    if (!canvas || typeof THREE === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles
    const count = window.innerWidth < 768 ? 300 : 600;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 12;
      pos[i + 1] = (Math.random() - 0.5) * 12;
      pos[i + 2] = (Math.random() - 0.5) * 8;
      vel[i] = (Math.random() - 0.5) * 0.003;
      vel[i + 1] = (Math.random() - 0.5) * 0.003;
      vel[i + 2] = (Math.random() - 0.5) * 0.001;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.025,
      color: 0x818cf8,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Secondary particles (cyan accents)
    const count2 = Math.floor(count * 0.3);
    const geo2 = new THREE.BufferGeometry();
    const pos2 = new Float32Array(count2 * 3);
    for (let i = 0; i < count2 * 3; i += 3) {
      pos2[i] = (Math.random() - 0.5) * 14;
      pos2[i + 1] = (Math.random() - 0.5) * 14;
      pos2[i + 2] = (Math.random() - 0.5) * 6;
    }
    geo2.setAttribute("position", new THREE.BufferAttribute(pos2, 3));
    const mat2 = new THREE.PointsMaterial({
      size: 0.018,
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    });
    const particles2 = new THREE.Points(geo2, mat2);
    scene.add(particles2);

    camera.position.z = 5;

    let mouseX = 0, mouseY = 0;
    document.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
      requestAnimationFrame(animate);

      // Gentle rotation + mouse influence
      particles.rotation.x += 0.0002;
      particles.rotation.y += 0.0003;
      particles.rotation.x += mouseY * 0.0002;
      particles.rotation.y += mouseX * 0.0002;

      particles2.rotation.x -= 0.00015;
      particles2.rotation.y -= 0.0002;
      particles2.rotation.x += mouseY * 0.00015;
      particles2.rotation.y += mouseX * 0.00015;

      // Drift particles
      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < count * 3; i += 3) {
        positions[i] += vel[i];
        positions[i + 1] += vel[i + 1];
        positions[i + 2] += vel[i + 2];

        // Boundary wrap
        if (Math.abs(positions[i]) > 7) vel[i] *= -1;
        if (Math.abs(positions[i + 1]) > 7) vel[i + 1] *= -1;
        if (Math.abs(positions[i + 2]) > 5) vel[i + 2] *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ─── LENIS SMOOTH SCROLL ───
  function initSmoothScroll() {
    if (typeof Lenis === "undefined") return null;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return lenis;
  }

  // ─── GSAP ANIMATIONS ───
  function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero text split
    if (typeof SplitType !== "undefined") {
      const heroTitle = qs("#hero-title");
      if (heroTitle) {
        const split = new SplitType("#hero-title .word", { types: "chars" });
        gsap.from(split.chars, {
          y: 80,
          opacity: 0,
          rotateX: -40,
          stagger: 0.03,
          duration: 0.9,
          ease: "power3.out",
          delay: 2.6, // after preloader
        });
      }
    }

    // Section reveals
    qsa(".reveal").forEach((el) => {
      gsap.fromTo(el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        }
      );
    });

    // Bento cards stagger
    const bentoItems = qsa(".bento-item");
    if (bentoItems.length) {
      gsap.fromTo(bentoItems,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".bento-grid",
            start: "top 80%",
            once: true,
          },
        }
      );
    }

    // Project cards stagger
    const projectCards = qsa(".project-card");
    if (projectCards.length) {
      gsap.fromTo(projectCards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".projects-grid",
            start: "top 80%",
            once: true,
          },
        }
      );
    }

    // Timeline cards slide in
    const timelineCards = qsa(".timeline-card");
    timelineCards.forEach((card) => {
      gsap.fromTo(card,
        { x: -30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    // Cert items slide in from right
    const certItems = qsa(".cert-item");
    certItems.forEach((item, i) => {
      gsap.fromTo(item,
        { x: 30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          delay: i * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            once: true,
          },
        }
      );
    });

    // Section heading parallax
    qsa(".section-head h2").forEach((h) => {
      gsap.fromTo(h,
        { y: 30 },
        {
          y: -10,
          ease: "none",
          scrollTrigger: {
            trigger: h,
            start: "top 90%",
            end: "bottom 20%",
            scrub: 1,
          },
        }
      );
    });
  }

  // ─── STAT COUNTERS ───
  function initCounters() {
    qsa("[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;

      gsap.fromTo(el,
        { textContent: 0 },
        {
          textContent: target,
          duration: 2,
          ease: "power1.out",
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
          onUpdate: function () {
            el.textContent = Math.round(parseFloat(el.textContent));
          },
        }
      );
    });
  }

  // ─── NAVIGATION ───
  function initNav() {
    const navbar = qs("#navbar");
    const toggle = qs("#mobile-toggle");
    const menu = qs("#mobile-menu");
    const links = qsa("#nav-links a");
    const sections = qsa("section[id]");

    // Scroll class
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 50);
    });

    // Mobile menu
    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const isOpen = menu.style.display === "block";
        menu.style.display = isOpen ? "none" : "block";
        toggle.setAttribute("aria-label", isOpen ? "Open menu" : "Close menu");
      });
      qsa("a", menu).forEach((a) =>
        a.addEventListener("click", () => (menu.style.display = "none"))
      );
    }

    // Active link
    window.addEventListener("scroll", () => {
      let current = "";
      sections.forEach((s) => {
        if (window.scrollY >= s.offsetTop - 150) current = s.id;
      });
      links.forEach((a) => {
        a.classList.toggle("active", a.getAttribute("href") === "#" + current);
      });
    });
  }

  // ─── MAGNETIC BUTTONS ───
  function initMagnetic() {
    if (window.matchMedia("(pointer:coarse)").matches) return;

    qsa(".magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
        btn.style.transition = "transform 0.4s cubic-bezier(0.16,1,0.3,1)";
        setTimeout(() => (btn.style.transition = ""), 400);
      });
    });
  }

  // ─── CARD TILT ───
  function initTilt() {
    if (window.matchMedia("(pointer:coarse)").matches) return;

    qsa(".bento-item").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
        card.style.transition = "transform 0.5s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.35s";
        setTimeout(() => (card.style.transition = ""), 500);
      });
    });
  }

  // ─── FOOTER YEAR ───
  function initFooter() {
    const yearEl = qs("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // ─── BOOT SEQUENCE ───
  document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide icons
    if (typeof lucide !== "undefined") lucide.createIcons();

    initFooter();
    initNav();

    // Preloader → then everything else
    initPreloader(() => {
      initSmoothScroll();
      initParticles();
      initAnimations();
      initCounters();
      initCursor();
      initMagnetic();
      initTilt();
    });
  });
})();
