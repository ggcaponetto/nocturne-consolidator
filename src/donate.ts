import axios from "axios";
import { signMessage } from "./signing.js";
import { StatisticFile } from "./utils.js";
import chalk from "chalk";
import { argv } from "./index.js";
import pino from "pino";
const fileLogger = pino(pino.destination("donate.log"));

const SCAVENGER_BASE_URL = "https://scavenger.prod.gd.midnighttge.io";

export async function donateRequest(
  donorAddress: string,
  recipientAddress: string,
  signature: string
) {
  if (argv?.skipDonation) {
    console.log(chalk.yellow("Skipping donation HTTP request, as per flag."));
    return;
  }
  const url = `${SCAVENGER_BASE_URL}/donate_to/${recipientAddress}/${donorAddress}/${signature}`;
  return await axios.post(url, {});
}

export async function donateFromMnemonic(
  networkId: 0 | 1,
  donorMnemonic: string[],
  donorAddress: string,
  recipientAddress: string,
  accountIndex: number
) {
  const message = `Assign accumulated Scavenger rights to: ${recipientAddress}`;
  const dataSignature = await signMessage(
    networkId,
    message,
    donorMnemonic,
    donorAddress,
    accountIndex
  );
  return await donateRequest(
    donorAddress,
    recipientAddress,
    dataSignature.signature
  );
}

export async function donate(
  donorMnemonic: string,
  donorAddress: string,
  recipientAddress: string,
  accountIndex: number,
  counter: number,
  minerId: string
) {
  // Expect the donateFromMnemonic call to fail with 404 (wallet not found/invalid)
  const mnemonicDonorArray = donorMnemonic.split(" ");
  try {
    const response = await donateFromMnemonic(
      1, // mainnet
      mnemonicDonorArray,
      donorAddress,
      recipientAddress,
      accountIndex
    );
    if (response === undefined) {
      // If skipping donation via flag, just return
      return;
    }
    if (argv?.debug) {
      console.log("Response:", {
        counter,
        accountIndex,
        donorAddress,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });
    } else {
      console.log(`Response Status: ${response.status}`);
    }
    fileLogger.info({
      minerId,
      counter,
      accountIndex,
      donorAddress,
      status: response.status,
      data: response.data,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error instanceof axios.AxiosError && error.response) {
        if (argv?.debug) {
          console.error(chalk.red("Axios Error:"), error.response.config);
        } else {
          console.error(chalk.red("Donation error:"), {
            error: error.message,
            status: error.response.status,
            data: error.response.data,
          });
          fileLogger.error({
            minerId,
            counter,
            accountIndex,
            donorAddress,
            message: error.message,
            status: error.response.status,
            data: error.response.data,
          });
        }
      }
    }
  }
}

interface InputFile {
  recipientAddress: string;
  "nocturne-miners": { id: string; mnemonic: string }[];
}

export function getWalletMnemonicByAddress(
  statisticFile: StatisticFile,
  inputFile: InputFile,
  address: string
) {
  const minerId = statisticFile.minerId;
  const miner = inputFile["nocturne-miners"].find((m) => m.id === minerId);
  if (!miner) {
    throw new Error(`Miner with ID ${minerId} not found in input file.`);
  }
  const mnemonic = miner?.mnemonic;
  if (!mnemonic) {
    throw new Error(`Mnemonic for miner ID ${minerId} not found.`);
  }
  console.log("Found mnemonic for address: ", address);
  return mnemonic;
}

export async function donateAll(
  statisticFiles: StatisticFile[],
  inputFile: InputFile
) {
  // Load all statistics
  let counterStatisticsFile = 0;
  let counterDonation = 0;
  for (const statisticFile of statisticFiles) {
    counterStatisticsFile++;
    console.log(
      chalk.magenta(
        `Processing donations for minerId: ${statisticFile.minerId}`
      )
    );
    for (const statEntry of statisticFile.data.stats) {
      const donorAddress = statEntry.addr;
      const donorAdressIndex = statEntry.index;
      const accountIndex = statEntry.index;
      try {
        const donorMnemonic = getWalletMnemonicByAddress(
          statisticFile,
          inputFile,
          donorAddress
        );
        console.log(
          chalk.blue(
            `[#${counterStatisticsFile} Miner: ${statisticFile.minerId}] Donation #${donorAdressIndex}`
          )
        );
        console.log(`  └─ Donor Address:     ${donorAddress}`);
        console.log(`  └─ Recipient: ${inputFile.recipientAddress}`);
        console.log(
          `  └─ Donor Mnemonic:    ${donorMnemonic.substring(0, 10)}...`
        );
        counterDonation++;
        await donate(
          donorMnemonic,
          donorAddress,
          inputFile.recipientAddress,
          accountIndex,
          counterDonation,
          statisticFile.minerId
        );
      } catch (error) {
        console.error(
          `Failed to process donation for minerId: ${statisticFile.minerId}`,
          error
        );
      }
    }
  }
}
