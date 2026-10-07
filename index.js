const readline = require("readline");

const { detectLanguage } = require("./languages");

const projectPath = process.cwd();

function ask(question) {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

async function main() {
    console.log("🔍 Analyzing project...\n");

    const project = detectLanguage(projectPath);

    if (!project) {
        console.log("❌ Could not detect project language");
        process.exit(1);
    }

    console.log(`✅ Language: ${project.name}`);
    console.log(`🔧 Type: ${project.id}`);

    // -----------------------------
    // Runtime / tools
    // -----------------------------

    console.log("\n⚙ Checking runtime...");

const tools = typeof project.tools === "function"
    ? project.tools(projectPath)
    : [];

    for (const tool of tools) {
       let installed = false;

try {
    require("child_process").execSync(`command -v ${tool.command}`, {
        stdio: "ignore",
        shell: "/bin/bash"
    });

    installed = true;
} catch {
    installed = false;
}

        if (installed) {
            console.log(`✅ ${tool.command} is installed`);
            continue;
        }

        console.log(`❌ ${tool.command} is not installed`);
        console.log(`📦 Required package: ${tool.package}`);

        const answer = await ask(
            `\n❓ Install ${tool.package} using pacman? (y/n): `
        );

        if (answer !== "y") {
            console.log("❌ Runtime installation cancelled");
            process.exit(1);
        }

        const installPackage = require("./installers/arch");

        if (!installPackage(tool.package)) {
            process.exit(1);
        }
    }

    // -----------------------------
    // Dependencies
    // -----------------------------

    if (typeof project.dependencies === "function") {
        const dependencies = project.dependencies(projectPath);

        if (dependencies) {
            console.log("\n📚 Checking dependencies...");

            if (dependencies.installed) {
                console.log(`✅ Dependencies are installed`);
            } else {
                console.log(`❌ Dependencies are not installed`);

                const answer = await ask(
                    `\n❓ ${dependencies.prompt || "Install dependencies?"} (y/n): `
                );

                if (answer !== "y") {
                    console.log("❌ Dependency installation cancelled");
                    process.exit(1);
                }

                if (!dependencies.install()) {
                    console.log("❌ Dependency installation failed");
                    process.exit(1);
                }

                console.log("✅ Dependencies installed");
            }
        }
    }

    // -----------------------------
    // Run project
    // -----------------------------

    console.log("\n🎯 Analysis complete!");

    if (typeof project.run !== "function") {
        console.log(`❌ No runner available for ${project.name}`);
        process.exit(1);
    }

    const exitCode = project.run(projectPath);

    if (exitCode !== 0) {
        process.exit(exitCode);
    }
}

main().catch(error => {
    console.error("❌ Error:", error.message);
    process.exit(1);
});
