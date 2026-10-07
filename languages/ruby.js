const { spawnSync } = require("child_process");
const { exists, run, build, findEntry, noEntry } = require("./helpers");

module.exports = {
    id: "ruby",
    name: "Ruby",

    manifests: ["Gemfile"],

    extensions: [".rb"],

    tools: p => [
        {
            command: "ruby",
            package: "ruby"
        },

        ...(exists(p, "Gemfile")
            ? [
                {
                    command: "bundle",
                    package: "ruby-bundler"
                }
            ]
            : [])
    ],

    dependencies(p) {
        if (!exists(p, "Gemfile")) {
            return null;
        }

        const check = spawnSync(
            "bundle",
            ["check"],
            {
                cwd: p,
                stdio: "ignore"
            }
        );

        return {
            label: "bundler",

            installed: check.status === 0,

            prompt: "Install gems using bundler?",

            install() {
                // Bundler جدید --path را حذف کرده است.
                // مسیر vendor/bundle را فقط برای همین پروژه تنظیم می‌کنیم.
                if (!build(
                    "bundle",
                    [
                        "config",
                        "set",
                        "--local",
                        "path",
                        "vendor/bundle"
                    ],
                    p
                )) {
                    return false;
                }

                // نصب dependencyها داخل vendor/bundle
                return build(
                    "bundle",
                    ["install"],
                    p
                );
            }
        };
    },

    run(p) {
        const useBundler = exists(p, "Gemfile");

        const ruby = args => {
            if (useBundler) {
                return run(
                    "bundle",
                    ["exec", "ruby", ...args],
                    p
                );
            }

            return run(
                "ruby",
                args,
                p
            );
        };

        // Rails
        if (exists(p, "bin", "rails")) {
            return ruby([
                "bin/rails",
                "server"
            ]);
        }

        // Rack
        if (exists(p, "config.ru")) {
            return run(
                "bundle",
                [
                    "exec",
                    "rackup"
                ],
                p
            );
        }

        // معمولی Ruby project
        const entry = findEntry(
            p,
            [
                "main.rb",
                "app.rb",
                "run.rb",
                "server.rb",
                "index.rb"
            ],
            [".rb"]
        );

        return entry
            ? ruby([entry])
            : noEntry("Ruby");
    }
};
