// ===== MOTION LAYER: GSAP ScrollTrigger (no Lenis) =====

// ===== HONEYPOT (anti-spam) =====
// Auto-inject a hidden field on every form and mirror it into every
// POST to /api/notion-submit. Bots fill all inputs; humans leave this empty.
(function(){
  const HP_NAME = 'website';
  const style = document.createElement('style');
  style.textContent = '.hp-field{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;}';
  document.head.appendChild(style);

  const injectHoneypots = () => {
    document.querySelectorAll('form').forEach(form => {
      if (form.querySelector('input[name="' + HP_NAME + '"]')) return;
      const input = document.createElement('input');
      input.type = 'text';
      input.name = HP_NAME;
      input.className = 'hp-field';
      input.tabIndex = -1;
      input.autocomplete = 'off';
      input.setAttribute('aria-hidden', 'true');
      form.appendChild(input);
    });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHoneypots);
  } else {
    injectHoneypots();
  }

  // Patch fetch: attach the honeypot value to any notion-submit POST that doesn't already include it.
  const origFetch = window.fetch.bind(window);
  window.fetch = function(url, opts) {
    try {
      const u = typeof url === 'string' ? url : (url && url.url) || '';
      if (u.includes('/api/notion-submit') && opts && opts.method === 'POST' && typeof opts.body === 'string') {
        const body = JSON.parse(opts.body);
        if (body && typeof body === 'object' && !('website' in body)) {
          const hp = document.querySelector('input[name="' + HP_NAME + '"]');
          body.website = hp ? hp.value : '';
          opts = Object.assign({}, opts, { body: JSON.stringify(body) });
        }
      }
    } catch (_) { /* fall through */ }
    return origFetch(url, opts);
  };
})();

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ===== GSAP REVEALS =====
gsap.utils.toArray('.animate').forEach((el, idx) => {
  gsap.fromTo(el,
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true
      }
    }
  );
});

// ===== ANIMATED COUNTERS =====
gsap.utils.toArray('[data-target]').forEach(el => {
  const target = parseInt(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  gsap.fromTo(el,
    { textContent: 0 },
    {
      textContent: target,
      duration: 1.4,
      snap: { textContent: 1 },
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 75%',
        once: true
      },
      onUpdate: function() {
        el.textContent = Math.floor(this.targets()[0].textContent).toLocaleString('nl-BE') + suffix;
      }
    }
  );
});

// ===== MAGNETIC BUTTONS =====
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    gsap.to(btn, { duration: 0.3, overwrite: 'auto' });
  });
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const distance = Math.sqrt(x * x + y * y);
    if (distance < 60) {
      gsap.to(btn, {
        x: x * 0.12,
        y: y * 0.12,
        duration: 0.25,
        overwrite: 'auto'
      });
    }
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
  });
});

// ===== 3D CARD TILT (for drug cards) =====
document.querySelectorAll('.drug-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    gsap.to(card, {
      rotateX: y * -4,
      rotateY: x * 4,
      duration: 0.3,
      overwrite: 'auto'
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
      overwrite: 'auto'
    });
  });
});

// ===== HIDE NAV DURING PSA SECTION (scroll-linked, confined to section 03) =====
// Nav hides as PSA pins, stays hidden while the video scrubs, and reappears
// once the user scrolls past 2/3 of section 03 (i.e. the video has finished).
const psaScrollEl = document.querySelector('.psa__scroll');
const navEl = document.querySelector('.nav');
if (psaScrollEl && navEl) {
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: psaScrollEl,
      start: 'top top',                                                    // PSA pins = start hiding
      end: () => '+=' + ((psaScrollEl.offsetHeight - window.innerHeight) * (2 / 3)), // video has finished scrubbing
      scrub: 0.4,
      invalidateOnRefresh: true,
    }
  });
  // Quick fade out as soon as PSA pins (first 7% of the 2/3 range)
  tl.to(navEl, { autoAlpha: 0, y: -24, duration: 0.07 });
  // Stay hidden while the video scrubs through
  tl.to(navEl, { autoAlpha: 0, y: -24, duration: 0.86 });
  // Fade back in right as the video finishes -- nav visible for the last 1/3 of section 03 and for section 04
  tl.to(navEl, { autoAlpha: 1, y: 0, duration: 0.07 });
}

// ===== PSA SCROLL-SCRUBBED VIDEO (Apple Vision Pro style) =====
const psaVideo = document.querySelector('.psa__video');
if (psaVideo) {
  psaVideo.pause();
  psaVideo.currentTime = 0;

  const PSA_START = 2;
  const PSA_END = 22;

  const buildScrub = () => {
    const duration = psaVideo.duration;
    if (!duration || !isFinite(duration)) return;

    // Set initial frame
    psaVideo.currentTime = PSA_START;

    // Scrub currentTime via proxy from PSA_START to PSA_END.
    // Video finishes scrubbing at 2/3 of the section 03 scroll range --
    // the last 1/3 is "post-video" space where the nav reappears.
    const proxy = { t: PSA_START };
    const scrubSpanFull = psaScrollEl.offsetHeight - window.innerHeight;
    const videoEndPx = Math.round(scrubSpanFull * (2 / 3));
    gsap.to(proxy, {
      t: PSA_END,
      ease: 'none',
      onUpdate: () => {
        if (Math.abs(psaVideo.currentTime - proxy.t) > 0.01) {
          psaVideo.currentTime = proxy.t;
        }
      },
      scrollTrigger: {
        trigger: '.psa__scroll',
        start: 'top top',
        end: '+=' + videoEndPx,
        scrub: 0.5
      }
    });

    // Overlay text timeline:
    //  - fades OUT over the first 3 seconds of video (2s -> 5s)
    //  - stays hidden while the video plays out
    //  - SNAPS back to opacity 1 right at the video's end (video time 22s)
    const videoRange = PSA_END - PSA_START;                // 20s
    const fadeOutFrac = 3 / videoRange;                    // 0.15  (3s of video)
    const tailFrac    = 0.02 / videoRange;                 // sliver -- snap lands on the final frame
    const holdFrac    = 1 - fadeOutFrac - tailFrac;        // middle hold

    const overlayTl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.psa__scroll',
        start: 'top top',
        end: '+=' + videoEndPx,   // same end as video scrub -> video ends at timeline end
        scrub: true,
      }
    });
    overlayTl.to('.psa__overlay', { opacity: 0, duration: fadeOutFrac });
    overlayTl.to('.psa__overlay', { opacity: 0, duration: holdFrac });
    overlayTl.set('.psa__overlay', { opacity: 1 });
    overlayTl.to('.psa__overlay', { opacity: 1, duration: tailFrac });
  };

  if (psaVideo.readyState >= 1) {
    buildScrub();
  } else {
    psaVideo.addEventListener('loadedmetadata', buildScrub, { once: true });
    // Safari sometimes needs a nudge
    psaVideo.load();
  }
}

// ===== HERO PARALLAX (for pages with .hero__video) =====
const heroVideo = document.querySelector('.hero__video');
if (heroVideo) {
  gsap.fromTo(heroVideo,
    { y: 0 },
    {
      y: 120,
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      }
    }
  );
}
