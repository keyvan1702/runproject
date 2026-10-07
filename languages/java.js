const fs = require("fs");
const {
    exists, read, join, listFiles, run, build, noEntry, outDir
} = require("./helpers");

function gradleCommand(p) {
    // sh gradlew works even if the wrapper has no executable bit
    return exists(p, "gradlew")
        ? ["sh", [join(p, "gradlew")]]
        : ["gradle", []];
}

module.exports = {
    id: "java",
    name: "Java / Kotlin (Maven, Gradle)",
    manifests: ["pom.xml", "build.gradle", "build.gradle.kts", "settings.gradle", "settings.gradle.kts"],
    extensions: [".java"],

    tools(p) {
        const tools = [
            { command: "java", package: "jdk-openjdk" },
            { command: "javac", package: "jdk-openjdk" }
        ];

        if (exists(p, "pom.xml")) {
            tools.push({ command: "mvn", package: "maven" });
        } else if (
            (exists(p, "build.gradle") || exists(p, "build.gradle.kts") ||
             exists(p, "settings.gradle") || exists(p, "settings.gradle.kts")) &&
            !exists(p, "gradlew")
        ) {
            tools.push({ command: "gradle", package: "gradle" });
        }

        return tools;
    },

    // Maven / Gradle download dependencies as part of the build.

    run(p) {
        if (exists(p, "pom.xml")) {
            const pom = read(p, "pom.xml");

            if (pom.includes("spring-boot")) return run("mvn", ["spring-boot:run"], p);
            if (pom.includes("exec-maven-plugin")) return run("mvn", ["-q", "compile", "exec:java"], p);

            if (!build("mvn", ["-q", "-DskipTests", "package"], p)) return 1;

            const jar = exists(p, "target") &&
                fs.readdirSync(join(p, "target")).find(f =>
                    f.endsWith(".jar") && !f.endsWith("-sources.jar") && !f.startsWith("original-"));

            return jar ? run("java", ["-jar", join("target", jar)], p) : noEntry("Maven");
        }

        const gradleFile = ["build.gradle", "build.gradle.kts"].find(f => exists(p, f));

        if (gradleFile) {
            const [cmd, pre] = gradleCommand(p);
            const text = read(p, gradleFile);
            const task = text.includes("org.springframework.boot") ? "bootRun" : "run";

            return run(cmd, [...pre, task], p);
        }

        // Plain .java files: compile everything, run the class with main()
        const files = listFiles(p).filter(f => f.endsWith(".java"));
        const main = files.find(f => /static\s+void\s+main/.test(read(p, f)));

        if (!main) return noEntry("Java");

        const out = join(outDir(p), "classes");

        if (!build("javac", ["-d", out, ...files], p)) return 1;

        return run("java", ["-cp", out, main.replace(/\.java$/, "")], p);
    }
};
