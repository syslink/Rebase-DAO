import Web3 from "web3";
import RightNFT from "./contractABI/RightNFT.json";
import HeroNFT from "./contractABI/HeroNFT.json";

RightNFT.networks = {}
HeroNFT.networks = {}

RightNFT.networks['137'] = {address: '0x8D95F87B8B4dEaB1AB43E48dA686bd058d0e33B6'};
RightNFT.contractName = 'RightNFT';

HeroNFT.networks['137'] = {address: '0x9Ca8FfE188860fDA0FacFDFb78473B8a118793bD'};
HeroNFT.contractName = 'HeroNFT';

const options = {
  web3: {
    block: true,
    customProvider: new Web3(window.ethereum),
  },
  contracts: [
    RightNFT, HeroNFT //HDANFT, HDBNFT, XToken, Trade, MysteryBox, Usdt, 
  ],
  events: {
    
  },
  polls: {
    blocks: 3000,
  },
  //syncAlways: true,
};

export default options;
