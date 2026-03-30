const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { deployTokenFixture } = require("./helpers/TokenFixtures");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 18);
};

describe("Token", () => {
  const NAME = "Dapp Uni";
  const SYMBOL = "DAPP";
  const DECEMALS = "18";
  const TOTALSUPPLY = tokens("1000000");

  it("has correct name", async () => {
    const { token } = await loadFixture(deployTokenFixture);
    expect(await token.name()).to.equal(NAME);
  });

  it("has correct symbol", async () => {
    const { token } = await loadFixture(deployTokenFixture);
    expect(await token.symbol()).to.equal(SYMBOL);
  });

  it("has correct decimals", async () => {
    const { token } = await loadFixture(deployTokenFixture);
    expect(await token.decimals()).to.equal(DECEMALS);
  });

  it("has correct totalSupply", async () => {
    const { token } = await loadFixture(deployTokenFixture);
    expect(await token.totalSupply()).to.equal(TOTALSUPPLY);
  });
  it("assigns total supply to deployer", async () => {
    const { token, deployer } = await loadFixture(deployTokenFixture);
    expect(await token.balanceOf(deployer.address)).to.equal(TOTALSUPPLY);
  });
});
