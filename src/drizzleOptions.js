import Web3 from "web3";
import HDANFT from "./contracts/HDANFT.json";
import HDBNFT from "./contracts/HDBNFT.json";
import XToken from "./contracts/XToken.json";
import Trade from "./contracts/Trade.json";
import MysteryBox from "./contracts/MysteryBox.json";
import Usdt from "./contracts/ERC20.json";

import RightNFT from "./contracts/RightNFT.json";
import HeroNFT from "./contracts/HeroNFT.json";

HDANFT.networks = {}
HDBNFT.networks = {}
XToken.networks = {}
Trade.networks = {}
MysteryBox.networks = {}
Usdt.networks = {}
RightNFT.networks = {}
HeroNFT.networks = {}

// HDANFT.networks['128'] = {address: '0xccFdF798Cf15A08aB2404dA32406E08Ac1BdCCfd'};
// HDANFT.contractName = 'HDANFT';

// HDBNFT.networks['128'] = {address: '0xCfF02924E44303756758148c515e024f3a690ea2'};
// HDBNFT.contractName = 'HDBNFT';

// XToken.networks['128'] = {address: '0xD03d4C1cb22be63689BB3Fb89a9d9296dB36E06c'};
// XToken.contractName = 'XToken';

// Trade.networks['128'] = {address: '0xA3b584668f5d787C1FE6c7A7AC05b66931bA8e20'};
// Trade.contractName = 'Trade';

// MysteryBox.networks['128'] = {address: '0x474515b2e8627cb0f8EE904Eb05f20b74A34C763'};
// MysteryBox.contractName = 'MysteryBox';

// Usdt.networks['128'] = {address: '0xa71EdC38d189767582C38A3145b5873052c3e47a'};
// Usdt.contractName = 'Usdt';

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
