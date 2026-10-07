const net = require("net");


function isFree(port) {

    return new Promise(resolve => {

        const server = net.createServer();


        server.once("error", () => {
            resolve(false);
        });


        server.once("listening", () => {

            server.close(() => {
                resolve(true);
            });

        });


        server.listen(
            port,
            "127.0.0.1"
        );

    });

}



async function findPort(start = 8000) {

    let port = start;


    while (!(await isFree(port))) {

        port++;

    }


    return port;

}



module.exports = {
    findPort
};
