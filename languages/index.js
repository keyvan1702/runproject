const fs = require("fs");

const languages = [
    require("./deno"),
    require("./node"),
    require("./python"),
    require("./rust"),
    require("./go"),
    require("./java"),
    require("./scala"),
    require("./php"),
    require("./dotnet"),
    require("./elixir"),
    require("./ruby"),
    require("./zig"),
    require("./julia"),
    require("./haskell"),
    require("./cpp"),
    ...require("./scripting")
];

const matches = (files, pattern) => {
    if (pattern.startsWith("*.")) {
        return files.some(file =>
            file.endsWith(pattern.slice(1))
        );
    }

    return files.includes(pattern);
};

function detectLanguage(projectPath) {
    const files = fs
        .readdirSync(projectPath, {
            withFileTypes: true
        })
        .filter(entry => entry.isFile())
        .map(entry => entry.name);

    const scores = new Map();

    for (const lang of languages) {

        let score = 0;

        for (const manifest of lang.manifests || []) {

            if (matches(files, manifest)) {
                score += 100;
            }
        }

        for (const file of files) {

            if (
                (lang.extensions || []).some(ext =>
                    file.endsWith(ext)
                )
            ) {
                score += 10;
            }
        }

        for (const manifest of lang.weakManifests || []) {

            if (matches(files, manifest)) {
                score += 5;
            }
        }

        if (score > 0) {
            scores.set(lang, score);
        }
    }

    if (scores.size === 0) {
        return null;
    }

    return [...scores.entries()]
        .sort((a, b) => b[1] - a[1])[0][0];
}

module.exports = {
    languages,
    detectLanguage
};