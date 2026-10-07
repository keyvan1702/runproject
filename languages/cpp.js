const {
    exists, read, join, listFiles, run, build, noEntry, outDir, newExecutables
} = require("./helpers");

const SOURCES = [".c", ".cpp", ".cc", ".cxx"];

module.exports = {
    id: "cpp",
    name: "C / C++",
    manifests: ["CMakeLists.txt"],
    weakManifests: ["Makefile", "makefile", "GNUmakefile"],
    extensions: SOURCES,

    tools(p) {
        const tools = [
            { command: "gcc", package: "gcc" },
            { command: "g++", package: "gcc" },
            { command: "make", package: "make" }
        ];

        if (exists(p, "CMakeLists.txt")) {
            tools.push({ command: "cmake", package: "cmake" });
        }

        return tools;
    },

    run(p) {
        if (exists(p, "CMakeLists.txt")) {
            if (!build("cmake", ["-S", ".", "-B", "build"], p)) return 1;
            if (!build("cmake", ["--build", "build"], p)) return 1;

            const names = [...read(p, "CMakeLists.txt").matchAll(/add_executable\s*\(\s*([\w.-]+)/gi)]
                .map(m => m[1]);

            for (const name of names) {
                for (const dir of ["build", join("build", "bin"), join("build", "Debug")]) {
                    if (exists(p, dir, name)) return run(join(p, dir, name), [], p);
                }
            }

            return noEntry("CMake");
        }

        const makefile = ["Makefile", "makefile", "GNUmakefile"].find(f => exists(p, f));

        if (makefile) {
            if (/^run\s*:/m.test(read(p, makefile))) return run("make", ["run"], p);

            const started = Date.now() - 1000;

            if (!build("make", [], p)) return 1;

            const binary = newExecutables(p, started)[0];

            return binary ? run(binary, [], p) : noEntry("Makefile");
        }

        // Loose source files: compile them all into one program
        const files = listFiles(p).filter(f => SOURCES.some(ext => f.endsWith(ext)));

        if (files.length === 0) return noEntry("C/C++");

        const isCpp = files.some(f => !f.endsWith(".c"));
        const out = join(outDir(p), "app");
        const args = [...files, "-o", out, ...(isCpp ? [] : ["-lm"])];

        return build(isCpp ? "g++" : "gcc", args, p) ? run(out, [], p) : 1;
    }
};
