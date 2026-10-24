
import { videos } from "./videos.js";

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

const titles = videos;

let category = "All Viral Video";
let currentPage = 0;

const FIRST_PAGE_SIZE = 50;
const NEXT_PAGE_SIZE = 30;

const nav = $("siteNav");
const grid = $("movieGrid");
const search = $("searchInput");

const pager = document.createElement("div");
pager.id = "pagination";
pager.style.cssText =
  "display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:12px;padding:10px 12px 30px;";

grid.insertAdjacentElement("afterend", pager);

function norm(value) {
  return String(value || "").toLowerCase().trim();
}

function setupMenu() {
  nav.replaceChildren();

  const wrap = document.createElement("div");
  wrap.className = "category-buttons";

  categories.forEach(name => {
    const button = document.createElement("a");
    button.textContent = name;
    button.href = "#";
    button.className = "category-btn";

    if (name === category) button.classList.add("active");

    button.onclick = event => {
      event.preventDefault();
      category = name;
      currentPage = 0;

      wrap.querySelectorAll(".category-btn").forEach(item => {
        item.classList.toggle("active", item.textContent === name);
      });

      render();
    };

    wrap.appendChild(button);
  });

  nav.appendChild(wrap);

  $("menuToggle").onclick = () => {
    if (window.innerWidth <= 649) {
      nav.classList.toggle("menu-open");
    }
  };
}

function getFilteredTitles() {
  const query = norm(search.value);

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

    const matchesSearch = searchable.includes(query);

    const matchesCategory =
      category === "All" ||
      category === "All Viral Video" ||
      norm(video.category) === norm(category) ||
      norm(video.genre) === norm(category);

    return matchesSearch && matchesCategory;
  });
}

function getPageSize() {
  return currentPage === 0 ? FIRST_PAGE_SIZE : NEXT_PAGE_SIZE;
}

function getPageStart() {
  return currentPage === 0
    ? 0
    : FIRST_PAGE_SIZE + (currentPage - 1) * NEXT_PAGE_SIZE;
}

function getTotalPages(count) {
  return count <= FIRST_PAGE_SIZE
    ? 1
    : 1 + Math.ceil((count - FIRST_PAGE_SIZE) / NEXT_PAGE_SIZE);
}

function pageButton(label, disabled, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.disabled = disabled;

  button.style.cssText = `
    border:0;border-radius:25px;padding:12px 20px;
    background:${disabled ? "#555" : "#ff008c"};
    color:#fff;font-size:14px;font-weight:800;
    opacity:${disabled ? ".55" : "1"};
  `;

  button.onclick = action;
  return button;
}

function renderPagination(count) {
  pager.replaceChildren();

  const totalPages = getTotalPages(count);
  if (!count || totalPages <= 1) return;

  const previous = pageButton("❮ PREVIOUS", currentPage === 0, () => {
    currentPage--;
    render();
    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const info = document.createElement("span");
  info.textContent = `Page ${currentPage + 1} of ${totalPages}`;
  info.style.color = "#fff";

  const next = pageButton(
    "NEXT ❯",
    currentPage >= totalPages - 1,
    () => {
      currentPage++;
      render();
      grid.scrollIntoView({ behavior: "smooth", block: "start" });
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

  $("emptyState").hidden = filtered.length > 0;
  $("emptyState").textContent =
    filtered.length ? "" : "No titles found.";

  shown.forEach(video => {
    const index = titles.indexOf(video);
    const card = document.createElement("a");

    card.className = "card";
    card.href = "video.html?id=" + index;

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

$("searchForm").onsubmit = event => {
  event.preventDefault();
  currentPage = 0;
  render();
};

search.addEventListener("input", () => {
  currentPage = 0;
  render();
});

setupMenu();
render();
