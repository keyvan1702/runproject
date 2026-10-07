# runproject 🚀

**Run almost any project with a single command.**

`runproject` is an experimental multi-language project runner for Linux.

Instead of manually figuring out which runtime, package manager, dependencies, build system, and start command a project needs, run:

```bash
runproject
```

`runproject` analyzes the current directory, detects the project type, checks the required runtime and tools, optionally installs missing components, installs project dependencies when needed, and finally runs the project.

> **AI-assisted project:** `runproject` was built with significant assistance from AI during development, debugging, architecture design, and testing. The project is actively being improved and should currently be considered an experimental/early-stage tool.

---

## ✨ What does it do?

When you run:

```bash
runproject
```

the tool tries to:

1. 🔍 Detect the project language and project type
2. ⚙️ Detect required runtimes and development tools
3. 📦 Check whether required tools are installed
4. ⬇️ Ask for permission before installing missing system packages
5. 📚 Detect and install project dependencies
6. 🔨 Build the project when necessary
7. 🚀 Determine an appropriate way to run it
8. ▶️ Start the project

The goal is to make starting an unfamiliar project as simple as:

```bash
cd my-project
runproject
```

---

## 🌍 Supported languages

The current version has support for:

| Language / Platform | Status |
|---|---|
| Node.js / JavaScript | ✅ |
| TypeScript | ✅ |
| Python | ✅ |
| C | ✅ |
| C++ | ✅ |
| Rust | ✅ |
| Go | ✅ |
| Java | ✅ |
| PHP | ✅ |
| Ruby | ✅ |
| Zig | ✅ |
| Deno | ✅ |
| .NET / C# | ✅ |
| Elixir | ✅ |
| Haskell | ✅ |
| Julia | ✅ |
| Scala / sbt | ✅ |
| Lua | ✅ |
| Perl | ✅ |
| R | ✅ |
| Shell / Bash | ✅ |

Support is based on project files, manifests, source extensions, build systems, and available project metadata.

---

## 🧠 How it works

A simplified version of the workflow looks like this:

```text
                 ┌─────────────────┐
                 │   runproject    │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Detect project  │
                 │     type        │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Detect runtime  │
                 │  and toolchain  │
                 └────────┬────────┘
                          │
                    Missing?
                    /       \
                  Yes        No
                   │          │
                   ▼          │
             Ask user         │
                   │          │
                   ▼          │
              Install         │
                   │          │
                   └────┬─────┘
                        ▼
                 ┌─────────────────┐
                 │ Check project   │
                 │ dependencies    │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ Build if needed │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Run project    │
                 └─────────────────┘
```

The implementation is divided into language detectors, installers, dependency handling, and runners so that new languages can be added without rewriting the entire application.

---

## 🖥️ Current platform

The current installer implementation is designed primarily for:

- Arch Linux
- Manjaro Linux

System packages are currently installed through `pacman`.

For example, if a required runtime is missing, `runproject` can ask:

```text
❌ python is not installed
📦 Required package: python

❓ Install python using pacman? (y/n):
```

No privileged installation is performed without user confirmation.

> Cross-distribution package-manager support is planned for future versions.

---

## 📦 Installation

### From source

Clone the repository:

```bash
git clone git@github.com:keyvan1702/runproject.git
cd runproject
```

Install the Node.js dependencies:

```bash
npm install
```

Then make the command available:

```bash
mkdir -p ~/.local/bin
ln -sf "$PWD/bin/runproject.js" ~/.local/bin/runproject
```

Make sure `~/.local/bin` is in your `PATH`.

Then test:

```bash
runproject
```

---

## 🧪 Example

Suppose you have:

```text
my-project/
└── main.py
```

with:

```python
print("Hello from Python!")
```

Run:

```bash
cd my-project
runproject
```

`runproject` can detect the project as Python, check whether Python is available, and then execute the project.

For projects with dependency files, it can also detect and install dependencies when supported.

---

## 📚 Dependency support

Several ecosystems already have dependency handling.

Examples include:

### Node.js

```text
package.json
```

Supports npm and project package-manager detection for supported package managers.

### Python

```text
requirements.txt
pyproject.toml
```

Python environments can be created using `.venv`.

### PHP

```text
composer.json
```

