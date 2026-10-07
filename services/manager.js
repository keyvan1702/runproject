const { spawnSync } = require("child_process");

function runCommand(
    command,
    args = [],
    options = {}
) {
    const result = spawnSync(
        command,
        args,
        {
            encoding: "utf8",
            ...options
        }
    );

    if (result.error) {
        return null;
    }

    return result;
}

function isLinux() {
    return process.platform === "linux";
}

function isRunning(service) {
    if (!isLinux()) {
        return false;
    }

    const result = runCommand(
        "systemctl",
        [
            "is-active",
            service
        ]
    );

    if (!result) {
        return false;
    }

    return (
        result.status === 0 &&
        result.stdout.trim() === "active"
    );
}

function start(service) {
    console.log(
        `🔧 Starting ${service}...`
    );

    if (!isLinux()) {
        console.log(
            `⚠ Automatic service management is not supported on ${process.platform}`
        );

        return false;
    }

    const result = runCommand(
        "sudo",
        [
            "systemctl",
            "start",
            service
        ],
        {
            stdio: "inherit"
        }
    );

    if (!result || result.status !== 0) {
        return false;
    }

    return isRunning(service);
}

function ensure(service) {
    if (!isLinux()) {
        console.log(
            `⚠ Cannot automatically manage ${service} on ${process.platform}`
        );

        return false;
    }

    if (isRunning(service)) {
        console.log(
            `✅ ${service} running`
        );

        return true;
    }

    console.log(
        `⚠ ${service} stopped`
    );

    return start(service);
}

function ensureDatabase(projectPath) {
    const detector =
        require("./database-detector");

    const db =
        detector.detectDatabase(
            projectPath
        );

    console.log(
        `🗄 Database: ${db.type || "none"}`
    );

    if (db.services.length === 0) {
        return true;
    }

    if (!isLinux()) {
        console.log(
            `⚠ Database service detected, but automatic service management is not supported on ${process.platform}`
        );

        console.log(
            "ℹ️ Please make sure the database server is running."
        );

        return false;
    }

    for (const service of db.services) {
        if (isRunning(service)) {
            console.log(
                `✅ ${service} running`
            );

            return true;
        }

        if (start(service)) {
            console.log(
                `✅ ${service} started`
            );

            return true;
        }
    }

    return false;
}

module.exports = {
    ensure,
    isRunning,
    start,
    ensureDatabase
};