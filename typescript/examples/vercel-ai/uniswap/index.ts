import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import { http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { uniswap } from "@goat-sdk/plugin-uniswap";
import { viem } from "@goat-sdk/wallet-viem";

require("dotenv").config();

const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const TOKEN_TO = "0x6982508145454Ce325dDbE47a25d4ec3d2311933";
const PROMPT = `Use your uniswap tool to generate the swap transaction data to buy 1000 USDC (${USDC_ADDRESS}) of ${TOKEN_TO} on uniswap.
Format the output in JSON and return nothing more than this JSON. Do not include any formatting markers such as '\`\`\`json'`;

const account = privateKeyToAccount(process.env.WALLET_PRIVATE_KEY as `0x${string}`);

const walletClient = createWalletClient({
    account: account,
    transport: http(process.env.ALCHEMY_API_KEY),
    chain: mainnet,
});

(async () => {
    const tools = await getOnChainTools({
        wallet: viem(walletClient),
        plugins: [
            uniswap({
                apiKey: process.env.UNISWAP_API_KEY as string,
                baseUrl: process.env.UNISWAP_BASE_URL as string,
                chain: walletClient.chain,
            }),
        ],
    });

    const result = await generateText({
        model: openai("gpt-4o-mini"),
        tools: tools,
        maxSteps: 5,
        prompt: PROMPT,
    });

    console.log(result.text);
})();
