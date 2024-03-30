begin transaction;

CREATE TABLE IF NOT EXISTS Authors (
  author_id INTEGER PRIMARY KEY,
  author_name TEXT
);

CREATE TABLE IF NOT EXISTS Books (
  book_id INTEGER PRIMARY KEY,
  book_title TEXT
);

CREATE TABLE IF NOT EXISTS AuthorBook (
  author_id INTEGER,
  book_id INTEGER,
  FOREIGN KEY (author_id) REFERENCES Authors(author_id),
  FOREIGN KEY (book_id) REFERENCES Books(book_id)
);

INSERT INTO
  Authors (author_id, author_name)
VALUES
  (1, 'Author 1');

INSERT INTO
  Authors (author_id, author_name)
VALUES
  (2, 'Author 2');

INSERT INTO
  Books (book_id, book_title)
VALUES
  (1, 'Book 1');

INSERT INTO
  Books (book_id, book_title)
VALUES
  (2, 'Book 2');

INSERT INTO
  AuthorBook (author_id, book_id)
VALUES
  (1, 1);

-- Author 1 wrote Book 1
INSERT INTO
  AuthorBook (author_id, book_id)
VALUES
  (1, 2);

-- Author 1 wrote Book 2
INSERT INTO
  AuthorBook (author_id, book_id)
VALUES
  (2, 1);

-- Author 2 wrote Book 1
end transaction;