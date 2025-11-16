import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "fs";
import axios from "axios";
import { join } from "path";

const API_BASE_URL = "https://nocturne.offchain.club/api";

export interface NocturneMiner {
  id: string;
  mnemonic: string;
}

export interface InputFileData {
  "nocturne-miners": NocturneMiner[];
}

export function readInputFile(filePath: string): InputFileData {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export async function getStatistics(minerId: string) {
  const response = await axios.get(`${API_BASE_URL}/statistics/${minerId}`);
  return response.data;
}

export async function fetchAndSaveStatistics(
  minerIds: string[],
  outputDir: string,
) {
  // Create output directory if it doesn't exist
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const results = [];

  for (const minerId of minerIds) {
    try {
      console.log(`Fetching statistics for ${minerId}...`);
      const data = await getStatistics(minerId);

      // Save to file
      const outputPath = join(outputDir, `${minerId}.json`);
      writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");

      console.log(`Saved statistics to ${outputPath}`);
      results.push({ minerId, success: true, outputPath });
    } catch (error) {
      console.error(`Error fetching statistics for ${minerId}:`, error);
      results.push({ minerId, success: false, error: String(error) });
    }
  }

  return results;
}

export function loadStatisticsFromFile(filePath: string) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export function loadInputFile(filePath: string) {
  return JSON.parse(readFileSync(filePath, "utf-8"));
}

export interface StatisticFile {
  fileName: string;
  minerId: string;
  data: {
    wallets: number;
    totalReceipts: number;
    avgHashrate: number;
    avgMiningTime: number;
    stats: {
      addr: string;
      index: number;
      receipts: {
        day: string;
        amount: number;
      }[];
    }[];
  };
}

export function loadAllStatisticsFromDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    throw new Error(`Directory does not exist: ${dirPath}`);
  }

  const files = readdirSync(dirPath);
  const jsonFiles = files.filter((file) => file.endsWith(".json"));

  return jsonFiles.map((file) => {
    const filePath = join(dirPath, file);
    const data = loadStatisticsFromFile(filePath);
    return {
      fileName: file,
      minerId: file.replace(".json", ""),
      data,
    } as StatisticFile;
  });
}
