//SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.7.0;
import "./ERC721.sol";


contract Planet is ERC721 {
    address meAsAdmin;
    uint256 planetId;

    struct EachPlanet {
        uint256 id;
        string name;
        uint256 level;
        uint256 resource;
    }

    uint256[] ID;

    mapping(uint256 => EachPlanet) public planet;
    mapping(uint256 => address) public idToOwner;

    constructor() public {
        meAsAdmin = msg.sender;
        //start to create planet
        EachPlanet memory plnt = EachPlanet(planetId, "Marvelstar", 10, 3);
        planet[planetId] = plnt;
        ID.push(planetId);
        //create tokens
        mint(meAsAdmin, planetId);
        idToOwner[planetId] = meAsAdmin;
        planetId++;
    }

    //create a planet
    function createPlanet(
        string calldata _name,
        uint256 _level,
        uint256 _resource
    ) external {
        planet[planetId] = EachPlanet(planetId, _name, _level, _resource);
        ID.push(planetId);
        mint(msg.sender, planetId);
        idToOwner[planetId] = msg.sender;
        planetId++;
    }

    function sendPlanet(uint256 _tokenId, address _to) external {
        address previousOwner = idToOwner[_tokenId];
        require(msg.sender == previousOwner, "Not authorized to send");
        _safeTransfer(previousOwner, _to, _tokenId, "");
    }

    function getplanetId() public view returns (uint256[] memory) {
        return ID;
    }

    function getSinglePlanet(uint256 _planetId)
        public
        view
        returns (
            string memory,
            uint256,
            uint256
        )
    {
        return (
            planet[_planetId].name,
            planet[_planetId].level,
            planet[_planetId].resource
        );
    }
}
