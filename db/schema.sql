begin transaction;

CREATE TABLE IF NOT EXISTS papers (
  id INTEGER PRIMARY KEY,
  title TEXT,
  authors TEXT,
  date TEXT,
  published_in TEXT,
  keywords_raw TEXT,
  abstract TEXT,
  link TEXT,
  downloads INTEGER
);

CREATE TABLE IF NOT EXISTS papers_test (
  id INTEGER PRIMARY KEY,
  title TEXT,
  authors TEXT,
  date TEXT,
  published_in TEXT,
  keywords_raw TEXT,
  abstract TEXT,
  link TEXT,
  downloads INTEGER
);

CREATE VIRTUAL TABLE IF NOT EXISTS papers_search USING fts5(id, title, keywords_raw, abstract);

INSERT INTO
  papers_search(id, title, keywords_raw, abstract)
SELECT
  id,
  title,
  keywords_raw,
  abstract
FROM
  papers
end transaction;