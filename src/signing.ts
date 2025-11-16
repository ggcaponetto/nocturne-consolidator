import { MeshWallet } from "@meshsdk/core";
import { argv } from "./index.js";
import chalk from "chalk";

export async function signMessage(
  networkId: 0 | 1,
  message: string,
  mnemonic: string[],
  signerAddress: string,
  accountIndex: number
) {
  // Sign a message and verify it.
  const wallet = new MeshWallet({
    accountIndex,
    networkId,
    key: {
      type: "mnemonic",
      words: mnemonic,
    },
  });
  try {
    const signature = await wallet.signData(message, signerAddress);
    if (argv?.debug) {
      console.log(chalk.green("Generated signature:"), {
        signature: signature.signature,
        message: message,
        signerAddress: signerAddress,
      });
    }
    return signature;
  } catch (error) {
    console.error("Error signing message:", {
      wallet,
      message,
      signerAddress,
      networkId,
      mnemonic: `${mnemonic.join(" ").substring(0, 10)}...`,
    });
    throw error;
  }
}
