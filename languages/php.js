const {
    exists,
    run,
    runAsync,
    build,
    findEntry,
    noEntry
} = require("./helpers");

const services = require("../services/manager");
const laravel = require("../frameworks/laravel");

const openBrowser =
    require("../web/browser");


function waitForServer(url, timeout = 20000) {
    const http = require("http");

    return new Promise(resolve => {

        const start = Date.now();

        function check() {

            const req = http.get(url, res => {

                console.log(
                    `HTTP ${res.statusCode}`
                );

                resolve(true);

                req.destroy();

            });

            req.on("error", () => {

                if (Date.now() - start > timeout) {

                    resolve(false);

                } else {

                    setTimeout(check, 500);

                }

            });

        }

        check();

    });
}


async function runWeb(command, args, cwd, url) {

    runAsync(command, args, cwd);


    console.log(
        `\n🌐 Waiting for web server: ${url}\n`
    );


    const ready = await waitForServer(url);


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
            "⚠️ Server did not start in time"
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
                command: "php",
                package: "php"
            }
        ];


        if (exists(p, "composer.json")) {

            tools.push({
                command: "composer",
                package: "composer"
            });

        }


        return tools;

    },



    dependencies(p) {

        if (!exists(p, "composer.json")) {

            return null;

        }


        return {

            label: "composer",


            installed: exists(
                p,
                "vendor"
            ),


            prompt:
                "Install dependencies using composer?",


            install: () =>
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


        // Laravel
        if (exists(p, "artisan")) {

            console.log(
                "\n⚙ Checking Laravel services...\n"
            );
            services.ensureDatabase(p);
            laravel.prepare(p);





            return runWeb(

                "php",

                [
                    "artisan",
                    "serve"
                ],

                p,

                "http://127.0.0.1:8000"

            );


        }



        // PHP built-in server

        if (
            exists(
                p,
                "public",
                "index.php"
            )
        ) {


            return runWeb(

                "php",

                [
                    "-S",
                    "localhost:8000",
                    "-t",
                    "public"
                ],

                p,

                "http://localhost:8000"

            );


        }



        const entry = findEntry(

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