// Année courante (footer)
document.getElementById('year').textContent = new Date().getFullYear();

// Menu mobile (burger)
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

// Nav : mise en évidence du lien actif au scroll
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

// Nav : fond plus opaque après un petit scroll
const nav = document.getElementById('nav');

/* Tout le mouvement ci-dessous est désactivé si l'utilisateur préfère
   moins d'animations : le contenu reste alors simplement visible. */
const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (motionOK) document.documentElement.classList.add('motion');

// Effets liés au défilement
// Une seule lecture par image : barre de progression, retrait de la nav,
// léger décalage du hero, bandeau et ligne du parcours.
const navProgress  = document.getElementById('navProgress');
const hero         = document.getElementById('hero');
const timeline     = document.querySelector('.timeline');
const marquee      = document.querySelector('.marquee');
const marqueeTrack = marquee ? marquee.firstElementChild : null;
const clamp01 = value => Math.min(1, Math.max(0, value));

// le bandeau glisse avec le défilement : on allonge la piste pour qu'elle couvre l'écran
if (motionOK && marqueeTrack) marqueeTrack.innerHTML = marqueeTrack.innerHTML.repeat(3);

let lastScrollY = window.scrollY;
let scrollTicking = false;

const updateOnScroll = () => {
  scrollTicking = false;
  const y  = window.scrollY;
  const vh = window.innerHeight;

  nav.classList.toggle('is-scrolled', y > 12);
  if (!motionOK) return;

  const maxScroll = document.documentElement.scrollHeight - vh;
  if (navProgress) navProgress.style.transform = `scaleX(${maxScroll > 0 ? clamp01(y / maxScroll).toFixed(4) : 0})`;

  // la nav se retire en descendant et revient dès qu'on remonte
  const navBusy = navLinks.classList.contains('is-open') || nav.contains(document.activeElement);
  if (y <= 480 || navBusy || y < lastScrollY - 6) {
    nav.classList.remove('is-hidden');
    lastScrollY = y;
  } else if (y > lastScrollY + 6) {
    nav.classList.add('is-hidden');
    lastScrollY = y;
  }

  if (hero && y <= hero.offsetHeight) {
    hero.style.setProperty('--hero-p', clamp01(y / hero.offsetHeight).toFixed(3));
  }
  if (marqueeTrack) {
    const rect = marquee.getBoundingClientRect();
    marqueeTrack.style.setProperty('--mq', (clamp01((vh - rect.top) / (vh + rect.height)) * 260).toFixed(1));
  }
  if (timeline) {
    const rect = timeline.getBoundingClientRect();
    timeline.style.setProperty('--tl', clamp01((vh * 0.7 - rect.top) / rect.height).toFixed(3));
  }
};

const requestScrollUpdate = () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateOnScroll);
};
window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate, { passive: true });
updateOnScroll();

// Apparitions au défilement
if (motionOK && 'IntersectionObserver' in window) {
  /* Titres : chaque mot est placé dans un masque pour monter l'un après l'autre. */
  const splitWords = (el) => {
    let index = 0;
    const mask = (content) => {
      const outer = document.createElement('span');
      outer.className = 'w';
      content.classList.add('w__i');
      content.style.setProperty('--i', index);
      index += 1;
      outer.append(content);
      return outer;
    };

    [...el.childNodes].forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { fragment.append(' '); return; }
          const word = document.createElement('span');
          word.textContent = part;
          fragment.append(mask(word));
        });
        node.replaceWith(fragment);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
        const placeholder = document.createComment('');
        node.replaceWith(placeholder);
        placeholder.replaceWith(mask(node));
      }
    });
  };

  const headTargets = [...document.querySelectorAll('.section__head, .footer-cta h2')];
  headTargets.forEach(head => {
    splitWords(head.matches('h2') ? head : head.querySelector('.section__title'));
    head.classList.add('head-reveal');
  });

  const revealTargets = [...document.querySelectorAll(
    '.about__lead, .about__facts, .about-explore, .vision-card, .focus-card, .stack__intro, .stack__col, ' +
    '.timeline__item, .project, .initiatives-intro, .initiative-card, .contact__text, .contact__form, ' +
    '.footer-cta__eyebrow, .footer-cta__copy, .footer-cta__button, .footer-cta__availability, .footer-cta__lee'
  )];
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    // les éléments qui entrent ensemble se suivent à 90 ms d'intervalle
    let order = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      revealObserver.unobserve(el);

      if (el.classList.contains('head-reveal')) {
        el.classList.add('is-visible');
        return;
      }

      const delay = Math.min(order, 5) * 90;
      order += 1;
      el.style.setProperty('--d', `${delay}ms`);
      el.classList.add('is-visible');

      // une fois entré, l'élément retrouve ses propres transitions (survol, etc.)
      window.setTimeout(() => {
        el.classList.remove('reveal', 'is-visible');
        el.style.removeProperty('--d');
      }, delay + 1400);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  [...headTargets, ...revealTargets].forEach(el => revealObserver.observe(el));
}

/* Projets : le visuel s'incline légèrement vers le pointeur (souris uniquement). */
if (motionOK && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.project__visual').forEach(visual => {
    visual.addEventListener('pointermove', (event) => {
      const rect = visual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      visual.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
      visual.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
    });
    visual.addEventListener('pointerleave', () => {
      visual.style.removeProperty('--rx');
      visual.style.removeProperty('--ry');
    });
  });
}

// Cartes interactives : une seule carte ouverte à la fois
document.querySelectorAll('.focus-card').forEach((card) => {
  card.addEventListener('toggle', () => {
    if (!card.open) return;
    document.querySelectorAll('.focus-card').forEach((otherCard) => {
      if (otherCard !== card) otherCard.open = false;
    });
  });
});

// Formulaire de contact (ouvre la messagerie)
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
