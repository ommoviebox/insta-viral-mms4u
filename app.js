const $ = id => document.getElementById(id);

const categories = [
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
description: "Replace this example with your own authorized title."
},
{
title: "Example Web Series",
year: "2026",
language: "English",
type: "Web Series",
poster: "",
description: "Replace this example with your own authorized title."
}
];

let titles = sampleTitles;
let category = "All Viral Video";

const nav = $("siteNav");
const grid = $("movieGrid");
const search = $("searchInput");

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
b.onclick = e => {
e.preventDefault();
category = c;

  wrap.querySelectorAll(".category-btn").forEach(x => {
    x.classList.toggle("active", x.textContent === c);
  });

  render();
};

wrap.appendChild(b);

});

nav.appendChild(wrap);

$("menuToggle").onclick = () => {
nav.hidden = !nav.hidden;
};
}

function render() {
grid.replaceChildren();

const q = norm(search.value);

const shown = titles.filter(t => {
const text = norm([
t.title,
t.year,
t.language,
t.type,
t.genre,
t.description
].join(" "));

return text.includes(q);

});

$("resultCount").textContent = shown.length + " titles";
$("emptyState").hidden = shown.length > 0;

shown.forEach((t, i) => {
const a = document.createElement("a");
a.className = "card";
a.href = "movie.html?id=" + i;

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
meta.textContent = [
  t.year,
  t.language,
  t.type
].filter(Boolean).join(" • ");

info.append(h, meta);
inner.append(img, info);
a.appendChild(inner);
grid.appendChild(a);

});
}

$("searchForm").onsubmit = e => {
e.preventDefault();
render();
};

search.addEventListener("input", render);

setupMenu();
render();
