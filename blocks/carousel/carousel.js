import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Loads and decorates the carousel block.
 * Expected row structure per slide: image (optional) | heading, text, link
 * @param {Element} block The carousel block element
 */
export default function decorate(block) {
  // Build slides container
  const slidesContainer = document.createElement('div');
  slidesContainer.className = 'carousel-slides';

  [...block.children].forEach((row) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';

    [...row.children].forEach((cell) => {
      const picture = cell.querySelector('picture');
      if (picture && cell.children.length === 1) {
        // image-only cell
        cell.className = 'carousel-slide-image';
        slide.prepend(cell);
      } else {
        cell.className = 'carousel-slide-body';
        slide.append(cell);
      }
    });

    slidesContainer.append(slide);
    row.remove();
  });

  // Optimize images
  slidesContainer.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.append(slidesContainer);

  const slides = [...slidesContainer.querySelectorAll('.carousel-slide')];
  const total = slides.length;
  if (total <= 1) return;

  // Navigation arrows
  const prevBtn = document.createElement('button');
  prevBtn.className = 'carousel-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '&#8249;';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'carousel-next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '&#8250;';

  block.append(prevBtn, nextBtn);

  // Dot navigation
  const nav = document.createElement('div');
  nav.className = 'carousel-nav';
  nav.setAttribute('role', 'tablist');

  let current = 0;
  let dots;

  function updateDots(index) {
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function scrollToSlide(index) {
    const clamp = Math.max(0, Math.min(index, total - 1));
    slides[clamp].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    current = clamp;
    updateDots(current);
  }

  dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.setAttribute('role', 'tab');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => scrollToSlide(i));
    nav.append(dot);
    return dot;
  });

  block.append(nav);

  prevBtn.addEventListener('click', () => scrollToSlide(current - 1));
  nextBtn.addEventListener('click', () => scrollToSlide(current + 1));

  // Update active dot on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = slides.indexOf(entry.target);
          if (idx !== -1) {
            current = idx;
            updateDots(idx);
          }
        }
      });
    },
    { root: slidesContainer, threshold: 0.5 },
  );

  slides.forEach((slide) => observer.observe(slide));
}
