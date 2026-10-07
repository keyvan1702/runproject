const { exists, join, run, build, findEntry, noEntry, outDir } = require("./helpers");

module.exports = {
    id: "rust",
    name: "Rust",
    manifests: ["Cargo.toml"],
    extensions: [".rs"],
    tools: () => [{ command: "cargo", package: "rust" }],

    run(p) {
        if (exists(p, "Cargo.toml")) return run("cargo", ["run"], p);

        const file = findEntry(p, ["main.rs"], [".rs"]);

        if (!file) return noEntry("Rust");

        const out = join(outDir(p), "app");

        return build("rustc", [file, "-o", out], p) ? run(out, [], p) : 1;
    }
};
