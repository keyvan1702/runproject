
const { spawnSync } = require("child_process");


const commands = {

    npm: [
        "npm",
        ["install"]
    ],

    pnpm: [
        "pnpm",
        ["install"]
    ],

    yarn: [
        "yarn",
        ["install"]
    ]
};


function installDependencies(packageManager) {

    const config =
        commands[packageManager];

    if (!config) {

        console.log(
            `❌ Unsupported package manager: ${packageManager}`
        );

        return false;
    }

    const [command, args] =
        config;

    console.log(
        `📦 Running: ${command} ${args.join(" ")}\n`
    );

    const result =
        spawnSync(
            command,
            args,
            {
                stdio: "inherit"
            }
        );

    if (result.error) {

        console.log(
            `\n❌ Failed to run ${command}: ${result.error.message}`
        );

        return false;
    }

    if (result.status !== 0) {

        console.log(
            `\n❌ Failed to install dependencies`
        );

        return false;
    }

    console.log(
        "\n✅ Dependencies installed successfully"
    );

    return true;
}


module.exports = installDependencies;
