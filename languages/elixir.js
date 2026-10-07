const { exists, read, run, build, findEntry, noEntry } = require("./helpers");

module.exports = {
    id: "elixir",
    name: "Elixir",
    manifests: ["mix.exs"],
    extensions: [".exs"],
    tools: () => [{ command: "elixir", package: "elixir" }],

    dependencies(p) {
        if (!exists(p, "mix.exs") || !read(p, "mix.exs").includes("{:")) return null;

        return {
            label: "mix deps",
            installed: exists(p, "deps"),
            prompt: "Install dependencies using mix?",
            install: () =>
                build("mix", ["local.hex", "--force"], p) &&
                build("mix", ["local.rebar", "--force"], p) &&
                build("mix", ["deps.get"], p)
        };
    },

    run(p) {
        if (exists(p, "mix.exs")) {
            const phoenix = read(p, "mix.exs").includes(":phoenix");

            return phoenix
                ? run("mix", ["phx.server"], p)
                : run("mix", ["run", "--no-halt"], p);
        }

        const entry = findEntry(p, ["main.exs", "app.exs"], [".exs"]);

        return entry ? run("elixir", [entry], p) : noEntry("Elixir");
    }
};
