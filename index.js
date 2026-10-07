const readline = require("readline");
const fs = require("fs");
const path = require("path");

const { detectLanguage } = require("./languages");
const cloneIfEmpty = require("./utils/git-clone");

const { execSync } = require("child_process");

function ask(question) {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

function findProjectPath(basePath) {
    const directProject = detectLanguage(basePath);

    if (directProject) {
        return {
            path: basePath,
            project: directProject
        };
    }

    const entries = fs
        .readdirSync(basePath, { withFileTypes: true })
        .filter(entry =>
            entry.isDirectory() &&
            !entry.name.startsWith(".")
        );

    for (const entry of entries) {
        const subPath = path.join(
            basePath,
            entry.name
        );

        const project = detectLanguage(subPath);

        if (project) {
            return {
                path: subPath,
                project
            };
        }
    }

    return null;
}

async function cloneRepository(projectPath) {
    const answer = await ask(
        "🌐 Do you want to clone a project from GitHub? (y/n): "
    );

    if (answer.toLowerCase() !== "y") {
        return false;
    }

    const repo = await ask(
        "🔗 Enter GitHub repository URL: "
    );

    if (!repo) {
        console.log(
            "❌ No URL provided"
        );

        process.exit(1);
    }

    console.log(
        "\n📥 Cloning repository...\n"
    );

    try {
        execSync(
            "git",
            {
                cwd: projectPath,
                stdio: "inherit"
            }
        );
    } catch {}

    try {
        execSync(
            `git clone ${repo} .`,
            {
                stdio: "inherit",
                cwd: projectPath
            }
        );

        console.log(
            "\n✅ Clone completed\n"
        );

        return true;

    } catch {
        console.log(
            "\n❌ Clone failed"
        );

        process.exit(1);
    }
}

async function main() {

    const basePath = process.cwd();

    await cloneIfEmpty(
        basePath,
        ask
    );

    console.log(
        "🔍 Analyzing project...\n"
    );

    let detected = findProjectPath(
        basePath
    );

    if (!detected) {

        console.log(
            "\n❌ Could not detect project language\n"
        );

        const cloned =
            await cloneRepository(basePath);

        if (!cloned) {
            process.exit(1);
        }

        console.log(
            "🔍 Analyzing cloned project...\n"
        );

        detected = findProjectPath(
            basePath
        );

        if (!detected) {
            console.log(
                "\n❌ Could not detect a supported project\n"
            );

            process.exit(1);
        }
    }

    const projectPath =
        detected.path;

    const project =
        detected.project;

    if (projectPath !== basePath) {
        console.log(
            `📁 Project found in: ${path.relative(basePath, projectPath)}\n`
        );
    }

    console.log(
        `✅ Language: ${project.name}`
    );

    console.log(
        `🔧 Type: ${project.id}`
    );

    console.log(
        "\n⚙ Checking runtime..."
    );

    const tools =
        typeof project.tools === "function"
            ? project.tools(projectPath)
            : [];

    for (const tool of tools) {

        let installed = false;

        try {

            execSync(
                `command -v ${tool.command}`,
                {
                    stdio: "ignore",
                    shell: "/bin/bash"
                }
            );

            installed = true;

        } catch {
            installed = false;
        }

        if (installed) {

            console.log(
                `✅ ${tool.command} is installed`
            );

        } else {

            console.log(
                `❌ ${tool.command} missing`
            );

            const answer = await ask(
                `Install ${tool.package}? (y/n): `
            );

            if (
                answer.toLowerCase() !== "y"
            ) {
                process.exit(1);
            }

            const install =
               require("./installers/package-install");

            if (!install(tool.package)) {
                process.exit(1);
            }
        }
    }

    if (
        typeof project.dependencies ===
        "function"
    ) {

        const dependencies =
            project.dependencies(
                projectPath
            );

        if (dependencies) {

            console.log(
                "\n📚 Checking dependencies..."
            );

            if (dependencies.installed) {

                console.log(
                    "✅ Dependencies are installed"
                );

            } else {

                console.log(
                    "❌ Dependencies missing"
                );

                const answer = await ask(
                    `${
                        dependencies.prompt ||
                        "Install dependencies?"
                    } (y/n): `
                );

                if (
                    answer.toLowerCase() !== "y"
                ) {
                    process.exit(1);
                }

                if (!dependencies.install()) {

                    console.log(
                        "❌ Installation failed"
                    );

                    process.exit(1);
                }
            }
        }
    }

    console.log(
        "\n🎯 Analysis complete!"
    );

    if (
        typeof project.run !==
        "function"
    ) {

        console.log(
            "❌ No runner available"
        );

        process.exit(1);
    }

    const exitCode =
        await project.run(
            projectPath
        );

    if (exitCode !== 0) {
        process.exit(exitCode);
    }
}

main().catch(err => {

    console.error(
        "❌ Error:",
        err.message
    );

    process.exit(1);
});