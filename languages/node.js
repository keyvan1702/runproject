const { exists, read, run, findEntry, noEntry } = require("./helpers");
const detectPackageManager = require("../installers/package-manager");

const packageManager = p => detectPackageManager(p) || "npm";

module.exports = {
    id: "node",
    name: "Node.js / JavaScript / TypeScript",

    manifests: ["package.json"],

    extensions: [".js", ".mjs", ".cjs", ".ts"],

    tools(p) {
        const tools = [
            {
                command: "node",
                package: "nodejs"
            },
            {
                command: "npm",
                package: "npm"
            }
        ];

        const pm = packageManager(p);

        if (pm === "pnpm") {
            tools.push({
                command: "pnpm",
                package: "pnpm"
            });
        }

        if (pm === "yarn") {
            tools.push({
                command: "yarn",
                package: "yarn"
            });
        }

        return tools;
    },

    dependencies(p) {
        if (!exists(p, "package.json")) {
            return null;
        }

        const pkg = JSON.parse(
            read(p, "package.json") || "{}"
        );

        const dependencies = {
            ...(pkg.dependencies || {}),
            ...(pkg.devDependencies || {})
        };

        const names = Object.keys(dependencies);

        if (names.length === 0) {
            return null;
        }

        const missing = names.filter(name =>
            !exists(p, "node_modules", name)
        );

        const pm = packageManager(p);

        return {
            label: names.length + " packages (" + pm + ")",

            installed: missing.length === 0,

            missing: missing,

            prompt: missing.length > 0
                ? "Install missing dependencies: " +
                  missing.join(", ") +
                  " using " +
                  pm +
                  "?"
                : "Install dependencies using " + pm + "?",

            install() {
                return run(pm, ["install"], p) === 0;
            }
        };
    },

    run(p) {
        const pm = packageManager(p);

        let main = null;

        if (exists(p, "package.json")) {
            const pkg = JSON.parse(
                read(p, "package.json") || "{}"
            );

            const scripts = pkg.scripts || {};

            if (scripts.dev) {
                return run(
                    pm,
                    ["run", "dev"],
                    p
                );
            }

            if (scripts.start) {
                return run(
                    pm,
                    ["run", "start"],
                    p
                );
            }

            main = pkg.main || null;
        }

        const js = findEntry(
            p,
            [
                main,
                "main.js",
                "index.js",
                "app.js",
                "server.js"
            ].filter(Boolean),
            [
                ".js",
                ".mjs",
                ".cjs"
            ]
        );

        if (js) {
            return run(
                "node",
                [js],
                p
            );
        }

        const ts = findEntry(
            p,
            [
                "main.ts",
                "index.ts",
                "app.ts",
                "server.ts"
            ],
            [".ts"]
        );

        if (ts) {
            return run(
                "npx",
                ["--yes", "tsx", ts],
                p
            );
        }

        return noEntry("Node.js");
    }
};