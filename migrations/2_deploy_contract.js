const ERC721 = artifacts.require("ERC721");

const Planet = artifacts.require("Planet");

module.exports = function(deployer) {
  deployer.deploy(ERC721);
  deployer.deploy(Planet);
};
