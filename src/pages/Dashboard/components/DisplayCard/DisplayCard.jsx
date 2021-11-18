/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint react/jsx-no-target-blank: 0 */
import React, { Component } from 'react';
import IceContainer from '@icedesign/container';
import { Dialog, Grid, Feedback } from '@icedesign/base';
import { Input } from "@alifd/next";
import Img from '@icedesign/img';
import { connect } from 'react-redux';
import { compose } from 'redux';
import './DisplayCard.scss';
import EthCrypto from 'eth-crypto';
import cn from 'classnames';
import * as utils from '../../../../utils/utils'; 
import injectReducer from '../../../../utils/injectReducer';
import { getLatestBlock, getTransactionsNum } from './actions';
import reducer from './reducer';
import { T } from '../../../../utils/lang';
import BigNumber from "bignumber.js";
import herosName from './heroname.json';

const { Row, Col } = Grid;
const block = require('../../../../components/Common/images/block-white.png');
const tx = require('../../../../components/Common/images/tx-white.png');
const key = require('./images/key.png');
const box = require('./images/box.png');
const boxOpening = require('./images/opening1.jpeg');

class BlockTxLayout extends Component {
  static displayName = '';

  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      deadAddr: '0x000000000000000000000000000000000000dEaD',
      publicKey: '',
      hdANFT: props.drizzle.contracts.HDANFT,
      hdBNFT: props.drizzle.contracts.HDBNFT,
      xToken: props.drizzle.contracts.XToken,
      trade: props.drizzle.contracts.Trade,
      mysteryBox: props.drizzle.contracts.MysteryBox,
      usdt: props.drizzle.contracts.Usdt,
      rightNFT: props.drizzle.contracts.RightNFT,
      heroNFT: props.drizzle.contracts.HeroNFT,
      drizzleState: props.drizzle.store.getState(),
      accountName: props.drizzleState.accounts[0] != null ? props.drizzleState.accounts[0] : '0x0000000000000000000000000000000000000000',
      aNFTInfo: {totalSupply: 0, burnedAmount: 0, myAmount: 0, myTokenInfos: []},
      bNFTInfo: {totalSupply: 0, myAmount: 0, myTokenInfos: [], token2HeroId: {}},
      
      rightNFTInfo: {totalSupply: 0, tradeAmount: 0, myAmount: 0, myTokenInfos: [], isRightNFTMinter: false},
      heroNFTInfo: {totalSupply: 0, tradeAmount: 0, myAmount: 0, myTokenInfos: [], token2HeroId: {}},
      
