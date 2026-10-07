const { spawn } = require("child_process");

module.exports = function openBrowser(url) {
    let command;
    let args;

    if (process.platform === "linux") {
        command = "xdg-open";
        args = [url];
    } else if (process.platform === "darwin") {
        command = "open";
        args = [url];
    } else if (process.platform === "win32") {
        command = "cmd";
        args = ["/c", "start", "", url];
    } else {
        console.log("Open manually:", url);
        return;
    }

    const child = spawn(
        command,
        args,
        {
            detached: true,
            stdio: "ignore",
            windowsHide: true
        }
    );

    child.unref();

    child.on("error", error => {
        console.log(
            `❌ Failed to open browser: ${error.message}`
        );

        console.log(
            `🌐 Open manually: ${url}`
        );
    });
};