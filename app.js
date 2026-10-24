
import { videos as localVideos } from "./videos.js";
import { db } from "./firebase-config.js";

import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const $ = id => document.getElementById(id);

const categories = [
  "All",
  "Instagram Viral Video",
  "Brother Sister Video",
  "Bhabhi Lovers",
  "Leaked Video",
  "English Video",
  "Indian 4K Video",
  "Desi Video",
  "Hindi HD Video",
  "Pakistani Viral",
  "Korean Video",
  "All Viral Video"
];

let titles = [...localVideos];
let category = "All Viral Video";
let currentPage = 0;
let latestOnly = false;

const FIRST_PAGE_SIZE = 50;
const NEXT_PAGE_SIZE = 30;

const nav = $("siteNav");
const grid = $("movieGrid");
const search = $("searchInput");
const menuToggle = $("menuToggle");

if (!grid) {
  console.error("movieGrid element not found in index.html");
} else {
  const pager = document.createElement("div");
  pager.id = "pagination";
  pager.style.cssText =
    "display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:12px;padding:10px 12px 30px;";

  grid.insertAdjacentElement("afterend", pager);

  function norm(value) {
    return String(value || "").toLowerCase().trim();
  }

  async function loadFirebaseVideos() {
    try {
      const videoQuery = query(
        collection(db, "videos"),
        where("published", "==", true)
      );

      const snapshot = await getDocs(videoQuery);

      const firebaseVideos = snapshot.docs.map(doc => ({
        ...doc.data(),
        firebaseId: doc.id,
        source: "firebase"
      }));

      titles = [
        ...firebaseVideos,
        ...localVideos.map((video, index) => ({
          ...video,
          localIndex: index,
          source: "local"
        }))
      ];

      render();
    } catch (error) {
      console.error("Firebase videos load error:", error);

      titles = localVideos.map((video, index) => ({
        ...video,
        localIndex: index,
        source: "local"
      }));

      render();
    }
  }

  function closeMenu() {
    if (nav) nav.classList.remove("menu-open");

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  }

  function setupMenu() {
    if (!nav) return;

    nav.replaceChildren();

    const wrap = document.createElement("div");
    wrap.className = "category-buttons";

    categories.forEach(name => {
      const button = document.createElement("a");

      button.textContent = name;
      button.href = "#";
      button.className = "category-btn";

      if (name === category) {
        button.classList.add("active");
      }

      button.onclick = event => {
        event.preventDefault();

        category = name;
        currentPage = 0;
        latestOnly = false;

        wrap.querySelectorAll(".category-btn").forEach(item => {
          item.classList.toggle(
            "active",
            item.textContent === name
          );
        });

        const latestButton = document.querySelector(
          "#latestReleaseFilter button"
        );

        if (latestButton) {
          latestButton.style.background = "#111";
          latestButton.setAttribute("aria-pressed", "false");
        }

        render();
        closeMenu();
      };

      wrap.appendChild(button);
    });

    nav.appendChild(wrap);

    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");

      menuToggle.onclick = event => {
        event.preventDefault();

        if (window.innerWidth <= 649) {
          const isOpen = nav.classList.toggle("menu-open");

          menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
          );
        }
      };
    }
  }

  function setupLatestRelease() {
    const existing = $("latestReleaseFilter");
    if (existing) existing.remove();

    const section = document.createElement("div");
    section.id = "latestReleaseFilter";
    section.style.cssText =
      "display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:12px auto;padding:0 12px;";

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "★ Latest Release";
    button.style.cssText =
      "border:1px solid #ff008c;border-radius:22px;padding:10px 18px;background:#111;color:#fff;font-weight:800;";

    button.setAttribute("aria-pressed", "false");

    button.onclick = () => {
      latestOnly = !latestOnly;
      currentPage = 0;
      category = "All Viral Video";

      button.style.background = latestOnly ? "#ff008c" : "#111";
      button.setAttribute("aria-pressed", String(latestOnly));

      if (nav) {
        nav.querySelectorAll(".category-btn").forEach(item => {
          item.classList.toggle(
            "active",
            item.textContent === category && !latestOnly
          );
        });
      }

      closeMenu();
      render();
    };

    section.appendChild(button);

    if (nav) {
      nav.insertAdjacentElement("afterend", section);
    } else {
      grid.insertAdjacentElement("beforebegin", section);
    }
  }

  function getFilteredTitles() {
    const queryText = norm(search ? search.value : "");

    return titles.filter(video => {
      const searchable = norm([
        video.title,
        video.year,
        video.language,
        video.type,
        video.genre,
        video.category,
        video.description
      ].join(" "));

      const matchesSearch = searchable.includes(queryText);

      const matchesCategory =
        category === "All" ||
        category === "All Viral Video" ||
        norm(video.category) === norm(category) ||
        norm(video.genre) === norm(category);

      const matchesLatest =
        !latestOnly || video.latestRelease === true;

      return matchesSearch && matchesCategory && matchesLatest;
    });
  }

  function getPageSize() {
    return currentPage === 0
      ? FIRST_PAGE_SIZE
      : NEXT_PAGE_SIZE;
  }

  function getPageStart() {
    return currentPage === 0
      ? 0
      : FIRST_PAGE_SIZE + (currentPage - 1) * NEXT_PAGE_SIZE;
  }

  function getTotalPages(count) {
    return count <= FIRST_PAGE_SIZE
      ? 1
      : 1 + Math.ceil(
          (count - FIRST_PAGE_SIZE) / NEXT_PAGE_SIZE
        );
  }

  function pageButton(label, disabled, action) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = label;
    button.disabled = disabled;

    button.style.cssText = `
      border:0;
      border-radius:25px;
      padding:12px 20px;
      background:${disabled ? "#555" : "#ff008c"};
      color:#fff;
      font-size:14px;
      font-weight:800;
      opacity:${disabled ? ".55" : "1"};
    `;

    button.onclick = action;
    return button;
  }

  function renderPagination(count) {
    pager.replaceChildren();

    const totalPages = getTotalPages(count);

    if (!count || totalPages <= 1) return;

    const previous = pageButton(
      "❮ PREVIOUS",
      currentPage === 0,
      () => {
        if (currentPage > 0) {
          currentPage--;
          render();
          grid.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }
    );

    const info = document.createElement("span");
    info.textContent = `Page ${currentPage + 1} of ${totalPages}`;
    info.style.color = "#fff";

    const next = pageButton(
      "NEXT ❯",
      currentPage >= totalPages - 1,
      () => {
        if (currentPage < totalPages - 1) {
          currentPage++;
          render();
          grid.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }
    );

    pager.append(previous, info, next);
  }

  function render() {
    grid.replaceChildren();

    const filtered = getFilteredTitles();
    const totalPages = getTotalPages(filtered.length);

    if (currentPage >= totalPages) {
      currentPage = Math.max(0, totalPages - 1);
    }

    const shown = filtered.slice(
      getPageStart(),
      getPageStart() + getPageSize()
    );

    const emptyState = $("emptyState");

    if (emptyState) {
      emptyState.hidden = filtered.length > 0;
      emptyState.textContent = filtered.length
        ? ""
        : "No titles found.";
    }

    shown.forEach(video => {
      const card = document.createElement("a");
      card.className = "card";

      if (video.source === "firebase" && video.firebaseId) {
        card.href =
          "video.html?id=" +
          encodeURIComponent(video.firebaseId) +
          "&source=firebase";
      } else {
        const localIndex =
          video.localIndex ?? localVideos.indexOf(video);

        card.href =
          "video.html?id=" +
          encodeURIComponent(localIndex);
      }

      const inner = document.createElement("div");
      inner.className = "inner";

      let poster;

      if (video.poster) {
        poster = document.createElement("img");
        poster.src = video.poster;
        poster.alt = video.title || "Video poster";
        poster.loading = "lazy";
        poster.className = "poster";
      } else {
        poster = document.createElement("div");
        poster.className = "placeholder";
        poster.textContent = "IV";
      }

      const info = document.createElement("div");
      info.className = "info";

      const title = document.createElement("h3");
      title.textContent = video.title || "Untitled Video";

      info.appendChild(title);
      inner.append(poster, info);
      card.appendChild(inner);
      grid.appendChild(card);
    });

    renderPagination(filtered.length);
  }

  if ($("searchForm")) {
    $("searchForm").onsubmit = event => {
      event.preventDefault();
      currentPage = 0;
      render();
    };
  }

  if (search) {
    search.addEventListener("input", () => {
      currentPage = 0;
      render();
    });
  }

  setupMenu();
  setupLatestRelease();
  render();
  loadFirebaseVideos();
}
