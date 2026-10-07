const fs = require("fs");
const path = require("path");


function readEnv(projectPath) {
    const file = path.join(projectPath, ".env");

    if (!fs.existsSync(file)) {
        return {};
    }

    const lines = fs.readFileSync(file, "utf8")
        .split("\n");

    const env = {};

    for (const line of lines) {
        const [key, value] = line.split("=");

        if (key && value) {
            env[key.trim()] = value.trim();
        }
    }

    return env;
}


function detectDatabase(projectPath) {

    const env = readEnv(projectPath);

    const db = env.DB_CONNECTION;


    switch (db) {

        case "mysql":
            return {
                type: "mysql",
                services: [
                    "mariadb",
                    "mysql"
                ]
            };


        case "pgsql":
            return {
                type: "postgresql",
                services: [
                    "postgresql"
                ]
            };


        case "mongodb":
            return {
                type: "mongodb",
                services: [
                    "mongodb"
                ]
            };


        case "sqlite":
            return {
                type: "sqlite",
                services: []
            };


        default:
            return {
                type: null,
                services: []
            };
    }
}


module.exports = {
    detectDatabase
};
