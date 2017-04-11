import * as pg from "pg"
import * as config from "./config"
const co: any = require('co')

const options = {
  user: 'ryan', //env var: PGUSER
  database: config.databaseName, //env var: PGDATABASE
//   password: '', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
}

const pool = new pg.Pool(options)

// let pool = new Pool({
//     "database" : config.databaseName,
//     "port" : config.databasePort,
//     "user" : config.databaseUser
// })

export function query(queryString: string, args: any[] = null): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        pool.connect((err, client, done) => {
            if (err) {
                console.warn("Connection to pool rejected.")
                reject(err)
            } else {
                client.query(queryString, args, (err, result) => {
                    if (err) {
                        console.warn("Query rejected.")
                        console.error(err)
                        reject(err)
                    } else {
                        done()
                        resolve(result)
                    }
                })
            }
        })
    })
}


// export async function query(query: string, args: any[] = null) {
//     let client = await pool.connect()
//     let result = await client.query(query, args)
//     return result
// }

