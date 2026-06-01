const API = "https://api.jikan.moe/v4/anime?q=";

let animeList =
JSON.parse(localStorage.getItem("animeList")) || [];

let currentTab = "search";

/* ---------------- TAB SYSTEM ---------------- */

function switchTab(tab){

document.querySelectorAll(".tab")
.forEach(t => t.classList.remove("active"));

document.getElementById(tab)
.classList.add("active");

currentTab = tab;

if(tab === "library") renderList();
if(tab === "stats") renderStats();
}

/* ---------------- SEARCH ---------------- */

async function searchAnime(){

const q = document.getElementById("searchInput").value;

const res = await fetch(API + q);
const data = await res.json();

renderSearch(data.data);
}

function renderSearch(animes){

const container = document.getElementById("results");
container.innerHTML = "";

animes.forEach(anime => {

const exists = animeList.some(a => a.id === anime.mal_id);

container.innerHTML += `
<div class="card">

<img src="${anime.images.jpg.large_image_url}">

<div class="content">

<h3>${anime.title}</h3>

<p>${anime.synopsis?.slice(0,120) || ""}...</p>

<button 
onclick='addAnime(${JSON.stringify(anime)})'
${exists ? "disabled" : ""}
>
${exists ? "✅ Déjà ajouté" : "➕ Ajouter"}
</button>

</div>
</div>
`;
});
}

/* ---------------- ADD ---------------- */

function addAnime(anime){

animeList.push({
id: anime.mal_id,
title: anime.title,
image: anime.images.jpg.large_image_url,
description: anime.synopsis,
status: "planned",
rating: 0
});

save();
}

/* ---------------- SAVE ---------------- */

function save(){
localStorage.setItem("animeList", JSON.stringify(animeList));
renderList();
renderStats();
}

/* ---------------- LIST ---------------- */

function renderList(){

const container = document.getElementById("animeList");
container.innerHTML = "";

animeList.forEach((anime, i) => {

container.innerHTML += `
<div class="card">

<img src="${anime.image}">

<div class="content">

<h3>${anime.title}</h3>

<span class="badge ${anime.status}">
${anime.status}
</span>

<select onchange="updateStatus(${i}, this.value)">
<option value="planned">Pas commencé</option>
<option value="watching">En cours</option>
<option value="completed">Terminé</option>
<option value="paused">Pause</option>
<option value="dropped">Abandonné</option>
</select>

<div class="stars" onclick="rate(${i}, event)">
${"★".repeat(Math.round(anime.rating))}${"☆".repeat(5 - Math.round(anime.rating))}
</div>

</div>
</div>
`;
});
}

/* ---------------- STATUS ---------------- */

function updateStatus(i, value){
animeList[i].status = value;
save();
}

/* ---------------- RATING ---------------- */

function rate(i, e){

const rect = e.target.getBoundingClientRect();
const x = e.clientX - rect.left;
const percent = x / rect.width;

animeList[i].rating = Math.min(5, Math.max(0, percent * 5));

save();
}

/* ---------------- STATS ---------------- */

function renderStats(){

document.getElementById("total").innerText = animeList.length;

document.getElementById("watching").innerText =
animeList.filter(a => a.status === "watching").length;

document.getElementById("completed").innerText =
animeList.filter(a => a.status === "completed").length;

const avg =
animeList.reduce((acc,a)=>acc + a.rating,0) /
(animeList.length || 1);

document.getElementById("avg").innerText =
avg.toFixed(1);
}

/* ---------------- EXPORT JSON ---------------- */

function exportJSON(){

const blob = new Blob(
[JSON.stringify(animeList, null, 2)],
{type:"application/json"}
);

download(blob,"anime.json");
}

/* ---------------- EXPORT CSV ---------------- */

function exportCSV(){

let csv = "title,status,rating\n";

animeList.forEach(a=>{
csv += `${a.title},${a.status},${a.rating}\n`;
});

const blob = new Blob([csv], {type:"text/csv"});
download(blob,"anime.csv");
}

/* ---------------- DOWNLOAD ---------------- */

function download(blob,name){

const a = document.createElement("a");
a.href = URL.createObjectURL(blob);
a.download = name;
a.click();
}

/* ---------------- IMPORT ---------------- */

document.getElementById("importFile")
.addEventListener("change", e => {

const file = e.target.files[0];
const reader = new FileReader();

reader.onload = () => {

if(file.name.endsWith(".json")){
animeList = JSON.parse(reader.result);
save();
}
};

reader.readAsText(file);
});

/* INIT */
renderList();
renderStats();
