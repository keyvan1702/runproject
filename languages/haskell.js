const { exists, listFiles, run, findEntry, noEntry } = require("./helpers");

const hasCabal = p => listFiles(p).some(f => f.endsWith(".cabal"));

module.exports = {
    id: "haskell",
    name: "Haskell",
    manifests: ["stack.yaml", "*.cabal"],
    extensions: [".hs"],

    tools(p) {
        if (exists(p, "stack.yaml")) return [{ command: "stack", package: "stack" }];

        return [
            { command: "ghc", package: "ghc" },
            ...(hasCabal(p) ? [{ command: "cabal", package: "cabal-install" }] : [])
        ];
    },

    run(p) {
        if (exists(p, "stack.yaml")) return run("stack", ["run"], p);
        if (hasCabal(p)) return run("cabal", ["run"], p);

        const file = findEntry(p, ["Main.hs", "main.hs"], [".hs"]);

        return file ? run("runghc", [file], p) : noEntry("Haskell");
    }
};
