const { execSync } = require("child_process");

function command(cmd) {
    try {
        return execSync(cmd, {
            encoding: "utf8"
        }).trim();
    } catch {
        return null;
    }
}


function isRunning(service) {
    return command(
        `systemctl is-active ${service}`
    ) === "active";
}


function start(service) {
    console.log(`🔧 Starting ${service}...`);

    try {
        execSync(
            `sudo systemctl start ${service}`,
            {
                stdio: "inherit"
            }
        );

        return isRunning(service);

    } catch {
        return false;
    }
}


function ensure(service) {

    if (isRunning(service)) {
        console.log(
            `✅ ${service} running`
        );
        return true;
    }


    console.log(
        `⚠️ ${service} stopped`
    );

    return start(service);
}


module.exports = {
    ensure,
    isRunning,
    start
};
function ensureDatabase(projectPath) {

    const detector =
        require("./database-detector");


    const db =
        detector.detectDatabase(projectPath);


    console.log(
        `🗄 Database: ${db.type || "none"}`
    );


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


    return db.services.length === 0;
}module.exports = {
    ensure,
    isRunning,
    start,
    ensureDatabase
};