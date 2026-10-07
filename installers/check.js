const { execSync } = require("child_process");

function commandExists(command) {
    try {
        execSync(`command -v ${command}`, {
            stdio: "ignore",
            shell: "/bin/bash"
        });

        return true;
    } catch {
        return false;
    }
}

const runtimes = {
    node: {
        command: "node",
        package: "nodejs"
    },

    python: {
        command: "python",
        package: "python"
    },

    rust: {
        command: "rustc",
        package: "rust"
    },

    go: {
        command: "go",
        package: "go"
    },

    java: {
        command: "java",
        package: "jdk-openjdk"
    },

    php: {
        command: "php",
        package: "php"
    },

    dotnet: {
        command: "dotnet",
        package: "dotnet-sdk"
    },

    cpp: {
        command: "g++",
        package: "gcc"
    }
};

function checkRuntime(language) {
    const runtime = runtimes[language];

    if (!runtime) {
        return {
            installed: false,
            package: null,
            command: null
        };
    }

    return {
        installed: commandExists(runtime.command),
        package: runtime.package,
        command: runtime.command
    };
}

module.exports = checkRuntime;
