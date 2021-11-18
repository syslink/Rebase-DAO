// SPDX-License-Identifier: MIT
pragma solidity 0.8.10;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RightNFT.sol";
    
interface AggregatorV3Interface {
  function decimals() external view returns (uint8);
  function description() external view returns (string memory);
  function version() external view returns (uint256);
  // getRoundData and latestRoundData should both raise "No data present"
  // if they do not have data to report, instead of returning unset values
  // which could be misinterpreted as actual reported values.
  function getRoundData(uint80 _roundId)
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
}
    
contract HeroNFT is Ownable, ERC721 {
    using Strings for uint256;
    
    uint256 public tokenId = 0;
    RightNFT public rightNFT;
    string public baseURI;
    
    mapping(uint256 => uint256) public tokenId2HeroIdMap;
    address[] public chainlinkAggregatorList = [0x443C5116CdF663Eb387e72C688D276e702135C87,   // 1inch
                                                0x72484B12719E23115761D5DA1646945632979bB6,   // aave
                                                0xc907E116054Ad103354f2D350FD2514433D57F6f,   // btc
                                                0x1CF68C76803c9A415bE301f50E82e44c64B7F1D4,   // crv
                                                0xF9680D99D6C9589e2a93a78A04A279e509205945,   // eth
                                                0xd9FFdb71EbE7496cC440152d43986Aae0AB76665,   // link
                                                0x49B0c695039243BBfEb8EcD054EB70061fd54aa0,   // sushi
                                                0xdf0Fb4e4F928d2dCB76f438575fDD8682386e13C,   // uni
                                                0xAB594600376Ec9fD91F8e885dADF0CE036862dE0,   // matic
                                                0xa058689f4bCa95208bba3F265674AE95dED75B6D]; // quick
    
    address public constant deadAddr = 0x000000000000000000000000000000000000dEaD;
    event Mint(address indexed _to, uint256 _tokenId, uint256 _heroId);
    
    constructor(address _rightNFT, string memory _baseURI) ERC721("Rebase Hero NFT", "RebaseHeroNFT")  public {
        rightNFT = RightNFT(_rightNFT);
        setBaseURI(_baseURI);
    }
    
    function setBaseURI(string memory _baseURI) public onlyOwner {
        baseURI = _baseURI;
    }
    
    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId2HeroIdMap[_tokenId].toString(), ".png")) : "";
    }
    
    function mint(uint256 _rightNFTId) public returns (uint256) {
        rightNFT.transferFrom(msg.sender, deadAddr, _rightNFTId);
        RightInfo memory rightInfo = rightNFT.getRightInfo(_rightNFTId);
        require(rightInfo.endTime >= block.timestamp, "HeroNFT: timeout of RightNFT");
        
        uint256 startId;
        uint256 endId;
        if (rightInfo.rightType == RightType.Gold) {
            startId = 1;
            endId = 10;
        } else if (rightInfo.rightType == RightType.Silver) {
            startId = 11;
            endId = 40;
        } else if (rightInfo.rightType == RightType.Copper) {
            startId = 41;
            endId = 108;
        }
        
        tokenId++;
        
        _safeMint(msg.sender, tokenId);
        uint256 randomPrice = getRandomPriceOnChainlink();
        uint256 heroId = startId + randomPrice % (endId - startId + 1);
        tokenId2HeroIdMap[tokenId] = heroId;
        
        emit Mint(msg.sender, tokenId, heroId);
        return tokenId;
    }
    
    function getRandomPriceOnChainlink() public view returns(uint256) {
        uint256 randomIndex = getRandomIndex(chainlinkAggregatorList.length);
        AggregatorV3Interface priceFeed = AggregatorV3Interface(chainlinkAggregatorList[randomIndex]);
        (, int price,,,) = priceFeed.latestRoundData();
        return uint256(price);
    }
    
    function getRandomIndex(uint256 _maxIndex) internal view returns(uint256) {
        uint256 rand = random(string(abi.encodePacked(tokenId, block.timestamp, msg.sender)));
        return rand % _maxIndex;
    }
    
    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }
}