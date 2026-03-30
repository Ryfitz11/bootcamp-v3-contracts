const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")

const { deployTokenFixture } = require("./helpers/TokenFixtures")

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 18)
}

describe("Token", () => {
  describe("deployment", () => {
    const NAME = "Dapp Uni"
    const SYMBOL = "DAPP"
    const DECEMALS = "18"
    const TOTALSUPPLY = tokens("1000000")

    it("has correct name", async () => {
      const { token } = await loadFixture(deployTokenFixture)
      expect(await token.name()).to.equal(NAME)
    })

    it("has correct symbol", async () => {
      const { token } = await loadFixture(deployTokenFixture)
      expect(await token.symbol()).to.equal(SYMBOL)
    })

    it("has correct decimals", async () => {
      const { token } = await loadFixture(deployTokenFixture)
      expect(await token.decimals()).to.equal(DECEMALS)
    })

    it("has correct totalSupply", async () => {
      const { token } = await loadFixture(deployTokenFixture)
      expect(await token.totalSupply()).to.equal(TOTALSUPPLY)
    })
    it("assigns total supply to deployer", async () => {
      const { token, deployer } = await loadFixture(deployTokenFixture)
      expect(await token.balanceOf(deployer.address)).to.equal(TOTALSUPPLY)
    })
  })
  describe("Sending Tokens", () => {
    const AMOUNT = tokens(100)
    
    describe("Success", () => {
      it("transfers token balance", async () => {
      const { token, deployer, reciever } = await loadFixture(deployTokenFixture)

      const transaction = await token.connect(deployer).transfer(reciever.address, AMOUNT)
      await transaction.wait()

      expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
      expect(await token.balanceOf(reciever.address)).to.equal(AMOUNT)

    })
    it("emits a transfer event", async () => {
      const { token, deployer, reciever } = await loadFixture(deployTokenFixture)

      const transaction = await token.connect(deployer).transfer(reciever.address, AMOUNT)
      const receipt = await transaction.wait()
      // console.log(receipt.logs[0].args)
      
      await expect(transaction).to.emit(token, "Transfer").withArgs(deployer.address, reciever.address, AMOUNT)
    })
    })
    describe("Failure", () => {
      it("rejects insufficient balances", async () =>{
      const { token, deployer, reciever } = await loadFixture(deployTokenFixture)

      const INVALID_AMOUNT = tokens(100000000)

      const ERROR = "Token: Insufficient funds"

      await expect(token.connect(deployer).transfer(reciever.address, INVALID_AMOUNT)).to.be.revertedWith(ERROR)
    })
    it("rejects invalid recepient", async () =>{
      const { token, deployer, reciever } = await loadFixture(deployTokenFixture)

      const INVALID_ADDRESS = "0x0000000000000000000000000000000000000000"

      const ERROR = "Token: Recepient is address 0"

      await expect(token.connect(deployer).transfer(INVALID_ADDRESS, AMOUNT)).to.be.revertedWith(ERROR)
    })
    })
  })
  
})
