const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function getCommand(command) {
    if (process.platform === "win32") {
        return `${command}.cmd`;
    }

    return command;
}

function runCommand(command, args, projectPath) {
    const executable = getCommand(command);

    console.log(
        `\n🚀 Running: ${executable} ${args.join(" ")}\n`
    );

    const result = spawnSync(
        executable,
        args,
        {
            cwd: projectPath,
            stdio: "inherit",
            shell: false
        }
    );

    if (result.error) {
        console.log(
            `❌ Failed to run ${executable}: ${result.error.message}`
        );

        return false;
    }

    return result.status === 0;
}

function runNodeProject(projectPath) {
    const packageJsonPath =
        path.join(projectPath, "package.json");

    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
            fs.readFileSync(
                packageJsonPath,
                "utf8"
            )
        );

        const scripts =
            packageJson.scripts || {};

        if (scripts.dev) {
            return runCommand(
                "npm",
                ["run", "dev"],
                projectPath
            );
        }

        if (scripts.start) {
            return runCommand(
                "npm",
                ["start"],
                projectPath
            );
        }
    }

    const mainFiles = [
        "main.js",
        "index.js",
        "app.js",
        "server.js"
    ];

    for (const file of mainFiles) {
        const filePath =
            path.join(
                projectPath,
                file
            );

        if (fs.existsSync(filePath)) {
            return runCommand(
                "node",
                [file],
                projectPath
            );
        }
    }

    console.log(
        "❌ Could not determine how to run this Node.js project"
    );

    return false;
}

module.exports = runNodeProject;