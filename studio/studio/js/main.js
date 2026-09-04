/* =========================================================
   STUDIO — main.js
   Vanilla JavaScript only, zero external libraries. Each init
   guard-clauses missing elements so it is safe to load anywhere.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Mobile navigation ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("primaryNav");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    // Close after tapping a link
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", close);
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        close();
        toggle.focus();
      }
    });
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Smooth-scroll for in-page anchors ---------- */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start"
        });
        // move focus for a11y without a second jump
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ---------- Work filter ---------- */
  function initWorkFilter() {
    var grid = document.getElementById("workGrid");
    if (!grid) return;
    var buttons = document.querySelectorAll(".filter");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".work-card"));
    var empty = document.getElementById("workEmpty");
    if (!buttons.length || !cards.length) return;

    function apply(filter) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = filter === "all" || card.getAttribute("data-category") === filter;
        if (match) {
          card.hidden = false;
          shown++;
        } else {
          card.hidden = true;
        }
      });
      if (empty) empty.hidden = shown !== 0;
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        apply(btn.getAttribute("data-filter"));
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up stats ---------- */
  function initStatCounters() {
    var nums = document.querySelectorAll(".stat__num[data-count]");
    if (!nums.length) return;

    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var start = null;
      var dur = 1400;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      nums.forEach(run);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          run(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contact form (front-end validation) ---------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    var success = document.getElementById("formSuccess");

    function validateField(field) {
      var control = field.querySelector("input, select, textarea");
      if (!control) return true;
      var ok = control.checkValidity();
      field.classList.toggle("is-invalid", !ok);
      return ok;
    }

    form.querySelectorAll(".field").forEach(function (field) {
      var control = field.querySelector("input, select, textarea");
      if (!control) return;
      control.addEventListener("blur", function () { validateField(field); });
      control.addEventListener("input", function () {
        if (field.classList.contains("is-invalid")) validateField(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allOk = true;
      var firstBad = null;
      form.querySelectorAll(".field").forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstBad) firstBad = field.querySelector("input, select, textarea");
        if (!ok) allOk = false;
      });

      if (!allOk) {
        if (firstBad) firstBad.focus();
        if (success) success.hidden = true;
        return;
      }

      form.reset();
      form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("is-invalid"); });
      if (success) {
        success.hidden = false;
        success.focus && success.setAttribute("tabindex", "-1");
      }
    });
  }

  var PHOTOGRAPHERS = [
    { id: "sofia", name: "Sofia Martins", tags: "Fashion · Lifestyle · Beauty", specialties: ["fashion", "lifestyle"], city: "lisbon", locationLabel: "Lisbon, Portugal", rate: 1500, rating: "4.9", travel: true, production: ["solo", "assistant", "full", "location"], avail: "week", href: "photographer.html", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80", alt: "Fashion editorial on a city street." },
    { id: "joao", name: "João Costa", tags: "Product · E-commerce", specialties: ["product", "ecommerce"], city: "porto", locationLabel: "Porto, Portugal", rate: 900, rating: "4.8", travel: false, production: ["solo", "studio"], avail: "month", href: "photographers.html", img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80", alt: "Product still life." },
    { id: "ana", name: "Ana Silva", tags: "Food · Hospitality", specialties: ["food", "hospitality"], city: "lisbon", locationLabel: "Lisbon, Portugal", rate: 1100, rating: "5.0", travel: true, production: ["solo", "assistant", "location"], avail: "week", href: "photographers.html", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80", alt: "Restaurant table setting." },
    { id: "miguel", name: "Miguel Santos", tags: "Corporate · Events", specialties: ["corporate", "events"], city: "madrid", locationLabel: "Madrid, Spain", rate: 1800, rating: "4.7", travel: true, production: ["assistant", "full"], avail: "month", href: "photographers.html", img: "https://images.unsplash.com/photo-1542744173-8eaa34283450?auto=format&fit=crop&w=900&q=80", alt: "Corporate conference photography." },
    { id: "elena", name: "Elena Rossi", tags: "Architecture · Lifestyle", specialties: ["architecture", "lifestyle"], city: "lisbon", locationLabel: "Milan / travel", rate: 2200, rating: "4.9", travel: true, production: ["full", "location"], avail: "month", href: "photographers.html", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80", alt: "Modern architecture exterior." },
    { id: "james", name: "James Okonkwo", tags: "Automotive · Lifestyle", specialties: ["automotive", "lifestyle"], city: "lisbon", locationLabel: "London · travel", rate: 2800, rating: "4.8", travel: true, production: ["full", "location"], avail: "month", href: "photographers.html", img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80", alt: "Automotive photography." }
  ];

  function cardHtml(p) {
    return (
      '<article class="photog-card reveal is-visible">' +
        '<a class="photog-card__link" href="' + p.href + '">' +
          '<div class="photog-card__media"><img src="' + p.img + '" alt="' + p.alt + '" width="900" height="1100" loading="lazy"></div>' +
          '<div class="photog-card__body">' +
            '<div class="photog-card__top"><h3>' + p.name + '</h3><span class="rating">★ ' + p.rating + '</span></div>' +
            '<p class="photog-card__tags">' + p.tags + '</p>' +
            '<p class="photog-card__meta">' + p.locationLabel + '</p>' +
            '<p class="photog-card__rate">From €' + p.rate.toLocaleString("en-IE") + '/day</p>' +
            '<span class="photog-card__cta">View portfolio</span>' +
          '</div>' +
        '</a>' +
      '</article>'
    );
  }

  function budgetBand(rate) {
    if (rate < 1000) return "500";
    if (rate < 2500) return "1000";
    if (rate < 5000) return "2500";
    return "5000";
  }

  function initPhotographerSearch() {
    var grid = document.getElementById("photogGrid");
    if (!grid) return;
    var empty = document.getElementById("workEmpty");
    var count = document.getElementById("resultCount");
    var panel = document.querySelector(".filter-panel");

    function selected(name, type) {
      var nodes = panel.querySelectorAll('input[name="' + name + '"]');
      var values = [];
      nodes.forEach(function (n) {
        if (n.checked && n.value !== "all") values.push(n.value);
      });
      return values;
    }

    function apply() {
      var specs = selected("specialty");
      var loc = (panel.querySelector('input[name="location"]:checked') || {}).value || "all";
      var budget = (panel.querySelector('input[name="budget"]:checked') || {}).value || "all";
      var prods = selected("production");
      var avail = (panel.querySelector('input[name="avail"]:checked') || {}).value || "all";

      var shown = PHOTOGRAPHERS.filter(function (p) {
        if (specs.length && !specs.some(function (s) { return p.specialties.indexOf(s) !== -1; })) return false;
        if (loc === "travel" && !p.travel) return false;
        if (loc !== "all" && loc !== "travel" && p.city !== loc && !p.travel) return false;
        if (budget !== "all" && budgetBand(p.rate) !== budget) return false;
        if (prods.length && !prods.some(function (x) { return p.production.indexOf(x) !== -1; })) return false;
        if (avail !== "all" && p.avail !== avail && !(avail === "month" && p.avail === "week")) return false;
        return true;
      });

      grid.innerHTML = shown.map(cardHtml).join("");
      if (count) count.textContent = shown.length + " photographer" + (shown.length === 1 ? "" : "s");
      if (empty) empty.hidden = shown.length !== 0;
    }

    panel.addEventListener("change", apply);
    var clear = document.getElementById("clearFilters");
    if (clear) {
      clear.addEventListener("click", function () {
        panel.querySelectorAll("input[type=checkbox]").forEach(function (i) { i.checked = false; });
        panel.querySelectorAll("input[type=radio][value=all]").forEach(function (i) { i.checked = true; });
        apply();
      });
    }
    apply();
  }

  function initPortfolioFilter() {
    var grid = document.getElementById("portfolioGrid");
    if (!grid) return;
    var buttons = document.querySelectorAll("[data-port]");
    var items = grid.querySelectorAll(".port-item");
    buttons.forEach(function (btn) {
      if (!btn.classList.contains("filter")) return;
      btn.addEventListener("click", function () {
        document.querySelectorAll(".filter[data-port]").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var f = btn.getAttribute("data-port");
        items.forEach(function (el) {
          el.hidden = !(f === "all" || el.getAttribute("data-port") === f);
        });
      });
    });
  }

  function initMiniCal() {
    var el = document.getElementById("miniCal");
    if (!el) return;
    var days = ["M", "T", "W", "T", "F", "S", "S"];
    var html = days.map(function (d) { return '<span class="hd">' + d + "</span>"; }).join("");
    for (var i = 1; i <= 30; i++) {
      var busy = i === 4 || i === 5 || i === 12 || i === 18 || i === 19;
      html += '<span class="' + (busy ? "cal-busy" : "cal-free") + '">' + i + "</span>";
    }
    el.innerHTML = html;
  }

  function initAssetFilter() {
    var grid = document.getElementById("assetGrid");
    if (!grid) return;
    var buttons = document.querySelectorAll("[data-asset].filter");
    var items = grid.querySelectorAll(".asset");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        var f = btn.getAttribute("data-asset");
        items.forEach(function (el) {
          var tags = el.getAttribute("data-asset") || "";
          el.hidden = !(f === "all" || tags.indexOf(f) !== -1);
        });
      });
    });
  }

  function initBriefWizard() {
    var form = document.getElementById("briefForm");
    if (!form) return;
    var step = 1;
    var panes = form.querySelectorAll(".wizard-pane");
    var labels = form.querySelectorAll(".wizard-steps li");
    var next = document.getElementById("briefNext");
    var back = document.getElementById("briefBack");
    var date = document.getElementById("date");
    if (date && !date.value) {
      var d = new Date();
      d.setDate(d.getDate() + 21);
      date.value = d.toISOString().slice(0, 10);
    }

    function show() {
      panes.forEach(function (p) {
        p.classList.toggle("is-active", Number(p.getAttribute("data-step")) === step);
      });
      labels.forEach(function (l, i) {
        l.classList.toggle("is-active", i === step - 1);
      });
      back.hidden = step === 1;
      next.textContent = step === 4 ? "Get photographer matches" : "Continue";
    }

    next.addEventListener("click", function () {
      if (step < 4) {
        step += 1;
        show();
        return;
      }
      var data = {
        shootType: (form.querySelector('input[name="shootType"]:checked') || {}).value,
        brand: (document.getElementById("brand") || {}).value,
        campaign: (document.getElementById("campaign") || {}).value,
        location: (document.getElementById("location") || {}).value,
        budget: (form.querySelector('input[name="budget"]:checked') || {}).value
      };
      try { sessionStorage.setItem("shootflowBrief", JSON.stringify(data)); } catch (e) {}
      window.location.href = "matches.html";
    });
    back.addEventListener("click", function () {
      if (step > 1) { step -= 1; show(); }
    });
    show();
  }

  function initMatches() {
    var grid = document.getElementById("matchGrid");
    if (!grid) return;
    var brief = {};
    try { brief = JSON.parse(sessionStorage.getItem("shootflowBrief") || "{}"); } catch (e) { brief = {}; }
    var summary = document.getElementById("matchSummary");
    if (summary && brief.campaign) {
      summary.textContent = (brief.brand || "Your brand") + " · " + (brief.campaign || "") + " · " + (brief.location || "") + " · ranked by style, specialty, location, availability and budget.";
    }

    var typeMap = { product: "product", campaign: "lifestyle", lifestyle: "lifestyle", event: "events", portrait: "lifestyle", other: "lifestyle" };
    var want = typeMap[brief.shootType] || "lifestyle";
    var loc = (brief.location || "lisbon").toLowerCase();

    var ranked = PHOTOGRAPHERS.slice().sort(function (a, b) {
      var as = (a.specialties.indexOf(want) !== -1 ? 3 : 0) + (a.city === "lisbon" && loc.indexOf("lisbon") !== -1 ? 2 : 0) + (a.travel ? 1 : 0);
      var bs = (b.specialties.indexOf(want) !== -1 ? 3 : 0) + (b.city === "lisbon" && loc.indexOf("lisbon") !== -1 ? 2 : 0) + (b.travel ? 1 : 0);
      return bs - as;
    }).slice(0, 5);

    ranked[0].href = "photographer.html";
    grid.innerHTML = ranked.map(function (p, i) {
      var html = cardHtml(p);
      if (i === 0) html = html.replace("</article>", '<p class="photog-card__cta" style="padding:0 0 1rem">Best match for this brief</p></article>');
      return html;
    }).join("");
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHeaderScroll();
    initSmoothScroll();
    initWorkFilter();
    initScrollReveal();
    initStatCounters();
    initContactForm();
    initPhotographerSearch();
    initPortfolioFilter();
    initMiniCal();
    initAssetFilter();
    initBriefWizard();
    initMatches();
  });
})();
