const fs = require("fs");
const path = require("path");

function checkNodeDependencies(projectPath) {
    const packageJsonPath = path.join(
        projectPath,
        "package.json"
    );

    if (!fs.existsSync(packageJsonPath)) {
        return {
            exists: false,
            installed: false,
            dependencies: []
        };
    }

    const packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
    );

    const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };

    const dependencyNames = Object.keys(dependencies);

    // پروژه هیچ dependency ندارد
    if (dependencyNames.length === 0) {
        return {
            exists: true,
            installed: true,
            dependencies: []
        };
    }

    const nodeModulesPath = path.join(
        projectPath,
        "node_modules"
    );

    return {
        exists: true,
        installed: fs.existsSync(nodeModulesPath),
        dependencies: dependencyNames
    };
}

module.exports = {
    checkNodeDependencies
};
