
import { getMarketAddress } from "../lib";

async function main() {
  const addr = await getMarketAddress();
  console.log(addr);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
