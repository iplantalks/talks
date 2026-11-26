const express = require("express");

const es = {
  hostname: process.env.ES_HOSTNAME || "http://localhost:9200",
  username: process.env.ES_USERNAME || "elastic",
  password: process.env.ES_PASSWORD || "changeme",
  index: process.env.ES_INDEX || "talks",
};

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/data", async (req, res) => {
  const json = await fetch(es.hostname + "/" + es.index + "/_search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: "Basic " + Buffer.from(es.username + ":" + es.password).toString("base64"),
    },
    body: JSON.stringify({
      size: 0,
      query: {
        match_all: {},
      },
      aggs: {
        types: {
          terms: {
            field: "types",
            size: 100,
          },
        },
        years: {
          terms: {
            field: "year",
          },
        },
        levels: {
          terms: {
            field: "levels",
          },
        },
        categories: {
          terms: {
            field: "categories",
            size: 100,
          },
        },
        authors: {
          terms: {
            field: "authors",
            size: 100,
          },
        },
        statuses: {
          terms: {
            field: "status",
          },
        },
      },
    }),
  }).then((r) => r.json());
  const data = {
    types: json.aggregations.types.buckets.map((b) => b.key).sort((a, b) => a.localeCompare(b)),
    years: json.aggregations.years.buckets
      .map((b) => b.key)
      .sort((a, b) => b - a)
      .map((y) => y.toString()),
    levels: json.aggregations.levels.buckets.map((b) => b.key).sort((a, b) => a.localeCompare(b)),
    categories: json.aggregations.categories.buckets.map((b) => b.key).sort((a, b) => a.localeCompare(b)),
    authors: json.aggregations.authors.buckets.map((b) => b.key).sort((a, b) => a.localeCompare(b)),
    statuses: json.aggregations.statuses.buckets.map((b) => b.key).sort((a, b) => a.localeCompare(b)),
  };
  // console.log(data);
  res.json(data);
});

app.get("/search", async (req, res) => {
  const search = req.query.search ?? "";
  const years = req.query.years ? (Array.isArray(req.query.years) ? req.query.years : [req.query.years]) : [];
  const levels = req.query.levels ? (Array.isArray(req.query.levels) ? req.query.levels : [req.query.levels]) : [];
  const categories = req.query.categories ? (Array.isArray(req.query.categories) ? req.query.categories : [req.query.categories]) : [];
  const authors = req.query.authors ? (Array.isArray(req.query.authors) ? req.query.authors : [req.query.authors]) : [];
  const statuses = req.query.statuses ? (Array.isArray(req.query.statuses) ? req.query.statuses : [req.query.statuses]) : [];
  const types = req.query.types ? (Array.isArray(req.query.types) ? req.query.types : [req.query.types]) : [];
  // "date" sorts newest first (freshness); anything else sorts by relevance (default).
  const sort = req.query.sort === "date" ? "date" : "relevance";

  const must = [];

  if (search) {
    must.push({
      multi_match: {
        query: search,
        fields: ["title^5", "description^3", "transcript"],
        type: "best_fields",
      },
    });
  }

  if (types.length) {
    must.push({
      terms: {
        types: types,
      },
    });
  }

  if (years.length) {
    must.push({
      terms: {
        year: years,
      },
    });
  }

  if (levels.length) {
    must.push({
      terms: {
        levels: levels,
      },
    });
  }

  // "Спецетер" (special broadcasts / weekly news) and the "Архів" status are hidden by
  // default and only appear when their reveal checkbox is checked. So "Спецетер" is never
  // a normal restrict filter, and status is handled purely through must_not below.
  const showNews = categories.includes("Спецетер");
  const showArchive = statuses.includes("Архів");
  const restrictCategories = categories.filter((c) => c !== "Спецетер");

  if (restrictCategories.length) {
    must.push({
      terms: {
        categories: restrictCategories,
      },
    });
  }

  if (authors.length) {
    must.push({
      terms: {
        authors: authors,
      },
    });
  }

  const must_not = [];

  if (!showNews) {
    must_not.push({
      terms: {
        categories: ["Спецетер"],
      },
    });
  }

  if (!showArchive) {
    must_not.push({
      terms: {
        status: ["Архів"],
      },
    });
  }

  const body = {
    size: search || types.length || years.length || levels.length || categories.length || authors.length || statuses.length ? 1000 : 40,
    _source: ["title", "description", "authors", "categories", "levels", "date", "year", "telegram"],
    query: {
      bool: {
        must,
        must_not,
      },
    },
    sort:
      sort === "date"
        ? [{ date: { order: "desc" } }, { _score: { order: "desc" } }]
        : [{ _score: { order: "desc" } }, { date: { order: "desc" } }],
  };

  // console.log(JSON.stringify(body.query, null, 2));

  const json = await fetch(es.hostname + "/" + es.index + "/_search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: "Basic " + Buffer.from(es.username + ":" + es.password).toString("base64"),
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
  const items = json.hits.hits.map((hit) => ({
    ...hit._source,
    id: hit._id,
  }));
  res.json(items);
});

app.listen(3000, () =>
  console.log(
    JSON.stringify({
      message: "Server started",
      port: 3000,
      es: {
        hostname: es.hostname,
        username: es.username,
        index: es.index,
      },
    }),
  ),
);
