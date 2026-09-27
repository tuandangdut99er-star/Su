(() => {
  "use strict";

  const screens = [...document.querySelectorAll("[data-page]")];
  const validPages = new Set(screens.map((screen) => screen.dataset.page));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let currentPage = "cover";
  let transitionTimer;

  function pageFromHash() {
    const candidate = window.location.hash.replace(/^#/, "");
    const queryPage = new URLSearchParams(window.location.search).get("page");
    if (validPages.has(candidate)) return candidate;
    if (validPages.has(queryPage)) return queryPage;
    return "cover";
  }

  function showPage(page, options = {}) {
    const targetPage = validPages.has(page) ? page : "cover";
    const target = screens.find((screen) => screen.dataset.page === targetPage);
    const active = screens.find((screen) => screen.dataset.page === currentPage);

    window.clearTimeout(transitionTimer);

    // Force layout so the page is always visible on first load, including
    // browsers that defer animation frames for a background tab.
    void target.offsetWidth;
    target.classList.add("is-active");

    if (active && active !== target) {
      active.classList.remove("is-active");
    }
    currentPage = targetPage;

    if (options.updateHistory !== false) {
      const hash = targetPage === "cover" ? "#cover" : `#${targetPage}`;
      history.pushState({ page: targetPage }, "", hash);
    }

    document.title = targetPage === "cover" ? "Gửi Su" : `Gửi Su — Trang ${targetPage.split("-")[1]}`;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });

    transitionTimer = window.setTimeout(() => {
      const heading = target.querySelector("h1, h2");
      if (heading && options.focusHeading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    }, reducedMotion ? 0 : 430);
  }

  document.addEventListener("click", (event) => {
    const control = event.target.closest("[data-go]");
    if (!control) return;
    showPage(control.dataset.go, { focusHeading: true });
  });

  window.addEventListener("popstate", () => {
    showPage(pageFromHash(), { updateHistory: false });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    const order = ["cover", "letter-1", "letter-2", "letter-3", "letter-4"];
    const index = order.indexOf(currentPage);
    const nextIndex = event.key === "ArrowRight"
      ? Math.min(index + 1, order.length - 1)
      : Math.max(index - 1, 0);

    if (nextIndex !== index) showPage(order[nextIndex], { focusHeading: true });
  });

  function createFloatingHearts() {
    if (reducedMotion) return;

    const container = document.getElementById("floating-hearts");
    const heartCount = window.innerWidth < 640 ? 7 : 12;

    for (let index = 0; index < heartCount; index += 1) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.textContent = "♥";
      heart.style.left = `${5 + Math.random() * 90}%`;
      heart.style.fontSize = `${0.55 + Math.random() * 0.95}rem`;
      heart.style.setProperty("--duration", `${15 + Math.random() * 12}s`);
      heart.style.setProperty("--delay", `${-Math.random() * 24}s`);
      heart.style.setProperty("--drift", `${-45 + Math.random() * 90}px`);
      container.appendChild(heart);
    }
  }

  createFloatingHearts();
  showPage(pageFromHash(), { updateHistory: false });
})();
