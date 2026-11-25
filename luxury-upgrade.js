(() => {
  'use strict';

  // 1. Large Sticky Editorial Manifesto with Scroll-Linked Text Light Fill (no small-text highlighting!)
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const manifestoSec = document.getElementById('manifesto');
  const manifestoText = document.getElementById('lux-manifesto-text');
  const mPillars = [...document.querySelectorAll('.lux-mpillar')];
  let mWordEls = [];

  if (manifestoText && !reducedMotion) {
    const words = manifestoText.textContent.trim().split(/\s+/);
    manifestoText.innerHTML = words.map(w => `<span class="lux-mword">${w}</span>`).join(' ');
    mWordEls = [...manifestoText.querySelectorAll('.lux-mword')];
  } else {
    mPillars.forEach(p => p.classList.add('is-lit'));
  }

  function updateManifestoFill() {
    if (!manifestoSec || !mWordEls.length) return;
    const rect = manifestoSec.getBoundingClientRect();
    const scrollable = Math.max(1, manifestoSec.offsetHeight - window.innerHeight);
    const p = Math.min(1, Math.max(0, -rect.top / scrollable));
    const litCount = Math.floor(p * (mWordEls.length + 1));
    mWordEls.forEach((el, i) => el.classList.toggle('is-lit', i < litCount));
    mPillars.forEach((pil, i) => pil.classList.toggle('is-lit', p > 0.28 + i * 0.22));
  }
  window.addEventListener('scroll', updateManifestoFill, { passive: true });
  updateManifestoFill();

  // Keep hook defined as a no-op so presentation-motion-v3.js stays clean
  window.__updateHeroTextFill = () => {};

  // 2. Velvet film grain & top scroll progress hairline
  const grain = document.createElement('div');
  grain.className = 'lux-grain';
  grain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(grain);

  const bar = document.createElement('div');
  bar.className = 'lux-scroll-bar';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  function updateScrollBar() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    bar.style.width = Math.min(100, Math.max(0, (window.scrollY / max) * 100)).toFixed(2) + '%';
  }
  window.addEventListener('scroll', updateScrollBar, { passive: true });
  updateScrollBar();

  // 3. Smooth pointer coordinates for the 3D museum chiaroscuro light & sculptural parallax
  window.__sitePointer = { nx: 0, ny: 0 };
  window.addEventListener('pointermove', (e) => {
    window.__sitePointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
    window.__sitePointer.ny = -(e.clientY / window.innerHeight) * 2 + 1;
  }, { passive: true });

  // 4. Staggered reveal + bronze spotlight on the 3 Phase Cards (Variant 04)
  const phaseCards = [...document.querySelectorAll('.lux-phase-card')];
  phaseCards.forEach((card, idx) => {
    card.style.transitionDelay = (idx * 90) + 'ms';
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) en.target.classList.add('lux-in');
      });
    }, { threshold: 0.12 });
    phaseCards.forEach(c => io.observe(c));
  } else {
    phaseCards.forEach(c => c.classList.add('lux-in'));
  }

  // 4b. Smart Telegram Topic Selector (Variant 04)
  const topicsWrap = document.getElementById('lux-topics');
  const tgLink = document.getElementById('lux-tg-link');
  const previewMsg = document.getElementById('lux-preview-msg');
  if (topicsWrap && tgLink && previewMsg) {
    topicsWrap.querySelectorAll('.lux-topic-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        topicsWrap.querySelectorAll('.lux-topic-chip').forEach(c => c.classList.remove('is-selected'));
        chip.classList.add('is-selected');
        const msg = chip.dataset.msg || '';
        tgLink.href = 'https://t.me/alonecold?text=' + encodeURIComponent(msg);
        previewMsg.textContent = `Сообщение: «${msg}»`;
      });
    });
  }

  // 5. Smooth illumination of .final-row in Epilogue (large light-fill lives in #manifesto)
  const finalRows = [...document.querySelectorAll('.final-row')];
  if (reducedMotion) {
    finalRows.forEach(r => r.classList.add('is-lit'));
  }
  function updateEpilogueRows() {
    finalRows.forEach((row) => {
      const rr = row.getBoundingClientRect();
      row.classList.toggle('is-lit', rr.top < window.innerHeight * 0.85);
    });
  }
  window.addEventListener('scroll', updateEpilogueRows, { passive: true });
  updateEpilogueRows();

  // 6. Kinetic Scroll-Driven Editorial Marquee (only animates while visible in viewport!)
  const mWrap = document.querySelector('.lux-marquee');
  const mTrack1 = document.getElementById('lux-marquee-1');
  const mTrack2 = document.getElementById('lux-marquee-2');
  if (mWrap && mTrack1 && mTrack2 && !reducedMotion) {
    let pos1 = 0, pos2 = -50;
    let mVel = 0, mLastY = window.scrollY, mDir = 1;
    let marqueeVisible = true;
    let marqueeRaf = null;

    window.addEventListener('scroll', () => {
      const dy = window.scrollY - mLastY;
      mLastY = window.scrollY;
      if (Math.abs(dy) > 0.5) {
        mDir = dy > 0 ? 1 : -1;
        mVel = Math.min(16, Math.abs(dy) * 0.32);
      }
    }, { passive: true });

    function tickMarquee() {
      marqueeRaf = null;
      if (!marqueeVisible || document.hidden) return;
      mVel *= 0.92;
      const speed = 0.038 + mVel * 0.05;
      pos1 -= speed * mDir;
      pos2 += speed * 0.85 * mDir;
      if (pos1 <= -50) pos1 += 50;
      if (pos1 > 0) pos1 -= 50;
      if (pos2 >= 0) pos2 -= 50;
      if (pos2 < -50) pos2 += 50;

      const skew = Math.max(-6, Math.min(6, mVel * 0.4 * mDir));
      mTrack1.style.transform = `translate3d(${pos1.toFixed(3)}%, 0, 0) skewX(${skew.toFixed(2)}deg)`;
      mTrack2.style.transform = `translate3d(${pos2.toFixed(3)}%, 0, 0) skewX(${(-skew * 0.6).toFixed(2)}deg)`;
      marqueeRaf = requestAnimationFrame(tickMarquee);
    }

    if ('IntersectionObserver' in window) {
      const mio = new IntersectionObserver((entries) => {
        marqueeVisible = entries.some(e => e.isIntersecting);
        if (marqueeVisible && !marqueeRaf) marqueeRaf = requestAnimationFrame(tickMarquee);
      }, { rootMargin: '120px 0px' });
      mio.observe(mWrap);
    } else {
      marqueeRaf = requestAnimationFrame(tickMarquee);
    }
  }

  // 7. Tactile magnetic feel on CTA buttons (desktop fine pointer)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('header .contact-link, .work-contact a').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
        btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = '';
      });
    });
  }
})();
