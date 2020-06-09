const Planet = artifacts.require("Planet");
const ERC721 = artifacts.require("ERC721");
const { expectRevert } = require("@openzeppelin/test-helpers");
const BigNumber = require("bignumber.js");
const truffleAssert = require("truffle-assertions");
const mintAddress = "0x0000000000000000000000000000000000000000";

contract("ERC721", (accounts) => {
  let instance;
  const [meAsAdmin, user1, user2] = [accounts[0], accounts[1], accounts[2]];

  before(async () => {
    instance = await ERC721.deployed();
    for (let i = 0; i < 3; i++) {
      const tx = await instance.mint(meAsAdmin, i);
    }
  });

  it("test: balanceOf()", async () => {
    const initialTokenSupply = 3;
    const tx = await instance.balanceOf(meAsAdmin);
    assert(
      new BigNumber(tx).isEqualTo(new BigNumber(initialTokenSupply)),
      "amount does not match with the expected"
    );
  });

  it("test: ownerOf()", async () => {
    const tokenId = 0;
    const addressExpected = meAsAdmin;
    const tx = await instance.ownerOf.call(tokenId);
    assert(tx === addressExpected, "Owner is not correct");
  });

  it("test: getApproved()", async () => {
    const tokenId = 0;
    const addressExpected = "0x0000000000000000000000000000000000000000";
    let tx = await instance.getApproved.call(tokenId);
    assert(
      tx === addressExpected,
      "This is not the correct approving token ID"
    );
  });

  it("test: transferFrom()", async () => {
    const tokenId = 0;
    const meAsAdminPreBalance = await instance.balanceOf.call(meAsAdmin);
    const receipt = await instance.transferFrom(meAsAdmin, user1, tokenId, {
      from: meAsAdmin,
    });
    const [meAsAdminBalance, user1Balance, owner] = await Promise.all([
      instance.balanceOf(meAsAdmin),
      instance.balanceOf(user1),
      instance.ownerOf(tokenId),
    ]);

    assert(
      new BigNumber(meAsAdminPreBalance)
        .minus(new BigNumber(meAsAdminBalance))
        .isEqualTo(new BigNumber(user1Balance)),
      "not correct amount"
    );
    assert(owner === user1, "This is not expected owner");

    truffleAssert.eventEmitted(receipt, "Transfer", (obj) => {
      return (
        obj.from === meAsAdmin &&
        obj.to === user1 &&
        new BigNumber(obj.tokenId).isEqualTo(new BigNumber(tokenId))
      );
    });
  });

  it("test: safeTransferFrom()", async () => {
    const tokenId = 1;
    const meAsAdminPreBalance = await instance.balanceOf.call(meAsAdmin);
    const receipt = await instance.transferFrom(meAsAdmin, user1, tokenId, {
      from: meAsAdmin,
    });

    const [meAsAdminBalance, user1Balance, owner] = await Promise.all([
      instance.balanceOf(meAsAdmin),
      instance.balanceOf(user1),
      instance.ownerOf(tokenId),
    ]);

    assert(
      meAsAdminBalance.toNumber() === 1,
      "This is not the expected supply"
    );
    assert(owner === user1, "This is not the expected owner");

    truffleAssert.eventEmitted(receipt, "Transfer", (obj) => {
      return (
        obj.from === meAsAdmin &&
        obj.to === user1 &&
        new BigNumber(obj.tokenId).isEqualTo(new BigNumber(tokenId))
      );
    });
  });

  it("Test: setApprovalForAll()", async () => {
    const receipt = await instance.setApprovalForAll(meAsAdmin, true, {
      from: user1,
    });

    truffleAssert.eventEmitted(receipt, "ApprovalForAll", (obj) => {
      return (
        obj.owner === user1 &&
        obj.operator === meAsAdmin &&
        obj.approved === true
      );
    });
    const receipt2 = await instance.isApprovedForAll.call(user1, meAsAdmin);
    assert(receipt2 === true, "This is not expected apporved output");
  });
});

contract("Planet", (accounts) => {
  let planetInstance;
  const [meAsAdmin, user1, player2] = [accounts[0], accounts[1], accounts[2]];

  const firstPlanetName = "Marvelstar";
  const firstPlanetLevel = new BigNumber(10);
  const firstPlanetResource = new BigNumber(3);

  before(async () => {
    planetInstance = await Planet.deployed();
  });

  it("test: the first planet has been created: Marvelstar", async () => {
    const tokenId = 0;
    const receipt = await planetInstance.planet(tokenId);
    console.log(receipt);
    assert(
      receipt.name === firstPlanetName,
      "This is not expected planet Name"
    );
    assert(
      new BigNumber(receipt.level).isEqualTo(firstPlanetLevel),
      "This is not expected level of planet."
    );
    assert(
      new BigNumber(receipt.resource).isEqualTo(firstPlanetResource),
      "This is not expected resource of planet."
    );
  });

  it("Test: the right owner", async () => {
    const tokenId = 0;
    const receipt = await planetInstance.idToOwner(tokenId);
    assert(receipt === meAsAdmin);
  });

  it("Test: create new planet", async () => {
    const name = "Rigel";
    const level = 1;
    const resource = 10;
    const planetId = 1;
    const planetReceipt = await planetInstance.createPlanet(
      name,
      level,
      resource,
      { from: user1 }
    );
    const mintedTx = await planetInstance.mint(user1, planetId);

    truffleAssert.eventEmitted(mintedTx, "Transfer", (obj) => {
      return (
        obj.from === mintAddress &&
        obj.to === user1 &&
        new BigNumber(obj.tokenId).isEqualTo(new BigNumber(planetId))
      );
    });
    assert(
      planetReceipt,
      name,
      level,
      resource,
      "This is not the expected information"
    );

    const receipt = await planetInstance.idToOwner(planetId);
    assert(receipt === user1, "This is not expected owner");
  });

  it("test: return array by ID", async () => {
    let receipt = await planetInstance.getplanetId.call();
    // console.log(receipt);
    assert(
      new BigNumber(receipt[0]).isEqualTo(new BigNumber(0)),
      "This is not expected Id: 0"
    );
    assert(
      new BigNumber(receipt[1]).isEqualTo(new BigNumber(1)),
      "This is not expected Id: 1"
    );
  });

  it("Test: get the singlePlanet using ID", async () => {
    const tokendId = 1;
    let receipt = await planetInstance.getSinglePlanet.call(tokendId);

    assert(receipt[0] === "Rigel", "The name does not match");
    assert(
      new BigNumber(receipt[1]).isEqualTo(new BigNumber(1)),
      "This is not expected level"
    );
    assert(
      new BigNumber(receipt[2]).isEqualTo(new BigNumber(10)),
      "This is not expected resource"
    );
  });
});
