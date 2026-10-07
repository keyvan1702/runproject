if (exists(p, ".env")) {

    console.log(
        "\n⚙ Checking database service...\n"
    );

    if (
        !database.isRunning("mariadb") &&
        !database.isRunning("mysql")
    ) {

        console.log(
            "⚠️ Database is not running"
        );

        const started =
            database.start("mariadb");

        if (!started) {
            database.start("mysql");
        }
    }

    console.log(
        "✅ Database service ready"
    );
}
