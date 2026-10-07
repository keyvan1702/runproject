const { exists, run, build, findEntry, noEntry } = require("./helpers");

module.exports = {
    id: "julia",
    name: "Julia",
    manifests: ["Project.toml"],
    extensions: [".jl"],
    tools: () => [{ command: "julia", package: "julia" }],

    dependencies(p) {
        if (!exists(p, "Project.toml")) return null;

        return {
            label: "Pkg",
            installed: exists(p, "Manifest.toml"),
            prompt: "Install Julia packages (Pkg.instantiate)?",
            install: () => build("julia", ["--project=.", "-e", "using Pkg; Pkg.instantiate()"], p)
        };
    },

    run(p) {
        const entry = findEntry(p, ["main.jl", "app.jl", "run.jl", "src/main.jl"], [".jl"]);

        return entry ? run("julia", ["--project=.", entry], p) : noEntry("Julia");
    }
};
