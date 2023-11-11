const { ethers } = require("ethers");
let abi = require("./abi.json");

const provider = new ethers.providers.JsonRpcProvider("https://zkevm-rpc.com", {
  chainId: 1101,
  timeout: 300000, // Установите таймаут в миллисекундах, например, 300000 для 5 минут
});
const contractAddress = "0x7b2e3fc7510d1a51b3bef735f985446589219354";

async function getContractInteractions() {
  const contract = new ethers.Contract(contractAddress, abi, provider);

  const filter = {
    address: contractAddress,
    topics: ["0x64f803250cc450b9c5e2cef3ac4c82370f41b8c1e5692f4067b6b96d2430bfcb"],
    fromBlock: 7310027,
    toBlock: "latest",
  };

  const logs = await provider.getLogs(filter);

  const addresses = logs.map((log) => {
    const addressTopic = log.topics[2];
    const formattedAddress = "0x" + addressTopic.slice(26);
    return formattedAddress;
  });

  const uniqueAddresses = [...new Set(addresses)];

  console.log(uniqueAddresses);
}

async function main() {
  await getContractInteractions();
}

main();
