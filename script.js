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
  '.section__head, .about__lead, .about__facts, .about-explore, .vision-card, .stack__col, ' +
  '.timeline__item, .project, .initiatives-intro, .initiative-card, .contact__text, .contact__form'
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

/* Profil: les valeurs s'écrivent une fois quand la fiche entre à l'écran. */
const profileCard = document.getElementById('whois');
if (profileCard) {
  const profileValues = [...profileCard.querySelectorAll('.whois__body .v')];
  const fullValues = profileValues.map(value => value.textContent);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let profileAnimationStarted = false;

  const typeProfile = () => {
    if (profileAnimationStarted || reduceMotion.matches) return;
    profileAnimationStarted = true;
    profileValues.forEach(value => { value.textContent = ''; });

    let row = 0;
    const typeRow = () => {
      const value = profileValues[row];
      const fullText = fullValues[row];
      let character = 0;
      value.classList.add('is-typing');

      const typeCharacter = () => {
        value.textContent = fullText.slice(0, character + 1);
        character += 1;
        if (character < fullText.length) {
          window.setTimeout(typeCharacter, 24);
          return;
        }

        value.classList.remove('is-typing');
        row += 1;
        if (row < profileValues.length) window.setTimeout(typeRow, 120);
      };

      typeCharacter();
    };

    typeRow();
  };

  if (reduceMotion.matches) {
    profileAnimationStarted = true;
  } else {
    const profileObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        profileObserver.disconnect();
        typeProfile();
      }
    }, { threshold: 0.3 });
    profileObserver.observe(profileCard);
  }
}

/* =========================================================
   6. CARTES INTERACTIVES — une seule carte ouverte à la fois
========================================================= */
document.querySelectorAll('.focus-card').forEach((card) => {
  card.addEventListener('toggle', () => {
    if (!card.open) return;
    document.querySelectorAll('.focus-card').forEach((otherCard) => {
      if (otherCard !== card) otherCard.open = false;
    });
  });
});

/* =========================================================
   7. FORMULAIRE DE CONTACT (ouvre la messagerie)
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

  const subject = encodeURIComponent(`Message de ${name} depuis le portfolio`);
  const body = encodeURIComponent(`${message}\n\nRéponse à : ${email}`);
  status.textContent = 'Votre application de messagerie va s’ouvrir pour envoyer le message.';
  status.style.color = '';
  window.location.href = `mailto:koffitoaghislain@gmail.com?subject=${subject}&body=${body}`;
});