      xTokenInfo: {totalSupply: 0, myPendingAmount: 0, liquidityAmount: 0, myAmount: 0, name: 'xToken', symbol: 'HDX', decimals: 18},
      buyANFTVisible: false,
      approvedUSDT: 0,
      approveTip: '授权USDT',
      approvingTip: '授权中...',
      boxOpeningTip: '盲盒开启中...',
      curStakeId: null,
      swapANFT2HDWalletVisible: false,
      approvedANFT: 0,
      approveANFTTip: '授权aNFT',
      curANFTId: 0,
      boughtANFTNumber: 1,
      curBNFTId: 0,
      boxOpeningVisible: false,
      heroLevel: {},
      issueRightNFTVisible: false
    };
  }
  //发送交易：
  // 1:this.contracts.SimpleStorage.methods.set(this.state.storageAmount).send()
  // 2:stackId = contract.methods["set"].cacheSend(value, {from: drizzleState.accounts[0]});
  //   const txHash = this.props.drizzleState.transactionStack[this.state.stackId];
  //   this.props.drizzleState.transactions[txHash].status
  componentDidMount = () => {
    this.state.publicKey = EthCrypto.publicKeyByPrivateKey('0x7c0ec026d465f83aed3a05874ee0b95c731046303cc9abef32685b3dabe35db3');
    this.updateRightNFTData();
    this.updateHeroNFTData();
    // this.updateXTokenInfo();

    // setInterval(() => {
    //   this.updateXTokenInfo();
    // }, 3000);
  }

  updateRightNFTData = () => {
    const {rightNFT, heroNFT, deadAddr, accountName} = this.state;
    const {rightNFTInfo} = this.state;

    rightNFT.methods.isMinter(accountName).call().then(v => {
      rightNFTInfo.isRightNFTMinter = v;
      this.setState({rightNFTInfo});
    });

    rightNFT.methods.totalSupply().call().then(v => {
      rightNFTInfo.totalSupply = v;
      this.setState({rightNFTInfo});
    });
    rightNFT.methods.balanceOf(deadAddr).call().then(v => {
      rightNFTInfo.burnedAmount = v;
      this.setState({rightNFTInfo});
    });
    rightNFT.methods.balanceOf(accountName).call().then(async (v) => {
      rightNFTInfo.myAmount = v;
      rightNFTInfo.myTokenInfos = [];
      for (var i = 0; i < v; i++) {
        const tokenId = await rightNFT.methods.tokenOfOwnerByIndex(accountName, i).call();
        const tokenURI = await rightNFT.methods.tokenURI(tokenId).call();
        const metaInfo = await rightNFT.methods.getRightInfo(tokenId).call();
        const isApproved = await rightNFT.methods.isApprovedForAll(accountName, heroNFT.address).call();

        const tokenInfo = {tokenId, tokenURI, isApproved, type: metaInfo.rightType, desc: metaInfo.desc, endTime: metaInfo.endTime};
        rightNFTInfo.myTokenInfos.push(tokenInfo);
      }
      this.setState({rightNFTInfo});
    });
  }

  updateHeroNFTData = () => {
    const {heroNFT, mysteryBox, accountName} = this.state;
    const {heroNFTInfo} = this.state;

    heroNFT.methods.totalSupply().call().then(v => {
      heroNFTInfo.totalSupply = v;
      this.setState({heroNFTInfo});
    });
    heroNFT.methods.balanceOf(accountName).call().then(async (v) => {
      heroNFTInfo.myAmount = v;
      heroNFTInfo.myTokenInfos = [];
      for (var i = 0; i < v; i++) {
        const tokenId = await heroNFT.methods.tokenOfOwnerByIndex(accountName, i).call();
        const heroId = await heroNFT.methods.tokenId2HeroIdMap(tokenId).call();
        const tokenURI = await heroNFT.methods.tokenURI(tokenId).call();
        heroNFTInfo.myTokenInfos.push({tokenId, heroId, tokenURI});
        heroNFTInfo.token2HeroId[tokenId] = heroId;
      };
      this.setState({heroNFTInfo});
    });
  }

  updateXTokenInfo = () => {
    const {xToken, accountName} = this.state;
    const {trade, xTokenInfo} = this.state;

    xToken.methods.totalSupply().call().then(v => {
      xTokenInfo.totalSupply = v;
      this.setState({xTokenInfo});
    });
    xToken.methods.name().call().then(v => {
      xTokenInfo.name = v;
      this.setState({xTokenInfo});
    });
    xToken.methods.symbol().call().then(v => {
      xTokenInfo.symbol = v;
      this.setState({xTokenInfo});
    });
    xToken.methods.balanceOf(trade.address).call().then(v => {
      xTokenInfo.liquidityAmount = v;
      this.setState({xTokenInfo});
    });
    trade.methods.pendingXToken().call().then(v => {
      xTokenInfo.myPendingAmount = v;
      this.setState({xTokenInfo});
    });
    return xToken.methods.balanceOf(accountName).call().then(v => {
      xTokenInfo.myAmount = v;
      this.setState({xTokenInfo});
      return v;
    });
  }

  getMyXTokenNumber = () => {
    const {xToken, accountName} = this.state;

    return xToken.methods.balanceOf(accountName).call();
  }

  submitSwapReq = () => {
    const {trade, accountName, curANFTId} = this.state;
    try {
      if (utils.isEmptyObj(this.state.userName)) {
        Feedback.toast.error(T('请输入收货人'));
        return;
      }
      if (utils.isEmptyObj(this.state.deliverAddress)) {
        Feedback.toast.error(T('请输入收货地址'));
        return;
      }
      if (utils.isEmptyObj(this.state.contactInfo)) {
        Feedback.toast.error(T('请输入手机号'));
        return;
      }
      const deliverInfo = this.state.userName + '; ' + this.state.deliverAddress + '; ' + this.state.contactInfo;
      EthCrypto.encryptWithPublicKey(this.state.publicKey, deliverInfo).then(encryptedInfo => {
        console.log('encryptedInfo', encryptedInfo);  
        this.state.curStakeId = trade.methods["burnANFT4HD"].cacheSend(JSON.stringify(encryptedInfo), curANFTId, {from: accountName});
        this.syncTxStatus(() => {
          this.updateANFTData();
          this.updateBNFTData();
        }, () => {})
      }).catch(error => {
        Feedback.toast.error(error.message || error);
      });
      this.setState({swapANFT2HDWalletVisible: false});
    } catch (error) {
      Feedback.toast.error(error.message || error);
    }
  };


  openBuyANFTDialog = () => {
    const {trade, usdt, accountName} = this.state;
    usdt.methods.allowance(accountName, trade.address).call().then(v => {
      this.setState({approvedUSDT: v, buyANFTVisible: true});
    });
  }

  openIssueRightNFTDialog = () => {
    this.setState({issueRightNFTVisible: true});
  }

  issueRightNFT = () => {
    const {rightNFT, accountName} = this.state;
    const endTime = Math.floor(new Date().getTime() / 1000) + 30 * 24 * 3600;
    this.state.curStakeId = rightNFT.methods["mint"].cacheSend(this.state.reward2Account,
                                                               parseInt(this.state.rewardType),
                                                               this.state.rewardDesc,
                                                               "0x" + new BigNumber(endTime).toString(16),
                                                               {from: accountName});
    this.syncTxStatus(() => {
      this.updateRightNFTData();
      this.setState({ issueRightNFTVisible: false });
    }, () => {});
  }

  approveHeroNFT = (rightNFTId) => {
    const {rightNFT, heroNFT, accountName} = this.state;
    this.state.curRightNFTId = rightNFTId;
    this.state.curStakeId = rightNFT.methods["setApprovalForAll"].cacheSend(heroNFT.address,
                                                                            true,
                                                                            {from: accountName});
    this.syncTxStatus(() => {
      this.updateRightNFTData();
    }, () => {});
  }

  generateHeroNFT = (rightNFTId) => {
    const {rightNFT, heroNFT, accountName} = this.state;
    this.state.curRightNFTId = rightNFTId;
    this.state.curStakeId = heroNFT.methods["mint"].cacheSend(rightNFTId, {from: accountName});
    this.setState({boxOpeningVisible: true});
    this.syncTxStatus(() => {
      this.setState({boxOpeningVisible: false});
      this.updateRightNFTData();
      this.updateHeroNFTData();
    }, () => {
      this.setState({boxOpeningVisible: false});
    });
  }

  handleANFTNumberChange = (v) => {
    this.state.boughtANFTNumber = v;
  }

  handleUserAccountChange = (v) => {
    this.state.reward2Account = v;
  }

  handleRewardDescChange = (v) => {
    this.state.rewardDesc = v;
  }

  handleRewardTypeChange = (v) => {
    this.state.rewardType = v;
  }

  handleAddressChange = (v) => {
    this.state.deliverAddress = v;
  }

  handleContactChange = (v) => {
    this.state.contactInfo = v;
  }

  onBuyANFTOK = () => {
    this.setState({buyANFTVisible: false});
  }

  onSwapANFTOK = () => {
    this.setState({swapANFT2HDWalletVisible: false});
  }

  approveUSDT = () => {
    const {trade, usdt, accountName, approveTip, approvingTip} = this.state;
    if (approveTip == approvingTip) return;

    const curStakeId = usdt.methods["approve"].cacheSend(trade.address, 
                                                        '0x' + new BigNumber(1).shiftedBy(26).toString(16), 
                                                        {from: accountName});
    this.setState({approveTip: approvingTip, curStakeId});
    this.syncTxStatus(() => {
      usdt.methods.allowance(accountName, trade.address).call().then(v => {
        this.setState({approvedUSDT: v, approveTip});
      });
    }, () => { 
      this.setState({approveTip}); 
    });
  }

  approveANFT = () => {
    const {trade, hdANFT, accountName, approveANFTTip, approvingTip, curANFTId} = this.state;
    if (approveANFTTip == approvingTip) return;

    const curStakeId = hdANFT.methods["approve"].cacheSend(trade.address, 
                                                           curANFTId, 
                                                           {from: accountName});
    this.setState({approveANFTTip: approvingTip, curStakeId});
    this.syncTxStatus(() => {
      this.setState({approvedANFT: true, approveANFTTip});
    }, () => { 
      this.setState({approveANFTTip}); 
    })
  }

  openBox = (bNFTId) => {
    const { accountName, hdBNFT, mysteryBox } = this.state;
    hdBNFT.methods.nft2HeroIdMap(bNFTId).call().then(heroId => {
      if (heroId > 0) {
        Feedback.toast.error('宝盒已开启');
      } else {
        const curStakeId = mysteryBox.methods["openBox"].cacheSend(bNFTId, 
                                                                  {from: accountName});
        
        this.setState({curStakeId, boxOpeningVisible: true});
        this.syncTxStatus(() => {
        hdBNFT.methods.nft2HeroIdMap(bNFTId).call().then(v => {
          this.updateBNFTData();
          this.setState({boxOpeningVisible: false});
        });
        }, () => { 
          Feedback.toast.error('宝盒开启失败');
          this.setState({boxOpeningVisible: false});
        })
      }
    });
  }

  swapANFT2HDWallet = () => {
    this.submitSwapReq();
  }

  syncTxStatus = (successCallback, failCallback) => {

    const intervalId = setInterval(() => { 
      // get the transaction states from the drizzle state
      const { transactions, transactionStack } = this.props.drizzleState;
      // get the transaction hash using our saved `stackId`
      const txHash = transactionStack[this.state.curStakeId];
      console.log('txHash', txHash, this.state.curStakeId, transactionStack);
      // if transaction hash does not exist, don't display anything
      if (!txHash) return;
      console.log('transaction', transactions[txHash]);
      if (transactions[txHash]) {
        const status = transactions[txHash].status;
        if (status == 'pending') return;

        if (status == 'success') {
          successCallback();
        } else {
          failCallback();
        }
        clearInterval(intervalId);
      }
      return;
    }, 3000);
  };

  displayReadableAmount = (value) => {
    let renderValue = new BigNumber(value).shiftedBy(-18);
    const fmt = {
        decimalSeparator: '.',
        groupSeparator: ',',
        groupSize: 3,
        secondaryGroupSize: 0,
        fractionGroupSeparator: ' ',
        fractionGroupSize: 0
      }
      
    BigNumber.config({ FORMAT: fmt });
  
    return renderValue.toFormat(6);
  }

  minusAmount = (amount1, amount2) => {
    return new BigNumber(amount1).minus(new BigNumber(amount2)).shiftedBy(-18).toNumber();
  }

  render() {
    return (
      <div style={styles.container}>
        <div className='containMain'>
          <div className='borderContent'>
            <div className='realContent'>
              <Row className='content'>
                <Col span='4' style={{...styles.item, textAlign:'left'}}>
                  <Row align='center' style={styles.titleRow}>
                    <img src={block} width='24'/>
                    <div style={styles.title}>
                      {T('RightNFT')}
                    </div>
                  </Row>
                </Col>
                <Col span='4' style={styles.item}>
                  <Row align='center' style={styles.titleRow}>
                    <img src={block} width='24'/>
                    <div style={styles.title}>
                      {T('HeroNFT')}
                    </div>
                  </Row>
                </Col>
                <Col span='4' style={styles.item}>
                  <Row align='center' style={styles.titleRow}>
                    <img src={tx} width='24'/>
                    <div style={styles.title}>
                      {T('Governance')}
                    </div>
                  </Row>
                </Col>
              </Row>
              <Row style={{width: '100%',  display:'flex', justifyContent:'space-between'}}>
                <Col span="4" style={{...styles.item, textAlign:'left'}}>
                  <div style={styles.countTitle}>
                  {T('总产出量')}
                  </div>
                  <div className="count" style={styles.count}>
                    {this.state.rightNFTInfo.totalSupply}
                    
                  </div>
                  
                  <div style={styles.smallCountTitle}>
                  {T('总交易量')}
                  </div>
                  <div className="count" style={styles.smallCount}>
                    {this.state.rightNFTInfo.tradeAmount}
                  </div>

                  <div style={styles.countTitle}>
                  {T('我拥有的量')}
                  </div>
                  <div className="count" style={styles.count}>
                    {/* {parseInt(this.state.robotNFT.methods["tokenCount"].cacheCall(), 16)} */}
                    {this.state.rightNFTInfo.myAmount}
                  </div>
                </Col>
                <Col span="4" style={styles.item}>
                  
                  <div style={styles.countTitle}>
                  {T('总产出量')}
                  </div>
                  <div className="count" style={styles.count}>
                    {this.state.heroNFTInfo.totalSupply}
                  </div>
                  
                  <div style={styles.smallCountTitle}>
                  {T('总交易量')}
                  </div>
                  <div className="count" style={styles.smallCount}>
                    {this.state.heroNFTInfo.tradeAmount}
                  </div>
                  
                  <div style={styles.smallCountTitle}>
                  {T('我拥有的量')}
                  </div>

                  <div className="count" style={styles.smallCount}>
                   {this.state.heroNFTInfo.myAmount}
                  </div>
                </Col>
                <Col span="4" style={styles.item}>
                  <div style={styles.countTitle}>
                  {T('提案总数')}
                  </div>
                  <div className="count" style={styles.count}>
                    {0}
                  </div>
                  
                  {/* <div style={styles.smallCountTitle}>
                  {T('当前流通量')}
                  </div>

                  <div className="count" style={styles.smallCount}>
                    {this.displayReadableAmount(this.minusAmount(this.state.xTokenInfo.totalSupply, this.state.xTokenInfo.liquidityAmount))} {this.state.xTokenInfo.symbol}
                  </div> */}

                  <div style={styles.countTitle}>
                  {T('已结案数')}
                  </div>
                  <div className="count" style={styles.count}>
                   {0}
                  </div>
                  
                  <div style={styles.smallCountTitle}>
                  {T('未结案数')}
                  </div>

                  <div className="count" style={styles.smallCount}>
                    {0}
                  </div>

                </Col>
              </Row>
            </div>
          </div>
        </div>
        <div className='block-container'>
            <div className='nft-title'> 
              <div>
                <img src={block} width='24'/>
                <b style={{fontSize: 20}}>{T('您的RightNFT')}</b>
              </div>
              {
                this.state.rightNFTInfo.isRightNFTMinter ? 
                  <div class="common-btn" onClick={() => this.openIssueRightNFTDialog()}>
                    授予奖章
                  </div>
                  :
                  ""
              }
              
            </div>
            <div className='nft-list'>
              <ul>
              {
                this.state.rightNFTInfo.myTokenInfos.map(rightNFTInfo => {
                  const dateTime = new Date(parseInt(rightNFTInfo.endTime) * 1000).toLocaleString();
                  return (
                      <li>
                        <div class={rightNFTInfo.type == 0 ? "gold-level" : (rightNFTInfo.type == 1 ? "silver-level" : "copper-level")}>
                          {rightNFTInfo.type == 0 ? "金质奖章" : (rightNFTInfo.type == 1 ? "银质奖章" : "铜质奖章")}
                        </div>
                        <img src={rightNFTInfo.tokenURI} width='100'/>
                        <h2>#{rightNFTInfo.tokenId}</h2>
                        <div class="date-div">生成HeroNFT截止时间: {dateTime}</div>
                        {
                          rightNFTInfo.isApproved ? 
                            <div class="process-div" onClick={() => this.generateHeroNFT(rightNFTInfo.tokenId)}>
                              生成HeroNFT
                            </div>
                            :
                            <div class="process-div" onClick={() => this.approveHeroNFT(rightNFTInfo.tokenId)}>
                              授权生成HeroNFT
                            </div>
                        }
                        
                      </li>)
                })
              }
              </ul>
            </div>
        </div>

        <div className='block-container'>
            <div className='nft-title'> 
              <div>
                <img src={block} width='24'/>
                <b style={{fontSize: 20}}>{T('您的HeroNFT')}</b>
              </div>
            </div>
            <div className='nft-list'>
              <ul>
              {
                this.state.heroNFTInfo.myTokenInfos.map((heroNftInfo) => {
                  const heroNftId = heroNftInfo.tokenId;
                  const heroId = heroNftInfo.heroId;
                  //const roleLevel = 1;//await this.state.mysteryBox.methods.heroId2LevelMap(heroId).call();
                  return ( (heroId != null && heroId > 0) ?
                      <li>
                        <img style={{marginTop: -10}} src={heroNftInfo.tokenURI} width='250'/>
                        
                        <h2 style={{marginTop: -10}}>#{heroNftId}</h2>    
                        <h2 style={{marginTop: -10}}>{herosName[heroId]}</h2>  
                        <h2 style={{marginTop: -10}}>排名:{heroId}</h2>                   
                      </li>
                        :
                      <li>
                        <img src={box} width='180' title='点击开宝盒' onClick={() => this.openBox(heroNftId)}/>
                        <h2 style={{marginTop: -20}}>#{heroNftId}</h2>                      
                      </li>
                      )
                })
              }
              </ul>
            </div>
        </div>
        <Dialog
            visible={this.state.buyANFTVisible}
            title={<div className='dialogTitle'><img src={key} width={80}/> <span className='title-text'>购买aNFT</span></div>}
            //footerActions="ok"
            footerAlign="center"
            closeable="true"
            onOk={this.onBuyANFTOK.bind(this)}
            onCancel={() => this.setState({ buyANFTVisible: false })}
            onClose={() => this.setState({ buyANFTVisible: false })}
            className='dialogs'
            footer={<div className='dialog-footer'>
                      {
                        (this.state.approvedUSDT == 0) ? <div class="dialog-btn" onClick={() => this.approveUSDT()}>
                                                        {this.state.approveTip}
                                                      </div> 
                                                        : 
                                                      <div class="dialog-btn" onClick={() => this.buyANFT()}>
                                                        提交
                                                      </div>
                      }
                    </div>}
          >
            <Input hasClear
              onChange={this.handleANFTNumberChange.bind(this)}
              className='node-input'
              addonBefore="购买数量"
              size="medium"
              defaultValue={1}
              maxLength={150}
              showLimitHint
            />
          </Dialog>
        <Dialog
          visible={this.state.issueRightNFTVisible}
          title={<div className='dialogTitle'><img src={key} width={80}/> <span className='title-text'>授予荣誉奖章</span></div>}
          //footerActions="ok"
          footerAlign="center"
          closeable="true"
          onOk={this.issueRightNFT.bind(this)}
          onCancel={() => this.setState({ issueRightNFTVisible: false })}
          onClose={() => this.setState({ issueRightNFTVisible: false })}
          className='dialogs'
        >
          <Input hasClear
            onChange={this.handleUserAccountChange.bind(this)}
            className='node-input'
            addonBefore="被授予人地址:"
            size="medium"
            maxLength={42}
            showLimitHint
          />
          <Input hasClear
            onChange={this.handleRewardTypeChange.bind(this)}
            className='node-input'
            addonBefore="奖章类型:"
            placeholder="0:金牌奖章，1:银牌奖章，2:铜牌奖章"
            size="medium"
            maxLength={10}
            showLimitHint
          />
          <Input hasClear
            onChange={this.handleRewardDescChange.bind(this)}
            className='node-input'
            addonBefore="授予原因:"
            placeholder="如提交多少PR，做过几次分享等等"
            size="medium"
            maxLength={10}
            showLimitHint
          />
        </Dialog>
        <div className={this.state.boxOpeningVisible ? 'imgDisplayDiv' : 'imgNoneDiv'}>
          <Img
            enableAliCDNSuffix={true}
            src={boxOpening}
            type='contain'
          />
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    width: '100%',
    padding: '30px 10%',
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: '5px',
  },
  containMain:{
    backgroundColor: '#080a20', 
    width: '100%', 
    borderRadius: '5px',
    padding: '0 70px', 
    border: '2px solid rgba(35, 201, 167, 0.10196078431372549)', 
  },
  item: {
    height: '100%', 
    width: '100%', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  titleRow: {
    margin: '28px 0 24px 0',
  },
  title: {
    color: '#fff',
    fontSize: '16px',
    marginLeft: '8px',
  },
  nftTitle: {
    backgroundColor: '#fff',
    fontSize: '16px',
    marginLeft: '8px',
  },
  countTitle: {
    fontSize: '14px', 
    marginTop:'8px',
    color: '#fff'
  },
  count: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '38px',
  },
  smallCountTitle: {
    fontSize: '14px', 
    color: '#fff'
  },
  smallCount: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '28px',
  },
  desc: {
    fontSize: '12px',
  },
  down: {
    width: '6px',
    height: '9px',
  },
  up: {
    width: '6px',
    height: '9px',
  },
  extraIcon: {
    marginLeft: '5px',
    position: 'relative',
    top: '1px',
  },
  btn: {
    marginLeft: '10px',
    borderRadius: '5px',
    background: '#91FFE9',
    color: '5E768B'
  }
};


const mapDispatchToProps = {
  getLatestBlock,
  getTransactionsNum,
};

// 参数state就是redux提供的全局store，而loginResult会成为本组件的this.props的其中一个成员
const mapStateToProps = (state) => {
  return { lastBlockInfo: state.lastBlockInfo };
};

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

const withReducer = injectReducer({ key: 'blockTxLayout', reducer });

export default compose(
  withReducer,
  withConnect
)(BlockTxLayout);
