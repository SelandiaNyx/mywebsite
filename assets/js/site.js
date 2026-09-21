/* ==========================================================================
   selandia.top — 交互层
   原生 ES5+ 浏览器 API，无依赖、无构建步骤。
   所有增强都建立在「没有 JS 也能正常阅读」的前提上。
   ========================================================================== */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- 主题 */
  var THEME_KEY = "selandia-theme";

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* 隐私模式下 localStorage 不可用，忽略即可 */
    }
    var btn = doc.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "切换到浅色主题" : "切换到深色主题");
    }
  }

  function initTheme() {
    var btn = doc.querySelector("[data-theme-toggle]");
    if (btn) {
      btn.addEventListener("click", function () {
        applyTheme(currentTheme() === "dark" ? "light" : "dark");
      });
      // 同步一次可访问性标签
      applyTheme(currentTheme());
    }

    // 跟随系统：仅在用户没有手动选择过时生效
    var media = window.matchMedia("(prefers-color-scheme: light)");
    media.addEventListener("change", function (e) {
      var saved = null;
      try {
        saved = localStorage.getItem(THEME_KEY);
      } catch (err) {
        saved = null;
      }
      if (!saved) {
        root.setAttribute("data-theme", e.matches ? "light" : "dark");
      }
    });
  }

  /* -------------------------------------------------------------- 顶栏状态 */
  function initHeader() {
    var header = doc.querySelector(".site-header");
    if (!header) return;

    var ticking = false;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------------------------------------------------------------- 菜单 */
  function initNav() {
    var toggle = doc.querySelector("[data-nav-toggle]");
    var nav = doc.querySelector("[data-nav]");
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) close();
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    doc.addEventListener("click", function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) close();
    });
  }

  /* ------------------------------------------------------------ 滚动进场 */
  function initReveal() {
    var targets = doc.querySelectorAll(".reveal");
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      for (var i = 0; i < targets.length; i++) targets[i].classList.add("is-in");
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 }
    );

    for (var j = 0; j < targets.length; j++) io.observe(targets[j]);
  }

  /* -------------------------------------------------- 错峰索引（--i） */
  function initStagger() {
    var groups = doc.querySelectorAll("[data-stagger]");
    for (var g = 0; g < groups.length; g++) {
      var kids = groups[g].children;
      for (var k = 0; k < kids.length; k++) {
        kids[k].style.setProperty("--i", String(Math.min(k, 12)));
      }
    }
  }

  /* -------------------------------------------------------- 卡片光晕跟随 */
  function initGlow() {
    if (reduceMotion || window.matchMedia("(hover: none)").matches) return;

    var cards = doc.querySelectorAll(".card--glow");
    for (var i = 0; i < cards.length; i++) {
      (function (card) {
        var queued = false;
        var mx = 50;
        var my = 0;

        card.addEventListener(
          "pointermove",
          function (e) {
            var r = card.getBoundingClientRect();
            mx = ((e.clientX - r.left) / r.width) * 100;
            my = ((e.clientY - r.top) / r.height) * 100;
            if (!queued) {
              queued = true;
              window.requestAnimationFrame(function () {
                card.style.setProperty("--mx", mx.toFixed(1) + "%");
                card.style.setProperty("--my", my.toFixed(1) + "%");
                queued = false;
              });
            }
          },
          { passive: true }
        );
      })(cards[i]);
    }
  }

  /* ------------------------------------------------------------ 代码块 */
  var COPY_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="9" y="9" width="12" height="12" rx="2"/>' +
    '<path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = doc.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
      doc.body.appendChild(ta);
      ta.select();
      try {
        doc.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        doc.body.removeChild(ta);
      }
    });
  }

  function initCode() {
    var blocks = doc.querySelectorAll("pre");
    for (var i = 0; i < blocks.length; i++) {
      (function (pre) {
        var code = pre.querySelector("code");
        var label = "text";
        if (code) {
          var m = /language-([\w-]+)/.exec(code.className);
          if (m) label = m[1];
        }

        // 已经是手写的 .code 容器就复用，否则包一层
        var box = pre.closest(".code");
        if (!box) {
          box = doc.createElement("div");
          box.className = "code";
          pre.parentNode.insertBefore(box, pre);
          box.appendChild(pre);
        }

        var bar = box.querySelector(".code__bar");
        if (!bar) {
          bar = doc.createElement("div");
          bar.className = "code__bar";
          box.insertBefore(bar, pre);
        }

        if (!bar.querySelector(".code__lang")) {
          var lang = doc.createElement("span");
          lang.className = "code__lang";
          lang.textContent = label;
          bar.insertBefore(lang, bar.firstChild);
        }

        if (bar.querySelector(".code__copy")) return; // 已处理过

        var btn = doc.createElement("button");
        btn.type = "button";
        btn.className = "code__copy";
        btn.innerHTML = COPY_ICON + "<span>复制</span>";
        bar.appendChild(btn);

        var text = btn.querySelector("span");
        btn.addEventListener("click", function () {
          copyText(pre.innerText.replace(/\s+$/, "")).then(
            function () {
              btn.classList.add("is-done");
              text.textContent = "已复制";
              window.setTimeout(function () {
                btn.classList.remove("is-done");
                text.textContent = "复制";
              }, 1600);
            },
            function () {
              text.textContent = "复制失败";
              window.setTimeout(function () {
                text.textContent = "复制";
              }, 1600);
            }
          );
        });
      })(blocks[i]);
    }
  }

  /* -------------------------------------------------------------- 灯箱 */
  function initLightbox() {
    var shots = doc.querySelectorAll("[data-zoom]");
    if (!shots.length || typeof HTMLDialogElement === "undefined") return;

    var box = doc.createElement("dialog");
    box.className = "lightbox";
    box.setAttribute("aria-label", "图片预览");
    box.innerHTML =
      '<button type="button" class="icon-btn lightbox__close" aria-label="关闭预览">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      "<img alt=\"\">";
    doc.body.appendChild(box);

    var img = box.querySelector("img");

    function open(src, alt) {
      img.src = src;
      img.alt = alt || "";
      box.showModal();
    }

    for (var i = 0; i < shots.length; i++) {
      (function (el) {
        var source = el.querySelector("img");
        if (!source) return;
        el.addEventListener("click", function () {
          open(source.currentSrc || source.src, source.alt);
        });
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open(source.currentSrc || source.src, source.alt);
          }
        });
      })(shots[i]);
    }

    box.addEventListener("click", function (e) {
      // 点击图片以外的区域关闭
      if (e.target === box || e.target.closest(".lightbox__close")) box.close();
    });
  }

  /* -------------------------------------------------- 插画占位淡入 */
  function initImages() {
    var imgs = doc.querySelectorAll("img[data-fade]");
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        function done() {
          img.classList.add("is-loaded");
        }
        if (img.complete && img.naturalWidth > 0) {
          done();
        } else {
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }
      })(imgs[i]);
    }
  }

  /* ------------------------------------------------------------ 年份 */
  function initYear() {
    var el = doc.querySelector("[data-year]");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------ 启动 */
  function boot() {
    initTheme();
    initHeader();
    initNav();
    initStagger();
    initReveal();
    initGlow();
    initCode();
    initLightbox();
    initImages();
    initYear();
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
