const { exists, run } = require("../languages/helpers");
const fs = require("fs");
const path = require("path");


function prepare(projectPath) {

    console.log("\n⚙ Preparing Laravel...\n");


    // .env
    if (!exists(projectPath, ".env") &&
        exists(projectPath, ".env.example")) {

        console.log("📝 Creating .env");

        fs.copyFileSync(
            path.join(projectPath, ".env.example"),
            path.join(projectPath, ".env")
        );
    }


    // APP_KEY
    console.log("🔑 Checking APP_KEY");

    run(
        "php",
        [
            "artisan",
            "key:generate",
            "--force"
        ],
        projectPath
    );


    // migrate
    console.log("🗄 Running migrations");

    run(
        "php",
        [
            "artisan",
            "migrate",
            "--force"
        ],
        projectPath
    );


    console.log("✅ Laravel ready\n");
}


module.exports = {
    prepare
};
