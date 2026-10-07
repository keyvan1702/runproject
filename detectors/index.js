const fs = require("fs");
const path = require("path");

function detectProject(projectPath) {
    const files = fs.readdirSync(projectPath);

    if (files.includes("package.json")) {
        return {
            language: "node",
            name: "Node.js / JavaScript / TypeScript"
        };
    }

    if (
        files.includes("pyproject.toml") ||
        files.includes("requirements.txt") ||
        files.includes("Pipfile") ||
        files.includes("setup.py")
    ) {
        return {
            language: "python",
            name: "Python"
        };
    }

    if (files.includes("Cargo.toml")) {
        return {
            language: "rust",
            name: "Rust"
        };
    }

    if (files.includes("go.mod")) {
        return {
            language: "go",
            name: "Go"
        };
    }

    if (
        files.includes("pom.xml") ||
        files.includes("build.gradle") ||
        files.includes("build.gradle.kts")
    ) {
        return {
            language: "java",
            name: "Java"
        };
    }

    if (files.includes("composer.json")) {
        return {
            language: "php",
            name: "PHP"
        };
    }

    if (files.some(file => file.endsWith(".csproj"))) {
        return {
            language: "dotnet",
            name: "C# / .NET"
        };
    }

    if (
        files.includes("CMakeLists.txt") ||
        files.includes("Makefile")
    ) {
        return {
            language: "cpp",
            name: "C / C++"
        };
    }

    const extensions = {
        ".py": "Python",
        ".js": "JavaScript",
        ".ts": "TypeScript",
        ".rs": "Rust",
        ".go": "Go",
        ".java": "Java",
        ".php": "PHP",
        ".cs": "C#",
        ".cpp": "C++",
        ".cc": "C++",
        ".c": "C"
    };

    const found = {};

    for (const file of files) {
        const ext = path.extname(file);

        if (extensions[ext]) {
            found[extensions[ext]] =
                (found[extensions[ext]] || 0) + 1;
        }
    }

    if (Object.keys(found).length > 0) {
        const language = Object.entries(found)
            .sort((a, b) => b[1] - a[1])[0][0];

        return {
            language: language.toLowerCase(),
            name: language
        };
    }

    return null;
}

module.exports = detectProject;
