# runproject

Run `runproject` inside any project folder. It detects the language, installs
missing tools (pacman, Arch/Manjaro), installs project dependencies, and runs it.

    runproject            # current folder
    runproject ~/code/x   # another folder
    runproject -y         # answer yes to every question
    runproject --list     # supported languages

## Adding a language
Create `languages/<name>.js` exporting `{ id, name, manifests, extensions,
tools(p), dependencies?(p), run(p) }` and add it to `languages/index.js`.
