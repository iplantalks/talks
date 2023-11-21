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

app.get("/search", async (req, res) => {
  var filters = [];
  if (req.query.categories) {
    if (Array.isArray(req.query.categories)) {
      for (var categories of req.query.categories) {
        filters.push({
          match: {
            categories: categories,
          },
        });
      }
    } else {
      filters.push({
        match: {
          categories: req.query.categories,
        },
      });
    }
  }
  if (req.query.year) {
    if (Array.isArray(req.query.year)) {
      for (var year of req.query.year) {
        filters.push({
          match: {
            year: year,
          },
        });
      }
    } else {
      filters.push({
        match: {
          year: req.query.year,
        },
      });
    }
  }
  if (req.query.levels) {
    if (Array.isArray(req.query.levels)) {
      for (var levels of req.query.levels) {
        filters.push({
          match: {
            levels: levels,
          },
        });
      }
    } else {
      filters.push({
        match: {
          levels: req.query.levels,
        },
      });
    }
  }
  if (req.query.authors) {
    if (Array.isArray(req.query.authors)) {
      for (var authors of req.query.authors) {
        filters.push({
          match: {
            authors: authors,
          },
        });
      }
    } else {
      filters.push({
        match: {
          authors: req.query.authors,
        },
      });
    }
  }
  if (req.query.status) {
    if (Array.isArray(req.query.status)) {
      for (var status of req.query.status) {
        filters.push({
          match: {
            status: status,
          },
        });
      }
    } else {
      filters.push({
        match: {
          status: req.query.status,
        },
      });
    }
  }

  const should = [];
  if (req.query.q) {
    const where = req.query.where ? (Array.isArray(req.query.where) ? req.query.where : [req.query.where]) : ["title", "description", "transcript"];
    var boosts = {
      title: 5,
      description: 2,
    };
    for (var field of where) {
      should.push({
        match_phrase_prefix: {
          [field]: {
            query: req.query.q,
            boost: boosts[field] || 1,
          },
        },
      });
    }
  }

  const json = await fetch(es.hostname + "/" + es.index + "/_search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: "Basic " + Buffer.from(es.username + ":" + es.password).toString("base64"),
    },
    body: JSON.stringify({
      _source: ["title", "description", "authors", "categories", "levels", "date", "year", "telegram"],
      query: {
        bool: {
          must: [
            // query
            {
              bool: {
                should: should,
              },
            },
            // filters
            ...filters,
          ],
        },
      },
      highlight: {
        pre_tags: ["<mark>"],
        post_tags: ["</mark>"],
        fields: {
          title: {},
          description: {},
          transcript: {},
        },
      },
      aggs: {
        year: {
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
          },
        },
        authors: {
          terms: {
            field: "authors",
          },
        },
        status: {
          terms: {
            field: "status",
          },
        },
      },
      sort: [
        {
          _score: {
            order: "desc",
          },
        },
        {
          date: {
            order: "desc",
          },
        },
      ],
    }),
  }).then((res) => res.json());
  res.json(json);
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
    })
  )
);
