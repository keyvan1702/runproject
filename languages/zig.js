const { exists, run, findEntry, noEntry } = require("./helpers");

module.exports = {
    id: "zig",
    name: "Zig",
    manifests: ["build.zig"],
    extensions: [".zig"],
    tools: () => [{ command: "zig", package: "zig" }],

    run(p) {
        if (exists(p, "build.zig")) return run("zig", ["build", "run"], p);

        const file = findEntry(p, ["main.zig"], [".zig"]);

        return file ? run("zig", ["run", file], p) : noEntry("Zig");
    }
};
