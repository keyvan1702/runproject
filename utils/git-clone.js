const readline = require("readline");
const { execSync } = require("child_process");
const fs = require("fs");

function ask(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}


async function cloneIfEmpty(path) {

    const files = fs.readdirSync(path);

    if (files.length > 0) {
        return false;
    }


    console.log(
        "\n📂 Current folder is empty.\n"
    );


    const answer = await ask(
        "Do you want to clone a GitHub project? (y/n): "
    );


    if (
        answer.toLowerCase() !== "y"
    ) {
        return false;
    }


    const url = await ask(
        "\n🔗 GitHub URL: "
    );


    if (!url) {
        return false;
    }


    console.log(
        "\n⬇️ Cloning project...\n"
    );


    execSync(
        `git clone ${url} .`,
        {
            cwd: path,
            stdio: "inherit"
        }
    );


    console.log(
        "\n✅ Project cloned successfully\n"
    );


    return true;
}


module.exports = cloneIfEmpty;
