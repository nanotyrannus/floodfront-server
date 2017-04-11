"use strict";
const Router = require("koa-router");
const database_1 = require("../shared/database");
// import fs = require("fs")
const fs = require("fs-extra");
const body = require("koa-better-body");
const send = require("koa-send");
exports.userRouter = new Router();
exports.userRouter
    .get("/get/now", function* () {
    try {
        this.body = yield database_1.query("SELECT NOW()");
    }
    catch (err) {
        console.log("um");
    }
})
    .post("/ping", body(), function* () {
    console.log(`from ping:`, this.request.body);
    this.body = {
        "recieved": this.request.fields
    };
})
    .post("/login", body(), function* () {
    let result = yield database_1.query(`
            SELECT COUNT(*) > 0 AS exists
            FROM app_user
            WHERE email=$1
            LIMIT 1
        `, [this.request.fields.email]);
    let exists = result.rows[0].exists;
    console.log(this.request.fields.email);
    if (!exists) {
        yield database_1.query(`
                INSERT INTO app_user (email)
                VALUES ($1)
            `, [this.request.fields.email]);
        console.log(`New email: ${this.request.fields.email}`);
    }
    else {
        console.log(`Returning user: ${this.request.fields.email}`);
    }
    console.log(`FROM /LOGIN`, this.request.fields);
    this.body = "whatever";
})
    .get("/event", function* () {
    //TODO return events
    let result = yield database_1.query(`
            SELECT id, name, description, ST_AsGeoJSON( bbox ) AS bounds
            FROM event
        `);
    console.log(result.rows);
    this.body = result.rows;
})
    .post("/event", body(), function* () {
    console.log(this.request.fields);
    let data = this.request.fields;
    let bounds = data.bounds;
    let polygonString = `LINESTRING(${bounds.minLon} ${bounds.minLat}, ${bounds.maxLon} ${bounds.minLat}, ${bounds.maxLon} ${bounds.maxLat}, ${bounds.minLon} ${bounds.maxLat}, ${bounds.minLon} ${bounds.minLat})`;
    let result = yield database_1.query(`
            INSERT INTO event (name, description, bbox)
            VALUES ($1, $2, ST_MakePolygon( ST_SetSRID( ST_GeomFromText($3), 4326 ) ))
        `, [data.name, data.description, polygonString]);
    this.body = `Event recieved`;
})
    .post("/marker/:eventId/retrieve", body(), function* () {
    let eventId = this.params.eventId;
    let email = this.request.fields.email;
    if (email == null || eventId == null) {
        throw new Error(`Bad request: ${email} ${eventId}`);
    }
    let userId = (yield database_1.query(`
            SELECT id
            FROM app_user
            WHERE email=$1
        `, [email])).rows[0].id;
    let result = (yield database_1.query(`
            SELECT *
            FROM marker
            WHERE user_id=$1 AND event_id=$2
        `, [userId, eventId])).rows;
    this.body = {
        "markers": result
    };
})
    .post("/marker/:eventId", body(), function* () {
    console.log(this.request.fields);
    let req = this.request.fields;
    let eventId = this.params.eventId;
    let userId = (yield database_1.query(`
            SELECT id
            FROM app_user
            WHERE email=$1
        `, [req.email])).rows[0].id;
    let result = yield database_1.query(`
            INSERT INTO marker (user_id, event_id, lon, lat, heading)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [userId, eventId, req.lon, req.lat, req.heading]);
    this.body = {
        "message": `Marker recieved: ${result.rows[0].id} for event ${eventId}`,
        "id": result.rows[0].id
    };
})
    .post("/marker/:markerId/update", body(), function* () {
    console.log("marker update", this.request.fields);
    let req = this.request.fields;
    console.log(this.params);
    let result = yield database_1.query(`
            UPDATE marker
            SET lat=$1, lon=$2
            WHERE id=$3
        `, [req.lat, req.lon, this.params.markerId]);
    this.body = { "message": `Marker ${this.params.markerId} updated.` };
})
    .delete("/marker/markerId", function* () {
})
    .post("/upload", body(), function* (next) {
    console.log(this.request.fields);
    console.log(this.request.files);
    console.log(this.request.files[0].path);
    let file = fs.copySync(this.request.files[0].path, `./uploads/${this.request.fields.marker_id}.jpg`);
    console.log(this.request.body);
    this.body = "hey";
    yield next;
})
    .get("/chain/:value", function* (next) {
    let params = this.params;
    this.body = params.value;
    if (params.value > 5) {
        yield next;
    }
}, function* () {
    this.body = `next middleware reached`;
})
    .get("/download", function* () {
    yield send(this, "./uploads/Arachis glabrata.jpg");
});
