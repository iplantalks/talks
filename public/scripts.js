// state
var search = "";
var categories = [];
var year = [];
var levels = [];
var authors = [];
var status = [];
var where = ["title", "description", "transcript"];

// read state from query string
function init() {
  var params = new URLSearchParams(window.location.search.substring(1));
  search = params.get("q");
  document.getElementById("search").value = search;
  categories = params.getAll("categories");
  year = params.getAll("year");
  levels = params.getAll("levels");
  authors = params.getAll("authors");
  status = params.getAll("status");
  where = params.getAll("where");
  for (var c of where) {
    document.querySelector('input[type="checkbox"][name="where"][value="' + c + '"]').checked = true;
  }
  console.log("init", { search, categories, year, levels, authors, status, where });
}

// push state to query string
function persist() {
  var params = new URLSearchParams();
  params.set("q", search);
  for (var c of categories) {
    params.append("categories", c);
  }
  for (var c of year) {
    params.append("year", c);
  }
  for (var c of levels) {
    params.append("levels", c);
  }
  for (var c of authors) {
    params.append("authors", c);
  }
  for (var c of status) {
    params.append("status", c);
  }
  for (var c of where) {
    params.append("where", c);
  }
  console.log("persist", params);
  window.history.pushState(null, window.title, `${window.location.pathname}?${params}`);
}

// perform search, render results
async function load() {
  var url = new URL("/search", window.location.origin);

  if (search) {
    url.searchParams.set("q", search);
  }

  for (var c of categories) {
    url.searchParams.append("categories", c);
  }

  for (var c of year) {
    url.searchParams.append("year", c);
  }

  for (var c of levels) {
    url.searchParams.append("levels", c);
  }

  for (var c of authors) {
    url.searchParams.append("authors", c);
  }

  for (var c of Array.isArray(status) ? status : [status]) {
    url.searchParams.append("status", c);
  }

  for (var c of where) {
    url.searchParams.append("where", c);
  }

  window.res = await fetch(url).then((res) => res.json());

  renderItems(res);
  rednerFacets(res);
  if (typeof gtag !== "undefined") {
    gtag("event", "view_search_results", {
      search_term: search,
    });
  }
}

function renderItems(res) {
  var html = "";
  for (var hit of res?.hits?.hits || []) {
    var h = "";
    if (hit.highlight?.description) {
      h += hit.highlight.description.join("<br>");
    } else if (hit.highlight?.transcript) {
      h += hit.highlight.transcript.join("<br>");
    } else {
      h += hit._source.description ? hit._source.description?.substring(0, 200) + "&hellip;" : "Опис відсутній";
    }

    html += `<div class="item">
      <p><a href="${hit._source.telegram}" target="_blank" rel="nofollow"><img width="300" src="https://img.youtube.com/vi/${hit._id}/0.jpg" alt="${hit._source.title}" /></a></p>
      <div>
        <h2><a href="${hit._source.telegram}" target="_blank" rel="nofollow">${hit.highlight?.title || hit._source.title}</a></h2>
        <p class="desc">${h}</p>
        <p>${[hit._source.year, hit._source.categories.join(", "), hit._source.levels.join(", "), hit._source.authors.join(", ")].join(" <span>|</span> ")}</p>
      </div>
    </div>`;
  }

  if (!html) {
    html += "<h2>Нажаль за вашим запитом нічого не знайдено</h2>";
    html += "<p>Можливо варто спробувати ввести в пошук якийсь синонім чи лише частину шукомого слова, або його англійский варіант.</p>";
    html += '<p>Так наприклад можна знайти матеріали за запитом "бітко...", "битко...", "bitc..."</p>';
    html += '<p>Якщо не спрацювало, не біда, адже саме для того і існує комьюніті, спробуй сформулювати потребу та тему для єфіру та надішли повідомлення до каналу "Анонс єфірів". Щокварталу, теми що є найактуальнішими проходять голосування та обираються до обробки, тож наявність саме твого запиту збільшить імовірність появи такого матеріалу у майбутьному.</p>';
  }
  document.getElementById("results").innerHTML = html;
}

function rednerFacets(res) {
  var html = "";

  html += renderFacet(res?.aggregations?.categories?.buckets, "categories", "Тематика", categories);
  html += renderFacet(res?.aggregations?.year?.buckets, "year", "Рік", year);
  html += renderFacet(res?.aggregations?.levels?.buckets, "levels", "Складність", levels);
  html += renderFacet(res?.aggregations?.authors?.buckets, "authors", "Спікер", authors);
  html += renderFacet(res?.aggregations?.status?.buckets, "status", "Статус", status);

  document.getElementById("facets").innerHTML = html;
}

function renderFacet(buckets, name, title, state) {
  if (!buckets || !buckets.length) {
    return "";
  }
  var html = `<p><b>${title}</b></p>`;
  for (var f of buckets || []) {
    html += `<p>
      <input type="checkbox" name="${name}" value="${f.key}" id="${f.key}" ${state.includes(f.key.toString()) ? "checked" : ""} />
      <label for="${f.key}">${f.key}&nbsp;<span>(${f.doc_count})</span></label>
    </p>`;
  }
  return html;
}

// whenever user types something into search box - reset all checkboxes, change url and perform search
document.querySelector("#search").addEventListener("input", (event) => {
  search = event.target.value;
  categories = [];
  year = [];
  levels = [];
  authors = [];
  status = [];
  persist();
  load();
});

// click on any facet - pushes query string parameters and performs search
document.querySelector(".main aside").addEventListener("change", async () => {
  categories = Array.from(document.querySelectorAll("input[name='categories']:checked")).map((el) => el.value);
  year = Array.from(document.querySelectorAll("input[name='year']:checked")).map((el) => el.value);
  levels = Array.from(document.querySelectorAll("input[name='levels']:checked")).map((el) => el.value);
  authors = Array.from(document.querySelectorAll("input[name='authors']:checked")).map((el) => el.value);
  status = Array.from(document.querySelectorAll("input[name='status']:checked")).map((el) => el.value);
  if (!Array.isArray(status)) {
    status = [status];
  }
  where = Array.from(document.querySelectorAll("input[name='where']:checked")).map((el) => el.value);
  console.log("change", status);
  persist();
  load();
});

// whenever browser back button pressed - read query string params and load search results
window.addEventListener("popstate", (event) => {
  init();
  load();
});

// on initial page load, init variables and load search results - last videos will be shown
init();
load();
