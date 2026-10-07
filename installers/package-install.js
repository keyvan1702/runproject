const { spawnSync } = require("child_process");

const detectPlatform =
    require("./platform");


function run(command, args = []) {

    console.log(
        `\n🚀 Installing with: ${command} ${args.join(" ")}\n`
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
            `❌ Failed to run ${command}: ${result.error.message}`
        );

        return false;
    }

    return result.status === 0;
}


function installPackage(packageName) {

    const platform =
        detectPlatform();

    console.log(
        `📦 Installing ${packageName}...`
    );

    switch (platform) {

        case "manjaro":
        case "arch":

            return run(
                "sudo",
                [
                    "pacman",
                    "-S",
                    "--needed",
                    packageName
                ]
            );


        case "debian":

            return run(
                "sudo",
                [
                    "apt",
                    "install",
                    "-y",
                    packageName
                ]
            );


        case "fedora":

            return run(
                "sudo",
                [
                    "dnf",
                    "install",
                    "-y",
                    packageName
                ]
            );


        case "opensuse":

            return run(
                "sudo",
                [
                    "zypper",
                    "--non-interactive",
                    "install",
                    packageName
                ]
            );


        case "macos":

            return run(
                "brew",
                [
                    "install",
                    packageName
                ]
            );


        case "windows":

            return run(
                "winget",
                [
                    "install",
                    "--id",
                    packageName,
                    "--accept-source-agreements",
                    "--accept-package-agreements"
                ]
            );


        default:

            console.log(
                `❌ Unsupported operating system: ${platform}`
            );

            return false;
    }
}


module.exports = installPackage;