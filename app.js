(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sticky nav ---------- */
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('stuck', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  function revealAll() { revealables.forEach(function (el) { el.classList.add('in'); }); revealables = []; }

  if (!('IntersectionObserver' in window) || reduced) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    revealables.forEach(function (el) { io.observe(el); });

    // Safety sweep: jump navigation and fast scrolling can outrun the observer,
    // so anything already past the fold gets revealed directly.
    var sweepTimer = null;
    function sweep() {
      if (sweepTimer) return;
      sweepTimer = setTimeout(function () {
        sweepTimer = null;
        var h = window.innerHeight;
        revealables = revealables.filter(function (el) {
          if (el.getBoundingClientRect().top >= h) return true;
          el.classList.add('in');
          io.unobserve(el);
          return false;
        });
      }, 80);
    }
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep, { passive: true });
    sweep();
  }

  /* ---------- team tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.team-tab'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.team-panel'));

  function select(tab, focus) {
    tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
    panels.forEach(function (p) {
      p.classList.toggle('active', p.id === tab.getAttribute('aria-controls'));
    });
    if (focus) tab.focus();
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { select(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(tab);
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });

  /* ---------- parallax drift on hero workstreams ---------- */
  if (!reduced && window.matchMedia('(min-width: 1021px)').matches) {
    var stage = document.querySelector('.stage');
    var streams = Array.prototype.slice.call(document.querySelectorAll('.stream'));
    if (stage && streams.length) {
      var raf = null;
      stage.addEventListener('mousemove', function (e) {
        if (raf) return;
        raf = setTimeout(function () {
          raf = null;
          var r = stage.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          streams.forEach(function (s, i) {
            var depth = 5 + i * 3;
            s.style.transform = 'translate3d(' + (dx * depth) + 'px,' + (dy * depth) + 'px,0)';
          });
          raf = null;
        }, 16);
      });
      stage.addEventListener('mouseleave', function () {
        streams.forEach(function (s) { s.style.transform = ''; });
      });
    }
  }
})();
