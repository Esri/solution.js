import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const rootPackage = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const tagIndex = process.argv.indexOf("--tag");
const tag = tagIndex === -1 ? "latest" : process.argv[tagIndex + 1];

const runNpm = (args, options) =>
  process.platform === "win32"
    ? spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npm", ...args], options)
    : spawnSync("npm", args, options);

if (!tag) {
  throw new Error("The --tag option requires a value.");
}

for (const workspace of rootPackage.workspaces) {
  const packageFile = new URL(`../${workspace}/package.json`, import.meta.url);
  const packageJson = JSON.parse(readFileSync(packageFile, "utf8"));

  if (packageJson.private) {
    continue;
  }

  const viewResult = runNpm(["view", packageJson.name, "versions", "--json"], {
    encoding: "utf8",
  });

  if (viewResult.status !== 0) {
    process.stderr.write(viewResult.stderr ?? `${viewResult.error}\n`);
    process.exit(viewResult.status ?? 1);
  }

  const publishedVersions = JSON.parse(viewResult.stdout);
  const versions = Array.isArray(publishedVersions) ? publishedVersions : [publishedVersions];

  if (versions.includes(packageJson.version)) {
    console.log(`Skipping ${packageJson.name}@${packageJson.version}; already published.`);
    continue;
  }

  const packagePath = `./${workspace.replaceAll("\\", "/")}`;
  const stageResult = runNpm(["stage", "publish", packagePath, "--access", "public", "--tag", tag], {
    stdio: "inherit",
  });

  if (stageResult.status !== 0) {
    process.exit(stageResult.status ?? 1);
  }
}
