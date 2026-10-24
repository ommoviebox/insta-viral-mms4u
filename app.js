
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

const sampleTitles = [
  {
    title: "Example Movie One",
    year: "2026",
    language: "Hindi",
    type: "Movie",
    poster: "",
    description: "Demo movie card for website design."
  },
  {
    title: "Example Web Series",
    year: "2026",
    language: "English",
    type: "Web Series",
    poster: "",
    description: "Demo web series card for website design."
  }
];

let titles = sampleTitles;
let category = "All Viral Video";
let currentPage = 0;

const FIRST_PAGE_SIZE = 50;
const NEXT_PAGE_SIZE = 30;

const nav = $("siteNav");
const grid = $("movieGrid");
const search = $("searchInput");

const pager = document.createElement("div");
pager.id = "pagination";
pager.style.cssText = `
  display:flex;
  justify-content:center;
  align-items:center;
  flex-wrap:wrap;
  gap:12px;
  padding:10px 12px 30px;
`;

grid.insertAdjacentElement("afterend", pager);

function norm(v) {
  return String(v || "").toLowerCase().trim();
}

function setupMenu() {
  nav.replaceChildren();

  const wrap = document.createElement("div");
  wrap.className = "category-buttons";

  categories.forEach(c => {
    const b = document.createElement("a");
    b.textContent = c;
    b.className = "category-btn";
    b.href = "#";

    if (c === category) b.classList.add("active");

    b.onclick = e => {
      e.preventDefault();
      category = c;
      currentPage = 0;

      wrap.querySelectorAll(".category-btn").forEach(x => {
        x.classList.toggle("active", x.textContent === c);
      });

      render();
    };

    wrap.appendChild(b);
  });

  nav.appendChild(wrap);

  $("menuToggle").onclick = () => {
    if (window.innerWidth <= 649) {
      nav.classList.toggle("menu-open");
    }
  };
}

function getFilteredTitles() {
  const q = norm(search.value);

  return titles.filter(t => {
    const text = norm([
      t.title,
      t.year,
      t.language,
      t.type,
      t.genre,
      t.description
    ].join(" "));

    const matchesSearch = text.includes(q);

    const matchesCategory =
      category === "All" ||
      category === "All Viral Video" ||
      norm(t.category) === norm(category) ||
      norm(t.genre) === norm(category);

    return matchesSearch && matchesCategory;
  });
}

function getPageSize() {
  return currentPage === 0 ? FIRST_PAGE_SIZE : NEXT_PAGE_SIZE;
}

function getPageStart() {
  if (currentPage === 0) return 0;

  return FIRST_PAGE_SIZE + (currentPage - 1) * NEXT_PAGE_SIZE;
}

function getTotalPages(count) {
  if (count <= FIRST_PAGE_SIZE) return 1;

  return 1 + Math.ceil(
    (count - FIRST_PAGE_SIZE) / NEXT_PAGE_SIZE
  );
}

function createPageButton(label, disabled, action) {
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
    cursor:${disabled ? "not-allowed" : "pointer"};
    opacity:${disabled ? "0.55" : "1"};
  `;

  button.onclick = action;
  return button;
}

function renderPagination(count) {
  pager.replaceChildren();

  const totalPages = getTotalPages(count);

  if (count === 0 || totalPages <= 1) {
    return;
  }

  const previous = createPageButton(
    "❮ PREVIOUS",
    currentPage === 0,
    () => {
      if (currentPage > 0) {
        currentPage--;
        render();
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  );

  const pageInfo = document.createElement("span");
  pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
  pageInfo.style.cssText = `
    color:#fff;
    font-size:14px;
    font-weight:700;
  `;

  const next = createPageButton(
    "NEXT ❯",
    currentPage >= totalPages - 1,
    () => {
      if (currentPage < totalPages - 1) {
        currentPage++;
        render();
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  );

  pager.append(previous, pageInfo, next);
}

function render() {
  grid.replaceChildren();

  const filtered = getFilteredTitles();
  const totalPages = getTotalPages(filtered.length);

  if (currentPage >= totalPages) {
    currentPage = Math.max(0, totalPages - 1);
  }

  const start = getPageStart();
  const pageSize = getPageSize();
  const shown = filtered.slice(start, start + pageSize);

  $("emptyState").hidden = filtered.length > 0;
  $("emptyState").textContent =
    filtered.length === 0 ? "No titles found." : "";

  shown.forEach(t => {
    const a = document.createElement("a");
    a.className = "card";

    const originalIndex = titles.indexOf(t);
    a.href = "movie.html?id=" + originalIndex;

    const inner = document.createElement("div");
    inner.className = "inner";

    const img = t.poster
      ? document.createElement("img")
      : document.createElement("div");

    img.className = t.poster ? "poster" : "placeholder";

    if (t.poster) {
      img.src = t.poster;
      img.alt = t.title;
      img.loading = "lazy";
    } else {
      img.textContent = "IV";
    }

    const info = document.createElement("div");
    info.className = "info";

    const h = document.createElement("h3");
    h.textContent = t.title;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.hidden = true;

    info.append(h, meta);
    inner.append(img, info);
    a.appendChild(inner);
    grid.appendChild(a);
  });

  renderPagination(filtered.length);
}

$("searchForm").onsubmit = e => {
  e.preventDefault();
  currentPage = 0;
  render();
};

search.addEventListener("input", () => {
  currentPage = 0;
  render();
});

setupMenu();
render();
