const { exists, run, build, findEntry, noEntry } = require("./helpers");

module.exports = {
    id: "php",
    name: "PHP",
    manifests: ["composer.json", "artisan"],
    extensions: [".php"],

    tools(p) {
        const tools = [{ command: "php", package: "php" }];

        if (exists(p, "composer.json")) {
            tools.push({ command: "composer", package: "composer" });
        }

        return tools;
    },

    dependencies(p) {
        if (!exists(p, "composer.json")) return null;

        return {
            label: "composer",
            installed: exists(p, "vendor"),
            prompt: "Install dependencies using composer?",
            install: () => build("composer", ["install"], p)
        };
    },

    run(p) {
        if (exists(p, "artisan")) return run("php", ["artisan", "serve"], p);

        if (exists(p, "public", "index.php")) {
            return run("php", ["-S", "localhost:8000", "-t", "public"], p);
        }

        const entry = findEntry(p, ["main.php", "index.php", "app.php"], [".php"]);

        return entry ? run("php", [entry], p) : noEntry("PHP");
    }
};
