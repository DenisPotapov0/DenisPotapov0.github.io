(function () {
  "use strict";

  var themeLabels = {
    flatly: { label: "Светлая", icon: "bi-sun-fill" },
    darkly: { label: "Тёмная", icon: "bi-moon-stars-fill" },
  };

  function readStoredTheme() {
    try {
      return localStorage.getItem("theme");
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {}
  }

  function applyTheme(theme, persist) {
    var key = themeLabels[theme] ? theme : "flatly";
    var config = themeLabels[key];
    var link = document.getElementById("theme-css");
    var label = document.getElementById("themeLabel");
    var icon = document.getElementById("themeIcon");

    if (link && link.dataset[key]) {
      link.href = link.dataset[key];
    }

    document.documentElement.setAttribute(
      "data-bs-theme",
      key === "darkly" ? "dark" : "light"
    );
    document.documentElement.dataset.theme = key;

    if (label) {
      label.textContent = config.label;
    }

    if (icon) {
      icon.className = "bi " + config.icon;
    }

    document.querySelectorAll(".theme-option").forEach(function (option) {
      option.classList.toggle("active", option.dataset.theme === key);
      option.setAttribute("aria-pressed", option.dataset.theme === key ? "true" : "false");
    });

    if (persist) {
      storeTheme(key);
    }
  }

  function setupTheme() {
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var stored = readStoredTheme();
    var initial = stored === "flatly" || stored === "darkly"
      ? stored
      : media.matches
        ? "darkly"
        : "flatly";

    applyTheme(initial, false);

    document.querySelectorAll(".theme-option").forEach(function (option) {
      option.addEventListener("click", function () {
        applyTheme(option.dataset.theme, true);
      });
    });

    var onChange = function (event) {
      if (!readStoredTheme()) {
        applyTheme(event.matches ? "darkly" : "flatly", false);
      }
    };

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
    } else if (typeof media.addListener === "function") {
      media.addListener(onChange);
    }
  }

  function setupNavigation() {
    var navMenu = document.getElementById("navMenu");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.querySelectorAll("#navMenu .nav-link").forEach(function (link) {
      link.addEventListener("click", function (event) {
        if (!navMenu || !navMenu.classList.contains("show")) {
          return;
        }

        if (!window.bootstrap || !window.bootstrap.Collapse) {
          return;
        }

        var href = link.getAttribute("href");
        var target = href && href.charAt(0) === "#" ? document.querySelector(href) : null;
        var instance = window.bootstrap.Collapse.getInstance(navMenu);

        if (!target || !instance) {
          return;
        }

        event.preventDefault();

        var goToTarget = function () {
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start",
          });

          if (window.history && window.history.pushState) {
            window.history.pushState(null, "", href);
          } else {
            window.location.hash = href;
          }
        };

        navMenu.addEventListener("hidden.bs.collapse", goToTarget, { once: true });
        instance.hide();
      });
    });
  }

  function setupReveal() {
    var elements = document.querySelectorAll("[data-reveal]");
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!("IntersectionObserver" in window) || reduceMotion) {
      return;
    }

    elements.forEach(function (element) {
      element.classList.add("reveal");
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  function setupYear() {
    var year = document.getElementById("year");
    if (year) {
      year.textContent = String(new Date().getFullYear());
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupTheme();
    setupNavigation();
    setupReveal();
    setupYear();
  });
})();
