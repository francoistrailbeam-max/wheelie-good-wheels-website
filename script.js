// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// Contact form (basic submission handler — wire up to Formspree or similar)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.textContent = 'Sent! ✓';
    btn.style.background = '#51b749';
    btn.disabled = true;
    // TODO: Add real form submission (e.g. Formspree, EmailJS)
  });
}
