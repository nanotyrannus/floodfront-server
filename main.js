"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const config = require("./shared/config");
const user_routes_1 = require("./routes/user-routes");
const database_1 = require("./shared/database");
const https = require("https");
const enforceSsl = require("koa-sslify");
const fs = require("fs");
const send = require("koa-send");
const body = require("koa-better-body");
const path = require("path");
const co = require("co");
const cors = require("koa-cors");
const app = new Koa();
const sslOptions = {
    "key": fs.readFileSync(config.keyPath),
    "cert": fs.readFileSync(config.certPath)
};
co.wrap(function* () {
    let initialization = fs.readFileSync(`./initialize.pgsql`);
    yield database_1.query(initialization.toString());
    let result = yield database_1.query("SELECT NOW()");
    console.log(result.rows[0].now);
    // app.use(body({
    //     files: "files",
    //     uploadDir: path.join(__dirname, 'uploads'),
    //     keepExtensions: true
    // }))
    // app.use(function* () {
    //     console.log(this.request.files)
    // })
    app.use(enforceSsl());
    app.use(cors());
    app.use(function* (next) {
        console.log(`Requesting ${this.path}`);
        if (this.path === "/") {
            yield send(this, "index.html", { "root": config.appRoot });
        }
        else if (this.path.substring(0, 14) === "/node_modules/") {
            yield send(this, this.path, { "root": `${config.appRoot}` });
        }
        else {
            try {
                fs.accessSync(`${config.appRoot}${this.path}`, fs.constants.F_OK);
                yield send(this, `${this.path}`, { "root": config.appRoot });
            }
            catch (e) {
                console.log(`${this.path} file not found.`);
                yield next;
            }
        }
        app.use(user_routes_1.userRouter.routes());
    });
    // app.listen(config.port)
    // http.createServer(app.callback()).listen(80)
    // http.createServer(app.callback()).listen(config.port)
    https.createServer(sslOptions, app.callback()).listen(443);
    https.createServer(sslOptions, app.callback()).listen(config.port);
    console.log(`Home: ${config.home}`);
    console.log(`Listening on ${config.port}`);
})();
