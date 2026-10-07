const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const join = (projectPath, ...parts) =>
    path.join(projectPath, ...parts);

const exists = (projectPath, ...parts) =>
    fs.existsSync(join(projectPath, ...parts));

function read(projectPath, file) {
    try {
        return fs.readFileSync(
            join(projectPath, file),
            "utf8"
        );
    } catch {
        return "";
    }
}

function listFiles(projectPath) {
    return fs
        .readdirSync(
            projectPath,
            { withFileTypes: true }
        )
        .filter(entry => entry.isFile())
        .map(entry => entry.name);
}

// Runs a command in the project folder and waits for it to finish.
function run(command, args, cwd) {
    console.log(
        `\n🚀 Running: ${command} ${args.join(" ")}\n`
    );

    const result = spawnSync(
        command,
        args,
        {
            cwd,
            stdio: "inherit"
        }
    );

    if (result.error) {
        console.log(
            `❌ Failed to run ${command}: ${result.error.message}`
        );

        return 1;
    }

    return result.status === null
        ? 130
        : result.status;
}

// Runs a command without blocking.
// Useful for web servers that keep running.
function runAsync(command, args, cwd) {
    const { spawn } =
        require("child_process");

    console.log(
        `\n🚀 Running: ${command} ${args.join(" ")}\n`
    );

    const child = spawn(
        command,
        args,
        {
            cwd,
            stdio: "inherit"
        }
    );

    child.on("error", error => {
        console.log(
            `❌ Failed to run ${command}: ${error.message}`
        );
    });

    return child;
}

// Same, but quiet about being a build step.
// Returns true on success.
function build(command, args, cwd) {
    console.log(
        `\n🔨 Building: ${command} ${args.join(" ")}\n`
    );

    const result = spawnSync(
        command,
        args,
        {
            cwd,
            stdio: "inherit"
        }
    );

    return !result.error &&
        result.status === 0;
}

// Picks the entry file: first of `names` that exists,
// otherwise the only file with one of `exts`.
function findEntry(
    projectPath,
    names,
    exts = []
) {
    for (const name of names) {
        if (exists(projectPath, name)) {
            return name;
        }
    }

    const files =
        listFiles(projectPath)
            .filter(file =>
                exts.some(ext =>
                    file.endsWith(ext)
                )
            );

    return files.length === 1
        ? files[0]
        : null;
}

function noEntry(name) {
    console.log(
        `❌ Could not determine how to run this ${name} project`
    );

    return 1;
}

// Compiled output goes here so the project folder stays clean.
function outDir(projectPath) {
    const dir = join(
        projectPath,
        ".runproject"
    );

    fs.mkdirSync(
        dir,
        { recursive: true }
    );

    return dir;
}

// Finds executables created after `since` (ms)
// in the usual build folders.
function newExecutables(
    projectPath,
    since
) {
    const found = [];

    for (const folder of [
        ".",
        "bin",
        "build",
        "out"
    ]) {
        const dir = join(
            projectPath,
            folder
        );

        if (!fs.existsSync(dir)) {
            continue;
        }

        for (const entry of fs.readdirSync(
            dir,
            { withFileTypes: true }
        )) {
            if (!entry.isFile()) {
                continue;
            }

            const file = path.join(
                dir,
                entry.name
            );

            const stat =
                fs.statSync(file);

            if (stat.mtimeMs < since) {
                continue;
            }

            if (process.platform === "win32") {
                if (
                    entry.name.toLowerCase()
                        .endsWith(".exe")
                ) {
                    found.push(file);
                }

                continue;
            }

            if (
                (stat.mode & 0o111) &&
                !entry.name.includes(".")
            ) {
                found.push(file);
            }
        }
    }

    return found;
}

module.exports = {
    join,
    exists,
    read,
    listFiles,
    run,
    runAsync,
    build,
    findEntry,
    noEntry,
    outDir,
    newExecutables
};