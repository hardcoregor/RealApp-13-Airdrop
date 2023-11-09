const { MerkleTree } = require('merkletreejs');
const KECCAK256 = require('keccak256');
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('MerkleDistributor', () => {
  beforeEach(async() => {
    [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8] = await ethers.getSigners();

    walletAddress = [signer1, signer2, signer3, signer4, signer5, signer6, signer7, signer8].map((s) => s.address);

    leaves = walletAddress.map(x => KECCAK256(x));

    tree = new MerkleTree(leaves, KECCAK256, { sortPairs: true});

    PortalCoin = await ethers.getContractFactory('PortalCoin', signer1);
    token = await PortalCoin.deploy();
    
    MerkleDistributor = await ethers.getContractFactory('MerkleDistributor', signer1);
    distributor = await MerkleDistributor.deploy(token.address, tree.getHexRoot(), 500);

    await token.connect(signer1).mint(
      distributor.address,
      '4000'
    );
  });

  describe('8 accounts tree', () => {
    it('successful and unsuccessful claim', async() => {
      expect(await token.balanceOf(signer1.address)).to.be.equal(0);

      const proof = tree.getHexProof(KECCAK256(signer1.address));

      await distributor.connect(signer1).claim(proof);

      expect(await token.balanceOf(signer1.address)).to.be.equal(500);

      expect(distributor.connect(signer1).claim(proof)).to.be.revertedWith("AlreadyClaimed");

      expect(await token.balanceOf(signer1.address)).to.be.equal(500)
    });

    it('unsuccessful claim', async() => {
      const generatedAddress = '0x4dE8dabfdc4d5A508F6FeA28C6f1B288bbdDc26e';
      const proof2 = tree.getHexProof(KECCAK256(generatedAddress));
      expect(await token.balanceOf(signer1.address)).to.be.equal(0);

      expect(distributor.connect(signer1).claim(proof2)).to.be.revertedWith("InvalidProof");
    });

    it('emit a successful event', async() => {
      const proof = tree.getHexProof(KECCAK256(signer1.address));
      expect(await token.balanceOf(signer1.address)).to.be.equal(0);


      await expect(
        await distributor.connect(signer1).claim(proof)
        ).to.emit(distributor, 'Claimed')
        .withArgs(signer1.address, 500);
    });
  })
})