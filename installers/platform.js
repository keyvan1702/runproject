const { execSync } = require("child_process");

function detectPlatform() {
    try {
        const distro = execSync(
            "grep '^ID=' /etc/os-release | cut -d= -f2",
            {
                encoding: "utf8",
                shell: "/bin/bash"
            }
        ).trim();

        if (distro === "manjaro") {
            return "manjaro";
        }

        if (distro === "arch") {
            return "arch";
        }

        return "unknown";
    } catch {
        return "unknown";
    }
}

module.exports = detectPlatform;