Composer dependencies can be installed automatically.

### Ruby

```text
Gemfile
```

Bundler dependencies can be installed into a project-local `vendor/bundle` directory.

Other ecosystems such as Maven, Gradle, sbt, Cargo, and Go have their own build/dependency mechanisms and are handled through their respective tooling.

---

## 🏗️ Project structure

The project is organized around separate responsibilities:

```text
runproject/
├── bin/
│   └── runproject.js
│
├── detectors/
│   └── index.js
│
├── installers/
│   ├── arch.js
│   ├── check.js
│   ├── dependencies.js
│   ├── dependencies-install.js
│   ├── package-manager.js
│   └── platform.js
│
├── languages/
│   ├── cpp.js
│   ├── deno.js
│   ├── dotnet.js
│   ├── elixir.js
│   ├── go.js
│   ├── haskell.js
│   ├── helpers.js
│   ├── index.js
│   ├── java.js
│   ├── julia.js
│   ├── node.js
│   ├── php.js
│   ├── python.js
│   ├── ruby.js
│   ├── rust.js
│   ├── scala.js
│   ├── scripting.js
│   └── zig.js
│
├── runners/
│   └── node.js
│
├── index.js
├── package.json
├── package-lock.json
├── README.md
└── test-project.js
```

The architecture is intentionally modular so that adding a new language does not require changing the core workflow.

---

## 🤖 Built with AI assistance

This project was developed with substantial assistance from AI.

AI was used during development for:

- Architecture and project structure
- Language detection design
- Runtime detection
- Dependency handling
- Build and execution logic
- Debugging
- Error analysis
- Testing strategies
- Refactoring
- Documentation

However, the project was also tested against real projects and real runtime installations on a Manjaro Linux system.

Examples of real-world testing included:

- Installing missing runtimes through `pacman`
- Installing Python packages
- Installing Node.js dependencies
- Building C/C++ projects
- Running Cargo projects
- Running Maven and Gradle projects
- Installing and running Ruby gems
- Running Composer projects
- Testing scripting languages such as Lua, Perl, R, and Bash

AI assistance is part of the development process, not a claim that every part of the project is automatically correct or production-ready.

---

## ⚠️ Current limitations

`runproject` is still an experimental project.

Some areas are intentionally not considered complete yet:

- Package-manager support is currently focused on Arch/Manjaro.
- Project detection is primarily based on files in the project root.
- Some language ecosystems have only basic runner support.
- Complex project structures may require additional configuration.
- Automatic entry-point detection is heuristic.
- Kotlin support is not yet equivalent to Java support.
- Some build systems have assumptions about their available tasks.
- More comprehensive dependency verification is still being developed.
- More extensive cross-platform testing is needed.

If `runproject` cannot confidently determine how to run a project, it should fail rather than blindly execute an arbitrary command.

---

## 🛣️ Roadmap

Planned improvements include:

- [ ] Better project detection
- [ ] Better Deno / TypeScript detection
- [ ] Improved Rust toolchain detection
- [ ] Full Kotlin support
- [ ] Better Gradle and Maven project detection
- [ ] More robust dependency verification
- [ ] Support for more Python dependency formats
- [ ] Better nested-project detection
- [ ] More package managers
- [ ] Debian / Ubuntu support
- [ ] Fedora support
- [ ] Improved Windows support
- [ ] Improved macOS support
- [ ] npm package distribution
- [ ] Automated test suite
- [ ] CI/CD
- [ ] More language integrations

---

## 🤝 Contributing

Contributions, bug reports, and ideas are welcome.

If you find a project that `runproject` cannot detect or run correctly, please open an issue and include:

- Operating system
- Project language
- Project structure
- Relevant manifest/build files
- `runproject` output
- Expected behavior
- Actual behavior

Pull requests for new languages, better detection, improved runners, and platform support are welcome.

---

## 📄 License

A project license has not been selected yet.

Until a license is added to the repository, please do not assume that the source code is freely reusable, modified, or redistributed.

---

## ⭐ Project

GitHub:

https://github.com/keyvan1702/runproject

If you find the project useful, consider giving it a ⭐ on GitHub.

---

## 👨‍💻 Author

**keyvan1702**

Built with curiosity, Linux, Node.js, and a lot of debugging. 🚀
