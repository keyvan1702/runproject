const {
    exists,
    run,
    runAsync,
    build,
    findEntry,
    noEntry
} = require("./helpers");

const services =
    require("../services/manager");

const openBrowser =
    require("../web/browser");

const { findPort } =
    require("../web/port");


function waitForServer(url, timeout = 20000) {

    const http = require("http");

    return new Promise(resolve => {

        const start = Date.now();

        function check() {

            const req = http.get(
                url,
                res => {

                    res.resume();
                    resolve(true);

                }
            );


            req.on("error", () => {

                if (Date.now() - start >= timeout) {

                    resolve(false);

                    return;
                }


                setTimeout(
                    check,
                    300
                );

            });


            req.setTimeout(
                1000,
                () => {

                    req.destroy();

                }
            );

        }


        check();

    });

}



async function runWeb(
    command,
    args,
    cwd,
    url
) {


    runAsync(
        command,
        args,
        cwd
    );


    console.log(
        `\n🌐 Waiting for web server: ${url}\n`
    );


    const ready =
        await waitForServer(url);


    if (ready) {

        console.log(
            `✅ Web server is ready: ${url}`
        );


        console.log(
            "🌐 Opening browser...\n"
        );


        openBrowser(url);


    } else {

        console.log(
            "⚠️ Server not ready"
        );

    }


    return 0;

}



module.exports = {

    id: "php",

    name: "PHP",


    manifests: [
        "composer.json",
        "artisan"
    ],


    extensions: [
        ".php"
    ],



    tools(p) {

        const tools = [
            {
                command:"php",
                package:"php"
            }
        ];


        if (exists(p,"composer.json")) {

            tools.push({
                command:"composer",
                package:"composer"
            });

        }


        return tools;

    },



    dependencies(p) {


        if (!exists(p,"composer.json")) {

            return null;

        }


        return {

            label:"composer",


            installed:
                exists(
                    p,
                    "vendor"
                ),


            prompt:
                "Install dependencies using composer?",



            install:()=> 
                build(
                    "composer",
                    [
                        "install"
                    ],
                    p
                )

        };

    },



    async run(p) {


        if (exists(p,"artisan")) {


            console.log(
                "\n⚙ Checking Laravel services...\n"
            );


            services.ensureDatabase(p);


            console.log(
                "\n⚙ Preparing Laravel...\n"
            );


            const port =
                await findPort(8000);



            return runWeb(

                "php",

                [
                    "artisan",
                    "serve",
                    "--port",
                    String(port)
                ],

                p,

                `http://127.0.0.1:${port}`

            );

        }



        if (
            exists(
                p,
                "public",
                "index.php"
            )
        ) {


            const port =
                await findPort(8000);



            return runWeb(

                "php",

                [
                    "-S",
                    `localhost:${port}`,
                    "-t",
                    "public"
                ],

                p,

                `http://localhost:${port}`

            );

        }



        const entry =
            findEntry(
                p,
                [
                    "main.php",
                    "index.php",
                    "app.php"
                ],
                [
                    ".php"
                ]
            );



        return entry

            ? run(
                "php",
                [
                    entry
                ],
                p
            )

            : noEntry("PHP");

    }

};