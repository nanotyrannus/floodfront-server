"use strict";
const Koa = require("koa");
const config = require("./shared/config");
const user_routes_1 = require("./routes/user-routes");
const database_1 = require("./shared/database");
const fs = require("fs");
const body = require("koa-better-body");
const path = require("path");
const co = require("co");
const cors = require("koa-cors");
const app = new Koa();
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
    app.use(cors());
    app.use(user_routes_1.userRouter.routes());
    app.listen(config.port);
    console.log(`Home: ${config.home}`);
    console.log(`Listening on ${config.port}`);
})();
