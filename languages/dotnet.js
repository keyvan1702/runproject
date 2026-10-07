const { run } = require("./helpers");

module.exports = {
    id: "dotnet",
    name: "C# / F# (.NET)",
    manifests: ["*.csproj", "*.fsproj", "*.sln"],
    extensions: [],
    tools: () => [{ command: "dotnet", package: "dotnet-sdk" }],

    // `dotnet run` restores NuGet packages itself
    run: p => run("dotnet", ["run"], p)
};
