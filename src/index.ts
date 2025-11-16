import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import chalk from "chalk";
import {
  fetchAndSaveStatistics,
  loadAllStatisticsFromDir,
  loadInputFile,
  StatisticFile,
} from "./utils.js";
import { donateAll } from "./donate.js";

// Force color support for PowerShell
process.env.FORCE_COLOR = "3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8")
);

const isMain = process.argv[1] === __filename;

export const argv = isMain
  ? yargs(hideBin(process.argv))
      .option("input-file", {
        alias: "i",
        type: "string",
        description: "Path to the input JSON file",
        demandOption: true,
      })
      .option("skip-statistics-dl", {
        alias: "s",
        type: "boolean",
        description: "Skip downloading statistics",
        demandOption: false,
      })
      .option("skip-donation", {
        alias: "d",
        type: "boolean",
        description: "Skip making donations",
        demandOption: false,
      })
      .option("debug", {
        type: "boolean",
        description: "Enable verbose logging",
        demandOption: false,
      })
      .version(packageJson.version)
      .alias("version", "v")
      .help()
      .alias("help", "h")
      .parseSync()
  : ({} as {
      inputFile: string;
      skipStatisticsDl: boolean;
      skipDonation: boolean;
      debug: boolean;
    });

const STATS_OUTPUT_DIR = "./stats-output";

console.log(chalk.blue(`Midnight consolidation utility started.`));
console.log(chalk.cyan(`Input file: ${argv.inputFile}`));
if (isMain) {
  const inputFile = await loadInputFile(argv.inputFile);
  console.log(
    chalk.green(
      `Loaded ${inputFile["nocturne-miners"].length} nocturne miners from input file.`
    )
  );

  // Fetch and save statistics
  if (!argv.skipStatisticsDl) {
    // Extract miner IDs for fetching statistics
    const minerIds = inputFile["nocturne-miners"].map(
      (miner: { id: string }) => miner.id
    );
    console.log(
      chalk.yellow(`Fetching statistics for ${minerIds.length} miners...`)
    );
    await fetchAndSaveStatistics(minerIds, STATS_OUTPUT_DIR);
  } else {
    console.log(chalk.yellow(`Skipping statistics download as per flag.`));
  }

  // Load all statistics
  const statisticFiles: StatisticFile[] =
    loadAllStatisticsFromDir(STATS_OUTPUT_DIR);
  await donateAll(statisticFiles, inputFile);

  console.log(chalk.blue(`Midnight consolidation utility finished.`));
}
