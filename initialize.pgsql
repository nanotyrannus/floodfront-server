CREATE TABLE IF NOT EXISTS app_user (
    id                              SERIAL UNIQUE,
    email           TEXT            NOT NULL UNIQUE,
    first_name      TEXT,
    last_name       TEXT
);

CREATE TABLE IF NOT EXISTS event (
    id                              SERIAL UNIQUE,
    name            TEXT            NOT NULL,
    description     TEXT            NOT NULL,
    bbox            GEOMETRY(Polygon, 4326)
);

CREATE TABLE IF NOT EXISTS marker (
    id                              SERIAL UNIQUE,
    user_id         INTEGER         REFERENCES app_user (id) ON DELETE CASCADE,
    event_id        INTEGER         REFERENCES event (id) ON DELETE CASCADE,
    heading         FLOAT8          CONSTRAINT degree_range_check CHECK (heading >= 0 AND heading <=360),
    lat             NUMERIC,
    lon             NUMERIC
);