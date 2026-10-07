const {
    exists,
    read,
    run,
    runAsync,
    findEntry,
    noEntry
} = require("./helpers");

const detectPackageManager =
    require("../installers/package-manager");

const openBrowser =
    require("../web/browser");

const { findPort } =
    require("../web/port");


function packageManager(projectPath) {
    return detectPackageManager(projectPath) || "npm";
}


function getPortFromSource(projectPath, entry) {
    if (!entry) {
        return 3000;
    }

    const source = read(projectPath, entry);

    const match =
        source.match(
            /(?:const|let|var)\s+port\s*=\s*(\d+)/
        );

    if (match) {
        return Number(match[1]);
    }

    const listenMatch =
        source.match(
            /\.listen\s*\(\s*(\d+)/
        );

    if (listenMatch) {
        return Number(listenMatch[1]);
    }

    return 3000;
}


function waitForServer(url, timeout = 20000) {
    const http = require("http");
    const https = require("https");

    return new Promise(resolve => {
        const start = Date.now();

        function check() {
            const client =
                url.startsWith("https")
                    ? https
                    : http;

            const req = client.get(
                url,
                res => {
                    res.resume();
                    resolve(true);
                }
            );

            req.on("error", () => {
                if (Date.now() - start >= timeout) {
                    resolve(false);
                    return;
                }

                setTimeout(check, 300);
            });

            req.setTimeout(1000, () => {
                req.destroy();

                if (Date.now() - start >= timeout) {
                    resolve(false);
                    return;
                }

                setTimeout(check, 300);
            });
        }

        check();
    });
}


async function runWeb(
    command,
    args,
    cwd,
    port
) {
    const url =
        `http://localhost:${port}`;

    runAsync(
        command,
        args,
        cwd
    );

    console.log(
        `\n🌐 Waiting for web server: ${url}\n`
    );

    const ready =
        await waitForServer(url);

    if (ready) {
        console.log(
            `✅ Web server is ready: ${url}`
        );

        console.log(
            "🌐 Opening browser...\n"
        );

        openBrowser(url);
    } else {
        console.log(
            "⚠️ Web server did not become ready within 20 seconds"
        );
    }

    return 0;
}


module.exports = {
    id: "node",

    name:
        "Node.js / JavaScript / TypeScript",

    manifests: [
        "package.json"
    ],

    extensions: [
        ".js",
        ".mjs",
        ".cjs",
        ".ts"
    ],


    tools(projectPath) {
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

        const pm =
            packageManager(projectPath);

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

        if (pm === "bun") {
            tools.push({
                command: "bun",
                package: "bun"
            });
        }

        return tools;
    },


    dependencies(projectPath) {
        if (!exists(
            projectPath,
            "package.json"
        )) {
            return null;
        }

        let pkg;

        try {
            pkg = JSON.parse(
                read(
                    projectPath,
                    "package.json"
                ) || "{}"
            );
        } catch {
            return null;
        }

        const dependencies = {
            ...(pkg.dependencies || {}),
            ...(pkg.devDependencies || {})
        };

        const names =
            Object.keys(dependencies);

        if (names.length === 0) {
            return null;
        }

        const missing =
            names.filter(name =>
                !exists(
                    projectPath,
                    "node_modules",
                    name
                )
            );

        const pm =
            packageManager(projectPath);

        return {
            label:
                `${names.length} packages (${pm})`,

            installed:
                missing.length === 0,

            missing,

            prompt:
                missing.length > 0
                    ? `Install missing dependencies: ${missing.join(", ")} using ${pm}?`
                    : `Install dependencies using ${pm}?`,

            install() {
                return (
                    run(
                        pm,
                        ["install"],
                        projectPath
                    ) === 0
                );
            }
        };
    },


    async run(projectPath) {
        const pm =
            packageManager(projectPath);

        let pkg = {};

        if (exists(
            projectPath,
            "package.json"
        )) {
            try {
                pkg = JSON.parse(
                    read(
                        projectPath,
                        "package.json"
                    ) || "{}"
                );
            } catch {
                pkg = {};
            }
        }


        const scripts =
            pkg.scripts || {};


        /*
         * Development server
         */

        if (scripts.dev) {
            const port =
                await findPort(3000);

            return runWeb(
                pm,
                [
                    "run",
                    "dev",
                    "--",
                    "--port",
                    String(port)
                ],
                projectPath,
                port
            );
        }


        /*
         * Start script
         */

        if (scripts.start) {
            const port =
                await findPort(3000);

            return runWeb(
                pm,
                [
                    "run",
                    "start",
                    "--",
                    "--port",
                    String(port)
                ],
                projectPath,
                port
            );
        }


        /*
         * package.json main
         */

        if (pkg.main) {
            const main =
                findEntry(
                    projectPath,
                    [pkg.main],
                    []
                );

            if (main) {
                const port =
                    getPortFromSource(
                        projectPath,
                        main
                    );

                const source =
                    read(
                        projectPath,
                        main
                    );

                if (
                    source.includes(".listen(") ||
                    source.includes(".listen (")
                ) {
                    return runWeb(
                        "node",
                        [main],
                        projectPath,
                        port
                    );
                }

                return run(
                    "node",
                    [main],
                    projectPath
                );
            }
        }


        /*
         * Explicit application entrypoints.
         */

        const js =
            findEntry(
                projectPath,
                [
                    "main.js",
                    "app.js",
                    "server.js",
                    "main.mjs",
                    "app.mjs",
                    "server.mjs",
                    "main.cjs",
                    "app.cjs",
                    "server.cjs"
                ],
                []
            );

        if (js) {
            const source =
                read(
                    projectPath,
                    js
                );

            const isWeb =
                source.includes(".listen(") ||
                source.includes(".listen (");

            if (isWeb) {
                const port =
                    getPortFromSource(
                        projectPath,
                        js
                    );

                return runWeb(
                    "node",
                    [js],
                    projectPath,
                    port
                );
            }

            return run(
                "node",
                [js],
                projectPath
            );
        }


        /*
         * TypeScript application
         */

        const ts =
            findEntry(
                projectPath,
                [
                    "main.ts",
                    "app.ts",
                    "server.ts"
                ],
                []
            );

        if (ts) {
            return run(
                "npx",
                [
                    "--yes",
                    "tsx",
                    ts
                ],
                projectPath
            );
        }


        /*
         * Package / library
         */

        console.log(
            "\n📦 This appears to be a Node.js package/library."
        );

        console.log(
            "ℹ️ No executable entrypoint was found."
        );

        console.log(
            "ℹ️ Available scripts:"
        );

        const names =
            Object.keys(scripts);

        if (names.length === 0) {
            console.log("   (none)");
        } else {
            for (const name of names) {
                console.log(
                    `   npm run ${name}`
                );
            }
        }

        return 0;
    }
};