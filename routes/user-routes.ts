import * as Router from "koa-router"
import { query } from "../shared/database"
import * as config from "../shared/config"
// import fs = require("fs")
const fs: any = require("fs-extra")
const body: any = require("koa-better-body")
const send: any = require("koa-send")

export let userRouter = new Router()

userRouter
    .get("/get/now", function* () {
        try {
            this.body = yield query("SELECT NOW()")
        } catch (err) {
            console.log("um")
        }
    })
    .post("/ping", body(), function* () {
        console.log(`from ping:`, this.request.body)
        this.body = {
            "recieved": this.request.fields
        }
    })
    .post("/login", body(), function* () {
        let result = yield query(`
            SELECT COUNT(*) > 0 AS exists
            FROM app_user
            WHERE email=$1
            LIMIT 1
        `, [this.request.fields.email])
        let exists = result.rows[0].exists
        console.log(this.request.fields.email)
        if (!exists) {
            yield query(`
                INSERT INTO app_user (email)
                VALUES ($1)
            `, [this.request.fields.email])
            console.log(`New email: ${this.request.fields.email}`)
        } else {
            console.log(`Returning user: ${this.request.fields.email}`)
        }

        console.log(`FROM /LOGIN`, this.request.fields)
        this.body = "whatever"
    })
    .get("/event", function* () {
        //TODO return events
        let result = yield query(`
            SELECT id, name, description, ST_AsGeoJSON( bbox ) AS bounds
            FROM event
        `)
        console.log(result.rows)
        this.body = result.rows
    })
    .post("/event", body(), function* () {
        console.log(this.request.fields)
        let data = this.request.fields
        let bounds = data.bounds
        let polygonString = `LINESTRING(${bounds.minLon} ${bounds.minLat}, ${bounds.maxLon} ${bounds.minLat}, ${bounds.maxLon} ${bounds.maxLat}, ${bounds.minLon} ${bounds.maxLat}, ${bounds.minLon} ${bounds.minLat})`
        let result = yield query(`
            INSERT INTO event (name, description, bbox)
            VALUES ($1, $2, ST_MakePolygon( ST_SetSRID( ST_GeomFromText($3), 4326 ) ))
        `, [data.name, data.description, polygonString])
        this.body = `Event recieved`
    })
    .post("/marker/:eventId/retrieve", body(), function* () { // Get all markers
        let eventId = this.params.eventId
        let email = this.request.fields.email
        if (email == null || eventId == null) {
            throw new Error(`Bad request: ${email} ${eventId}`)
        }
        let userId = (yield query(`
            SELECT id
            FROM app_user
            WHERE email=$1
        `, [email])).rows[0].id
        let result = (yield query(`
            SELECT *
            FROM marker
            WHERE user_id=$1 AND event_id=$2 AND created >= NOW()::date
        `, [userId, eventId])).rows
        this.body = {
            "markers": result
        }
    })
    .post("/marker/:markerId/description", body(), function* () {
        let markerId = this.params.markerId
        let req = this.request.fields
        let result = yield query(`
            UPDATE marker
            SET description=$1
            WHERE id=$2
        `, [req.description, markerId])
        this.body = {
            "message" : `Description for ${markerId} recieved`
        }
    })
    .post("/marker/:eventId", body(), function* () { // Create marker
        console.log(this.request.fields)
        let req = this.request.fields
        let eventId = this.params.eventId
        let userId = (yield query(`
            SELECT id
            FROM app_user
            WHERE email=$1
        `, [req.email])).rows[0].id
        let result = yield query(`
            INSERT INTO marker (user_id, event_id, lon, lat, heading, marker_type, error_margin)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [userId, eventId, req.lon, req.lat, req.heading, req.type, req.errorMargin])
        this.body = {
            "message": `Marker recieved: ${result.rows[0].id} for event ${eventId}`,
            "id": result.rows[0].id
        }
    })
    .post("/marker/:markerId/update", body(), function* () { //Update marker
        console.log("marker update", this.request.fields)
        let req = this.request.fields
        console.log(this.params)
        let result = yield query(`
            UPDATE marker
            SET lat=$1, lon=$2
            WHERE id=$3
        `, [req.lat, req.lon, this.params.markerId])
        this.body = { "message": `Marker ${this.params.markerId} updated.` }
    })
    .post("/marker/:markerId/delete", body(), function* () {
        console.log(`POST /marker/${this.params.markerId}/delete\n`, this.request.fields)
        let req = this.request.fields
        let result = yield query(`
            DELETE FROM marker
            WHERE id=$1
        `, [this.params.markerId])
        this.body = {
            "message": `Marker ${this.params.markerId} deleted.`,
            "id": this.params.markerId
        }
    })
    .delete("/marker/markerId", function* () { // Delete marker

    })
    .post("/upload", body(), function* (next) {
        console.log(this.request.fields)
        console.log(this.request.files)
        console.log(this.request.files[0].path)
        let file = fs.copySync(this.request.files[0].path, `${config.appRoot}/uploads/${this.request.fields.marker_id}.jpg`)
        console.log(this.request.body)
        this.body = "hey"
        yield next
    })
    .get("/chain/:value", function* (next) {
        let params = this.params
        this.body = params.value
        if (params.value > 5) {
            yield next
        }
    }, function* () {
        this.body = `next middleware reached`
    })
    .get("/download", function* () {
        yield send(this, "./uploads/Arachis glabrata.jpg")
    })


