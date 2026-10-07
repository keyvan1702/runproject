const fs = require("fs");
const { execSync } = require("child_process");

function detectLinuxDistro() {
    try {
        if (!fs.existsSync("/etc/os-release")) {
            return "unknown";
        }

        const content =
            fs.readFileSync(
                "/etc/os-release",
                "utf8"
            );

        const match =
            content.match(
                /^ID="?([^"\n]+)"?/m
            );

        return match
            ? match[1].toLowerCase()
            : "unknown";
    } catch {
        return "unknown";
    }
}


function detectPlatform() {

    if (process.platform === "win32") {
        return "windows";
    }

    if (process.platform === "darwin") {
        return "macos";
    }

    if (process.platform === "linux") {

        const distro =
            detectLinuxDistro();

        if (distro === "manjaro") {
            return "manjaro";
        }

        if (distro === "arch") {
            return "arch";
        }

        if (
            distro === "ubuntu" ||
            distro === "debian" ||
            distro === "linuxmint" ||
            distro === "pop"
        ) {
            return "debian";
        }

        if (
            distro === "fedora" ||
            distro === "rhel" ||
            distro === "centos"
        ) {
            return "fedora";
        }

        if (
            distro === "opensuse" ||
            distro === "opensuse-leap" ||
            distro === "opensuse-tumbleweed"
        ) {
            return "opensuse";
        }

        return "linux";
    }

    return "unknown";
}


module.exports = detectPlatform;