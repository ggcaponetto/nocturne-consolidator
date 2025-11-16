import { describe, it, expect } from "vitest";
import { signMessage } from "../src/signing.js";
import { MeshWallet } from "@meshsdk/core";
import { checkSignature } from "@meshsdk/core";

describe("signMessage", () => {
  it("should sign and verify a message", async () => {
    const mnemonic = MeshWallet.brew();
    const mnemonicArray = Array.isArray(mnemonic)
      ? mnemonic
      : mnemonic.split(" ");

    const wallet = new MeshWallet({
      networkId: 1, // 0: testnet, 1: mainnet
      key: {
        type: "mnemonic",
        words: mnemonicArray,
      },
    });
    const message = "Hello, Cardano!";
    const unusedRecipientAddresses = await wallet.getUnusedAddresses();
    const recipientAddress = unusedRecipientAddresses[0];

    const signature = await signMessage(
      1,
      message,
      mnemonicArray,
      recipientAddress,
      0
    );
    expect(signature).toBeDefined();

    const unusedAddresses = await wallet.getUnusedAddresses();
    const isValid = await checkSignature(
      message,
      signature,
      unusedAddresses[0],
    );
    expect(isValid).toBe(true);
  });
});
