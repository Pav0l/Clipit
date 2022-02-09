import prompts from "prompts";

export async function requestTransactionInputs() {
  const { TO_ADDRESS }: { TO_ADDRESS: string } = await prompts({
    type: "text",
    name: "TO_ADDRESS",
    message: "Enter address where to send the transaction:",
  });

  const { ETHER_VALUE }: { ETHER_VALUE: number } = await prompts({
    type: "number",
    name: "ETHER_VALUE",
    message: "Enter amount of ETH to send:",
    initial: 0,
    style: "default",
    min: 0,
    float: true,
  });

  const { DATA }: { DATA: string } = await prompts({
    type: "text",
    name: "DATA",
    message: "Enter transaction data:",
    initial: "0x",
  });

  return { TO_ADDRESS, ETHER_VALUE: ETHER_VALUE.toString(), DATA };
}
