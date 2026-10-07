const { run, findEntry, noEntry } = require("./helpers");

function scripting({ id, name, extensions, tool, entries, command = tool.command, args = [] }) {
    return {
        id,
        name,
        manifests: [],
        extensions,
        tools: () => [tool],

        run(p) {
            const entry = findEntry(p, entries, extensions);

            return entry ? run(command, [...args, entry], p) : noEntry(name);
        }
    };
}

module.exports = [
    scripting({
        id: "lua", name: "Lua", extensions: [".lua"],
        tool: { command: "lua", package: "lua" },
        entries: ["main.lua", "init.lua", "app.lua"]
    }),
    scripting({
        id: "perl", name: "Perl", extensions: [".pl"],
        tool: { command: "perl", package: "perl" },
        entries: ["main.pl", "app.pl", "script.pl", "index.pl"]
    }),
    scripting({
        id: "r", name: "R", extensions: [".R", ".r"],
        tool: { command: "Rscript", package: "r" },
        entries: ["main.R", "app.R", "run.R", "script.R"]
    }),
    scripting({
        id: "shell", name: "Shell", extensions: [".sh"],
        tool: { command: "bash", package: "bash" },
        entries: ["main.sh", "run.sh", "start.sh", "app.sh"]
    })
];
