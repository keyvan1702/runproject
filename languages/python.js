const fs = require("fs");
const { exists, join, run, build, findEntry, noEntry } = require("./helpers");

function kind(p) {
    if (exists(p, "requirements.txt")) return "requirements.txt";
    if (exists(p, "pyproject.toml")) return "pyproject.toml";
    return null;
}

function pipInstall(python, args, cwd) {
    const primaryArgs = [
        "-m",
        "pip",
        "install",
        ...args
    ];

    console.log("\n🌐 Trying PyPI...");

    if (build(python, primaryArgs, cwd)) {
        return true;
    }

    console.log("\n⚠️ PyPI connection failed");
    console.log("🔄 Trying fallback mirror...");

    const mirrorArgs = [
        "-m",
        "pip",
        "install",
        "-i",
        "https://pypi.tuna.tsinghua.edu.cn/simple",
        ...args
    ];

    return build(python, mirrorArgs, cwd);
}

module.exports = {
    id: "python",
    name: "Python",

    manifests: [
        "pyproject.toml",
        "requirements.txt",
        "Pipfile",
        "setup.py"
    ],

    extensions: [".py"],

    tools: () => [
        {
            command: "python",
            package: "python"
        },
        {
            command: "pip",
            package: "python-pip"
        }
    ],

    dependencies(p) {
        const file = kind(p);

        if (!file) {
            return null;
        }

        const marker = join(
            p,
            ".venv",
            ".runproject-ok"
        );

        const installed =
            fs.existsSync(marker) &&
            fs.statSync(marker).mtimeMs >=
            fs.statSync(join(p, file)).mtimeMs;

        return {
            label: "from " + file + " (.venv)",

            installed,

            prompt: "Create .venv and install dependencies with pip?",

            install() {
                const python = join(
                    p,
                    ".venv",
                    "bin",
                    "python"
                );

                if (
                    !fs.existsSync(python) &&
                    !build(
                        "python",
                        [
                            "-m",
                            "venv",
                            ".venv"
                        ],
                        p
                    )
                ) {
                    return false;
                }

                const args =
                    file === "requirements.txt"
                        ? [
                            "-r",
                            "requirements.txt"
                        ]
                        : [
                            "-e",
                            "."
                        ];

                if (!pipInstall(python, args, p)) {
                    return false;
                }

                fs.writeFileSync(marker, "");

                return true;
            }
        };
    },

    run(p) {
        const venv = join(
            p,
            ".venv",
            "bin",
            "python"
        );

        const python = fs.existsSync(venv)
            ? venv
            : "python";

        if (exists(p, "manage.py")) {
            return run(
                python,
                [
                    "manage.py",
                    "runserver"
                ],
                p
            );
        }

        const entry = findEntry(
            p,
            [
                "main.py",
                "app.py",
                "run.py",
                "server.py",
                "index.py",
                "__main__.py"
            ],
            [".py"]
        );

        return entry
            ? run(
                python,
                [entry],
                p
            )
            : noEntry("Python");
    }
};
