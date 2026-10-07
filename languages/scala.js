const { run } = require("./helpers");

module.exports = {
    id: "scala",
    name: "Scala (sbt)",

    manifests: ["build.sbt"],

    extensions: [".scala"],

    tools: () => [
        {
            command: "java",
            package: "jdk-openjdk"
        },
        {
            command: "sbt",
            package: "sbt"
        }
    ],

    run: p => run("sbt", ["run"], p)
};
