import React, { PureComponent } from 'react';
import { Grid } from '@alifd/next';
import { Link } from 'react-router-dom';
import * as oexchain from 'oex-web3';
import { T } from '../../utils/lang';

const {Row} = Grid;
const logo = require('./images/logo.png');
export default class Logo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      networkType: T('私网'),
    };
  }
  componentDidMount = () => {
    
  }
  render() {
    return (
      <div className="logo">
        <Row align='center'>
          <img style={{width: '50px', height: '50px', marginRight: '21px'}}  src={logo}/>
          <Link to="/" className="logo-text" style={{color: '#eec710', fontSize: "16px"}}>
          Dapp-Learning DAO
          </Link>
        </Row>
      </div>
    );
  }
}
