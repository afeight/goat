import { Tool } from "@goat-sdk/core";
import { EVMWalletClient } from "@goat-sdk/wallet-evm";
import { encodeFunctionData } from "viem";
import ABI from "./ABI.json";
import { CheckApprovalBodySchema, GetSwapBodySchema } from "./parameters";
import type { UniswapCtorParams } from "./types/UniswapCtorParams";
export class UniswapService {
    constructor(private readonly params: UniswapCtorParams) {}

    @Tool({
        description:
            "Check if the wallet has enough approval for a token and return the transaction to approve the token. The approval must takes place before the swap transaction.",
    })
    async checkApproval(parameters: CheckApprovalBodySchema) {
        const url = new URL(`${this.params.baseUrl}/check_approval`);

        const response = await fetch(url.toString(), {
            method: "POST",
            body: JSON.stringify(parameters),
            headers: {
                "x-api-key": this.params.apiKey,
            },
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch approval: ${response.statusText}`);
        }

        return await response.json();
    }

    @Tool({
        description: "Generate the transaction for a swap",
    })
    async getSwapTransaction(
        walletClient: EVMWalletClient,
        { amountIn, amountOutMin, fromToken, toToken }: GetSwapBodySchema,
    ) {
        const UNISWAP_V3_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
        console.log("amountIn", amountIn);
        console.log("amountOutMin", amountOutMin);
        console.log("fromToken", fromToken);
        console.log("toToken", toToken);
        console.log("walletClient", walletClient.getAddress());
        console.log("walletClient chain", this.params.chain.name.toLowerCase());
        const data = encodeFunctionData({
            abi: ABI,
            functionName: "swapExactTokensForTokens",
            args: [amountIn, amountOutMin ?? 0, [fromToken, toToken], walletClient.getAddress()],
        });

        const tx = {
            to: UNISWAP_V3_ROUTER_ADDRESS,
            value: "0",
            data,
            chain: this.params.chain.name.toLowerCase(),
            signer: walletClient.getAddress(),
        };
        return tx;
    }
}
