// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./Minter.sol";

enum RightType { Gold, Silver, Copper }

struct RightInfo {
    RightType rightType;
    string desc;     
    uint256 endTime;   // the end time of right exercise
}
    
contract RightNFT is Minter, ERC721Enumerable {
    uint256 public tokenId = 0;
    string public baseURI;
    
    mapping(uint256 => RightInfo) public id2RightInfoMap;
    
    event Mint(address indexed _to, uint256 _tokenId);
    
    constructor(string memory _baseURI) ERC721("Rebase DAO Right NFT", "RebaseRightNFT")  public {
       setBaseURI(_baseURI);
    }
    
    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }
    
    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        
        RightInfo memory rightInfo = id2RightInfoMap[_tokenId];
        string memory tokenUri = rightInfo.rightType == RightType.Gold ? "gold.png" : (rightInfo.rightType == RightType.Silver ? "silver.png" : "copper.png");
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenUri)) : "";
    }
    
    function mint(address _to, RightType _rightType, string memory _desc, uint256 _endTime) onlyMinter public returns (uint256) {
        require(_to != address(0), "RebaseRightNFT: _to is zero address.");
        require(_endTime > block.timestamp, "RebaseRightNFT: _endTime should be bigger than now.");

        tokenId++;
        
        _safeMint(_to, tokenId);
        
        id2RightInfoMap[tokenId] = RightInfo(_rightType, _desc, _endTime);
        
        emit Mint(msg.sender, tokenId);
        return tokenId;
    }

    function setDesc(uint256 _nftId, string memory _desc) public onlyMinter {
        require( _exists(_nftId), "RebaseRightNFT: nft is not exist.");
        id2RightInfoMap[_nftId].desc = _desc;
    }
    
    function getRightInfo(uint256 _nftId) view public returns(RightInfo memory) {
        return id2RightInfoMap[_nftId];
    }
}