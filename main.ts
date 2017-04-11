import * as Koa from "koa"
import * as config from "./shared/config"
import { userRouter } from "./routes/user-routes"
import { query } from "./shared/database"
import http = require("http")
import https = require("https")
import enforceSsl = require("koa-sslify")
import fs = require("fs")
import send = require("koa-send")

const body: any = require("koa-better-body")
const path: any = require("path")
const co: any = require("co")
const cors: any = require("koa-cors")
const app = new Koa()

const sslOptions = {
    "key" : fs.readFileSync(config.keyPath),
    "cert" : fs.readFileSync(config.certPath)
}


co.wrap(function* () {
    let initialization = fs.readFileSync(`./initialize.pgsql`)
    yield query(initialization.toString())
    let result = yield query("SELECT NOW()")
    console.log(result.rows[0].now)
    // app.use(body({
    //     files: "files",
    //     uploadDir: path.join(__dirname, 'uploads'),
    //     keepExtensions: true
    // }))
    // app.use(function* () {
    //     console.log(this.request.files)
    // })
    app.use(enforceSsl())
    app.use(cors())
    app.use(function* (next) {
    console.log(`Requesting ${ this.path }`)
    if (this.path === "/") {
        yield send(this, "index.html", { "root" : config.appRoot})
    } else if (this.path.substring(0, 14) === "/node_modules/") {
        yield send(this, this.path, { "root" : `${ config.appRoot }`})
    } else { //if (this.path.substring(0,5) === "/dist") {
        try {
            fs.accessSync(`${config.appRoot}${this.path}`, fs.constants.F_OK)
            yield send(this, `${ this.path }`, { "root" : config.appRoot })
        } catch (e) {
            console.log(`${this.path} file not found.`)
            yield next
        }
    }
    app.use(userRouter.routes())
})
    // app.listen(config.port)
    // http.createServer(app.callback()).listen(80)
    // http.createServer(app.callback()).listen(config.port)
    https.createServer(sslOptions, app.callback()).listen(443)
     https.createServer(sslOptions, app.callback()).listen(config.port)
    console.log(`Home: ${config.home}`)
    console.log(`Listening on ${config.port}`)
})()
