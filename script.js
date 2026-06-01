const API =
"https://api.jikan.moe/v4/anime?q=";

let animeList =
JSON.parse(
localStorage.getItem("animeList")
) || [];

async function searchAnime(){

const query =
document.getElementById("searchInput")
.value;

const res =
await fetch(API + query);

const data =
await res.json();

displayResults(data.data);
}

function displayResults(animes){

const container =
document.getElementById("results");

container.innerHTML = "";

animes.slice(0,10).forEach(anime=>{

container.innerHTML += `
<div class="card">

<img src="${anime.images.jpg.large_image_url}">

<div class="content">

<h3>${anime.title}</h3>

<p>
${anime.synopsis?.slice(0,150) || ""}
...
</p>

<button onclick='addAnime(${JSON.stringify(anime)})'>
Ajouter
</button>

</div>
</div>
`;
});
}

function addAnime(anime){

animeList.push({
id: anime.mal_id,
title: anime.title,
image:
anime.images.jpg.large_image_url,
description:
anime.synopsis,
status:"Pas commencé",
rating:0
});

save();
}

function save(){

localStorage.setItem(
"animeList",
JSON.stringify(animeList)
);

renderList();
}

function renderList(){

const container =
document.getElementById("animeList");

container.innerHTML="";

animeList.forEach((anime,index)=>{

container.innerHTML += `
<div class="card">

<img src="${anime.image}">

<div class="content">

<h3>${anime.title}</h3>

<p>${anime.description?.slice(0,100)}</p>

<select
onchange="
animeList[${index}].status=this.value;
save();
">

<option ${
anime.status==="Pas commencé"
?"selected":""
}>
Pas commencé
</option>

<option ${
anime.status==="En cours"
?"selected":""
}>
En cours
</option>

<option ${
anime.status==="En pause"
?"selected":""
}>
En pause
</option>

<option ${
anime.status==="Terminé"
?"selected":""
}>
Terminé
</option>

<option ${
anime.status==="Abandonné"
?"selected":""
}>
Abandonné
</option>

</select>

<input
type="range"
min="0"
max="5"
step="0.5"
value="${anime.rating}"

oninput="
animeList[${index}].rating=this.value;
save();
">

⭐ ${anime.rating}

</div>
</div>
`;
});

}

function exportJSON(){

const blob =
new Blob(
[JSON.stringify(animeList,null,2)],
{type:"application/json"}
);

download(blob,"anime.json");
}

function exportCSV(){

let csv =
"title,status,rating\n";

animeList.forEach(a=>{

csv +=
`${a.title},
${a.status},
${a.rating}\n`;

});

const blob =
new Blob([csv],
{type:"text/csv"});

download(blob,"anime.csv");
}

function download(blob,name){

const a =
document.createElement("a");

a.href =
URL.createObjectURL(blob);

a.download = name;

a.click();
}

document
.getElementById("importFile")
.addEventListener(
"change",
function(e){

const file =
e.target.files[0];

const reader =
new FileReader();

reader.onload=function(){

if(file.name.endsWith(".json")){

animeList =
JSON.parse(reader.result);

save();
}

};

reader.readAsText(file);

});

renderList();
