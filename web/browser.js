const { exec } = require("child_process");

module.exports = function(url) {

    if (process.platform === "linux") {
        exec(`xdg-open "${url}"`);
        return;
    }

    if (process.platform === "darwin") {
        exec(`open "${url}"`);
        return;
    }

    if (process.platform === "win32") {
        exec(`start ${url}`);
        return;
    }

    console.log("Open manually:", url);
};
