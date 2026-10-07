const { exists, run, findEntry, noEntry } = require("./helpers");

module.exports = {
    id: "go",
    name: "Go",
    manifests: ["go.mod"],
    extensions: [".go"],
    tools: () => [{ command: "go", package: "go" }],

    // `go run` downloads modules by itself
    run(p) {
        if (exists(p, "go.mod")) return run("go", ["run", "."], p);

        const file = findEntry(p, ["main.go"], [".go"]);

        return file ? run("go", ["run", file], p) : noEntry("Go");
    }
};
