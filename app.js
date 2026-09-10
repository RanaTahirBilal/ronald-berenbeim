/* ==========================================================================
   Ronald Berenbeim — behaviour.
   Four things only: the nav, scroll reveals, the hero rule drawing itself,
   and a count-up on the two figures that are counts. Years are NOT animated —
   a count-up would render 1971 as "1,971" (learned the hard way).
   ========================================================================== */
(function(){
"use strict";

var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
var HAS_IO  = 'IntersectionObserver' in window;

function once(el, fn, threshold, fallbackMs){
  if(!el) return;
  if(REDUCED || !HAS_IO){ fn(); return; }
  var done = false;
  function go(){ if(done) return; done = true; fn(); }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ go(); io.disconnect(); } });
  }, {threshold: threshold || .2});
  io.observe(el);
  setTimeout(go, fallbackMs || 8000);
}

/* ---------- nav ---------------------------------------------------------- */
(function(){
  var nav = document.getElementById('nav');
  var tog = document.getElementById('navtoggle');
  var list = document.querySelector('.nl');
  if(!nav) return;

  var queued = false;
  function onScroll(){
    queued = false;
    nav.classList.toggle('lit', window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', function(){
    if(!queued){ queued = true; requestAnimationFrame(onScroll); }
  }, {passive:true});

  if(tog && list){
    tog.addEventListener('click', function(){
      var open = list.classList.toggle('open');
      tog.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    list.addEventListener('click', function(e){
      if(e.target.tagName === 'A'){
        list.classList.remove('open');
        tog.setAttribute('aria-expanded','false');
      }
    });
  }
})();

/* ---------- the hero rule draws itself ----------------------------------- */
(function(){
  var hero = document.querySelector('.hero');
  if(!hero) return;
  requestAnimationFrame(function(){ hero.classList.add('go'); });
})();

/* ---------- count-up, counts only ---------------------------------------- */
(function(){
  var els = [].slice.call(document.querySelectorAll('[data-to]'));
  if(!els.length) return;
  els.forEach(function(el){
    var target = parseInt(el.getAttribute('data-to'), 10);
    if(!(target > 0)) return;
    if(REDUCED || !HAS_IO){ el.textContent = target; return; }
    once(el, function(){
      var t0 = null, dur = 1100;
      function step(ts){
        if(t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        /* ease-out so it settles rather than stops dead */
        var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = v;                    /* no grouping: these are small counts */
        if(p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }, .5, 6000);
  });
})();

/* ---------- reveals ------------------------------------------------------ */
(function(){
  var els = [].slice.call(document.querySelectorAll('.rv'));
  if(!els.length) return;
  if(REDUCED || !HAS_IO) return;          /* leave them at their resting state */
  document.documentElement.classList.add('anim');

  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {rootMargin:'0px 0px -7% 0px', threshold:.05});

  els.forEach(function(el,i){
    var r = el.getBoundingClientRect();
    if(r.top < window.innerHeight * 1.25 && r.bottom > 0){ el.classList.add('in'); }
    else { el.style.transitionDelay = Math.min((i % 5) * 70, 280) + 'ms'; io.observe(el); }
  });

  function sweep(){
    els.forEach(function(el){
      if(!el.classList.contains('in') &&
         el.getBoundingClientRect().top < window.innerHeight * 1.25){ el.classList.add('in'); }
    });
  }
  window.addEventListener('scroll', sweep, {passive:true});
  window.addEventListener('pageshow', sweep);
  document.addEventListener('visibilitychange', sweep);

  /* nothing stays invisible */
  setTimeout(function(){
    els.forEach(function(el){ el.style.transitionDelay = '0ms'; el.classList.add('in'); });
  }, 7000);
})();

/* ---------- housekeeping ------------------------------------------------- */
(function(){
  var y = document.getElementById('yr');
  if(y) y.textContent = new Date().getFullYear();
})();

})();
