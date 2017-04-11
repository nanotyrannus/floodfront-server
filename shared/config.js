"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.port = 8080; //port for server
exports.home = process.env.HOME;
exports.databaseUrl = "postgres://ryan:1234@localhost:5432/floodfront";
exports.databaseName = "floodfront";
exports.databasePort = 5432;
exports.databaseUser = "ryan";
exports.keyPath = process.env["FLOODFRONT_KEY"];
exports.certPath = process.env["FLOODFRONT_CERT"];
exports.appRoot = process.env["FLOODFRONT_ROOT"];
