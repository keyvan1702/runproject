
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


const packages = {

    node: {
        manjaro: "nodejs",
        arch: "nodejs",
        debian: "nodejs",
        fedora: "nodejs",
        opensuse: "nodejs",
        macos: "node",
        windows: "OpenJS.NodeJS"
    },

    python: {
        manjaro: "python",
        arch: "python",
        debian: "python3",
        fedora: "python3",
        opensuse: "python3",
        macos: "python",
        windows: "Python.Python.3"
    },

    rust: {
        manjaro: "rust",
        arch: "rust",
        debian: "rustc",
        fedora: "rust",
        opensuse: "rust",
        macos: "rust",
        windows: "Rustlang.Rustup"
    },

    go: {
        manjaro: "go",
        arch: "go",
        debian: "golang",
        fedora: "golang",
        opensuse: "go",
        macos: "go",
        windows: "GoLang.Go"
    },

    java: {
        manjaro: "jdk-openjdk",
        arch: "jdk-openjdk",
        debian: "default-jdk",
        fedora: "java-21-openjdk-devel",
        opensuse: "java-21-openjdk-devel",
        macos: "openjdk",
        windows: "Microsoft.OpenJDK.21"
    },

    php: {
        manjaro: "php",
        arch: "php",
        debian: "php",
        fedora: "php",
        opensuse: "php",
        macos: "php",
        windows: "PHP.PHP"
    },

    dotnet: {
        manjaro: "dotnet-sdk",
        arch: "dotnet-sdk",
        debian: "dotnet-sdk-8.0",
        fedora: "dotnet-sdk-8.0",
        opensuse: "dotnet-sdk-8.0",
        macos: "dotnet-sdk",
        windows: "Microsoft.DotNet.SDK.8"
    },

    cpp: {
        manjaro: "gcc",
        arch: "gcc",
        debian: "g++",
        fedora: "gcc-c++",
        opensuse: "gcc-c++",
        macos: "gcc",
        windows: "LLVM.LLVM"
    }
};


function installPackage(language) {

    const platform =
        detectPlatform();

    const platformPackages =
        packages[language];

    if (!platformPackages) {

        console.log(
            `❌ No package mapping found for: ${language}`
        );

        return false;
    }

    const packageName =
        platformPackages[platform];

    if (!packageName) {

        console.log(
            `❌ No package mapping for ${language} on ${platform}`
        );

        return false;
    }

    console.log(
        `📦 Installing ${language}...`
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