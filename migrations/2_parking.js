var Parking = artifacts.require("./Parking.sol");

module.exports = function(deployer, network, accounts) {
  const userAddress = accounts[4];
  deployer.deploy(Parking, userAddress);
};
