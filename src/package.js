import React from 'react';
import styled from 'styled-components';
import { Clear } from './dashboard';
import moment from 'moment';
import FlatButton from 'material-ui/FlatButton';

const DivFull = styled.div`
  width: 90%;
  border: 1px solid #e6e6e6;
  padding: 25px;
  margin: 0 auto 5px;
  border-radius: 5px;
  font-size: 13px;
`;

const Label = styled.div`
  font-size: 12px;
  color: #8e8e8e;
`;
const Data = styled.div`
  font-size: 13px;
`
export const Detail = styled(props =>
  <div className={props.className}>
    <Label>{props.label}</Label>
    <Data>{props.data}</Data>
  </div>)`
  float: left;
  padding-right: 1em;
  padding-bottom: 2em;
`;



export default class Package extends React.Component {
  static defaultProps = {
    details: []
  }
  render() {
    const {_id, trackingNumber, summary, details, updatedAt} = this.props;
    return (
      <DivFull>
        <Detail label="ID" data={_id} />
        <Detail label="Tracking Number" data={trackingNumber} />
        <Detail label="Last Updated" data={moment(updatedAt).fromNow()} />
        <Clear/>
        <Detail label="Summary" data={summary} />
        <Clear/>
        <Label>Shipping Details</Label>
        <ul>
          {this.props.details.map((d, idx) => <li key={idx}>{d}</li>)}
        </ul>
        <FlatButton style={{color: 'red'}} onClick={this.props.delete(_id)}>Delete</FlatButton>
      </DivFull>
    );
  }
}
