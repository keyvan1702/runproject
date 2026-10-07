const { read, run, findEntry, noEntry } = require("./helpers");

module.exports = {
    id: "deno",
    name: "Deno",
    manifests: ["deno.json", "deno.jsonc"],
    extensions: [],
    tools: () => [{ command: "deno", package: "deno" }],

    run(p) {
        const config = read(p, "deno.json") + read(p, "deno.jsonc");

        if (/"dev"\s*:/.test(config)) return run("deno", ["task", "dev"], p);
        if (/"start"\s*:/.test(config)) return run("deno", ["task", "start"], p);

        const entry = findEntry(p, ["main.ts", "main.js", "mod.ts", "index.ts", "index.js"]);

        return entry ? run("deno", ["run", "-A", entry], p) : noEntry("Deno");
    }
};
