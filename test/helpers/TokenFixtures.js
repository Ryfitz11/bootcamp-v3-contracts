async function deployTokenFixture() {
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy("Dapp Uni", "DAPP", "1000000");

  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const reciever = accounts[1];
  const exchange = accounts[2];

  return { token, deployer, reciever, exchange};
}

module.exports = {
  deployTokenFixture,
};
