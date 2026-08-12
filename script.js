/* =========================================================
   1. ANNÉE COURANTE (footer)
========================================================= */
document.getElementById('year').textContent = new Date().getFullYear();

/* =========================================================
   2. MENU MOBILE (burger)
========================================================= */
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', String(isOpen));
});

// referme le menu quand on clique un lien
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

/* =========================================================
   3. NAV — mise en évidence du lien actif au scroll
========================================================= */
const sections   = document.querySelectorAll('main section[id]');
const navAnchors = document.querySelectorAll('.nav__links a');

const setActiveLink = () => {
  let currentId = '';
  const scrollPos = window.scrollY + window.innerHeight * 0.35;

  sections.forEach(section => {
    if (scrollPos >= section.offsetTop) {
      currentId = section.id;
    }
  });

  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${currentId}`);
  });
};

window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();

/* =========================================================
   4. NAV — fond plus opaque après un petit scroll
========================================================= */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 12 ? '0 8px 30px rgba(0,0,0,0.25)' : 'none';
}, { passive: true });

/* =========================================================
   5. ANIMATIONS AU SCROLL (reveal)
========================================================= */
const revealTargets = document.querySelectorAll(
  '.section__head, .about__lead, .about__facts, .stack__col, ' +
  '.timeline__item, .project, .contact__text, .contact__form'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealTargets.forEach(el => revealObserver.observe(el));

/* =========================================================
   6. TERMINAL "WHOIS" — effet machine à écrire (hero, élément signature)
========================================================= */
const whoisBody = document.getElementById('whoisBody');

const whoisLines = [
  { k: 'Domaine',        v: 'grisli.ci' },
  { k: 'Titulaire',      v: 'KOFFI TOA Arnaud Ghislain' },
  { k: 'Alias',          v: 'Grisli' },
  { k: 'Statut',         v: 'ACTIF — disponible', status: true },
  { k: 'Registre',       v: 'IUA — Génie Informatique' },
  { k: 'Serveur actuel', v: 'stage.artci.ci / nic.ci' },
  { k: 'Projet associé', v: 'skanfy (co-fondateur)' },
  { k: 'Certification',  v: 'CCNA — en préparation' },
  { k: 'Localisation',   v: 'Abidjan, Côte d\'Ivoire' },
];

function typeWhois() {
  whoisBody.innerHTML = '';
  let lineIndex = 0;

  function typeLine() {
    const line = whoisLines[lineIndex];
    const label = `${line.k}:`.padEnd(16, ' ');
    const full  = label + line.v;

    const lineEl = document.createElement('div');
    lineEl.innerHTML = `<span class="k">${label}</span><span class="${line.status ? 'status' : 'v'}"></span>`;
    whoisBody.appendChild(lineEl);
    const valueSpan = lineEl.querySelector('span:last-child');

    let charIndex = 0;
    (function step() {
      valueSpan.textContent = full.slice(label.length, label.length + charIndex + 1);
      charIndex++;
      if (label.length + charIndex <= full.length) {
        setTimeout(step, 22 + Math.random() * 30);
      } else {
        lineIndex++;
        if (lineIndex < whoisLines.length) {
          setTimeout(typeLine, 120);
        } else {
          const cursor = document.createElement('span');
          cursor.className = 'whois__cursor';
          whoisBody.appendChild(cursor);
        }
      }
    })();
  }

  typeLine();
}

// ne lance l'animation qu'une fois, quand le hero devient visible
const whoisObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      typeWhois();
      whoisObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

whoisObserver.observe(document.getElementById('whois'));

/* =========================================================
   7. FORMULAIRE DE CONTACT (démo front-end uniquement)
========================================================= */
const form   = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !email || !message) {
    status.textContent = 'Merci de remplir tous les champs.';
    status.style.color = '#F5674A';
    return;
  }
  if (!emailPattern.test(email)) {
    status.textContent = 'Merci d\'indiquer une adresse email valide.';
    status.style.color = '#F5674A';
    return;
  }

  // Ici, brancher un vrai envoi (API, EmailJS, Formspree, etc.)
  status.textContent = `Merci ${name}, votre message a bien été préparé. (Branchez un service d'envoi pour l'expédier réellement.)`;
  status.style.color = '';
  form.reset();
});