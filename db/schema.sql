begin transaction;

CREATE TABLE papers (
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

end transaction;