const { execSync } = require("child_process");

function installDependencies(packageManager) {
    const commands = {
        npm: "npm install",
        pnpm: "pnpm install",
        yarn: "yarn install"
    };

    const command = commands[packageManager];

    if (!command) {
        console.log(`❌ Unsupported package manager: ${packageManager}`);
        return false;
    }

    console.log(`📦 Running: ${command}\n`);

    try {
        execSync(command, {
            stdio: "inherit",
            shell: "/bin/bash"
        });

        console.log("\n✅ Dependencies installed successfully");
        return true;
    } catch {
        console.log("\n❌ Failed to install dependencies");
        return false;
    }
}

module.exports = installDependencies;
