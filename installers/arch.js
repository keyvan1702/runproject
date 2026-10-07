const { execSync } = require("child_process");

function installPackage(packageName) {
    console.log(`📦 Installing ${packageName}...`);

    try {
        execSync(`sudo pacman -S --needed ${packageName}`, {
            stdio: "inherit",
            shell: "/bin/bash"
        });

        console.log(`✅ ${packageName} installed successfully`);
        return true;
    } catch (error) {
        console.log(`❌ Failed to install ${packageName}`);
        return false;
    }
}

module.exports = installPackage;
