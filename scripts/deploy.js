const { MerkleTree } = require("merkletreejs");
const KECCAK256 = require("keccak256");
const { BigNumber } = require("ethers");

const fs = require("fs").promises;

async function main() {
  [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8] = await ethers.getSigners();
  walletAddress = [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8].map((s) => s.address);
  leaves = walletAddress.map((x) => KECCAK256(x));
  tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true });

  PortalCoin = await ethers.getContractFactory("PortalCoin", signer1);
  token = await PortalCoin.deploy();

  MerkleDistributor = await ethers.getContractFactory("MerkleDistributor", signer1);
  distributor = await MerkleDistributor.deploy(token.address, tree.getHexRoot(), BigNumber.from('10000000000000000000'));

  await token.connect(signer1).mint(
    distributor.address,
    BigNumber.from('90000000000000000000')
  )

  console.log("Token", token.address);
  console.log("Distributor", distributor.address);
  console.log("Signer", signer1.address);

  const indexedAddresses = {};

  walletAddress.map((x, idx) => indexedAddresses[idx] = x);

  const serializedAddresses = JSON.stringify(indexedAddresses);

  await fs.writeFile("client/src/walletAddresses.json", serializedAddresses);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
  })
