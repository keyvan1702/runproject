const fs = require("fs");
const path = require("path");

function readFile(projectPath, file) {
    try {
        return fs.readFileSync(
            path.join(projectPath, file),
            "utf8"
        );
    } catch {
        return "";
    }
}

function detectWebProject(projectPath) {
    const packageJson = readFile(projectPath, "package.json");

    if (packageJson) {
        try {
            const pkg = JSON.parse(packageJson);

            const dependencies = {
                ...(pkg.dependencies || {}),
                ...(pkg.devDependencies || {})
            };

            const names = Object.keys(dependencies);

            const webPackages = [
                "express",
                "fastify",
                "koa",
                "hapi",
                "next",
                "vite",
                "react",
                "vue",
                "angular",
                "@angular/core",
                "svelte",
                "astro"
            ];

            if (names.some(name => webPackages.includes(name))) {
                return {
                    web: true,
                    port: 3000
                };
            }
        } catch {}
    }

    if (
        fs.existsSync(path.join(projectPath, "manage.py")) ||
        fs.existsSync(path.join(projectPath, "app.py"))
    ) {
        return {
            web: true,
            port: 8000
        };
    }

    if (fs.existsSync(path.join(projectPath, "composer.json"))) {
        return {
            web: true,
            port: 8000
        };
    }

    return {
        web: false,
        port: null
    };
}

module.exports = detectWebProject;
