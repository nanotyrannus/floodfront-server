"use strict";
const pg = require("pg");
const config = require("./config");
const co = require('co');
const options = {
    user: 'ryan',
    database: config.databaseName,
    //   password: '', //env var: PGPASSWORD
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
};
const pool = new pg.Pool(options);
// let pool = new Pool({
//     "database" : config.databaseName,
//     "port" : config.databasePort,
//     "user" : config.databaseUser
// })
function query(queryString, args = null) {
    return new Promise((resolve, reject) => {
        pool.connect((err, client, done) => {
            if (err) {
                console.warn("Connection to pool rejected.");
                reject(err);
            }
            else {
                client.query(queryString, args, (err, result) => {
                    if (err) {
                        console.warn("Query rejected.");
                        console.error(err);
                        reject(err);
                    }
                    else {
                        done();
                        resolve(result);
                    }
                });
            }
        });
    });
}
exports.query = query;
// export async function query(query: string, args: any[] = null) {
//     let client = await pool.connect()
//     let result = await client.query(query, args)
//     return result
// }
