DROP TABLE IF EXISTS ErrorSuggestion;
CREATE TABLE ErrorSuggestion (
  videoId INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP PRIMARY KEY
);
