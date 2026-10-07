const fs = require("fs");
const path = require("path");

function detectPackageManager(projectPath) {
    if (fs.existsSync(path.join(projectPath, "pnpm-lock.yaml"))) {
        return "pnpm";
    }

    if (fs.existsSync(path.join(projectPath, "yarn.lock"))) {
        return "yarn";
    }

    if (fs.existsSync(path.join(projectPath, "package-lock.json"))) {
        return "npm";
    }

    if (fs.existsSync(path.join(projectPath, "package.json"))) {
        return "npm";
    }

    return null;
}

module.exports = detectPackageManager;
