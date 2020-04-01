const Contract = artifacts.require("Toggle");

module.exports = function(deployer) {
  deployer.deploy(Contract);
};
