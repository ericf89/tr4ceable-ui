import React from 'react';
import styled from 'styled-components';
import { Clear } from './dashboard';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router-dom';
import { Detail, DivFull } from './package';

export default class User extends React.Component {
  render() {
    const {_id, email, phone, name, packages: { length: packageCount } = [] } = this.props;
    return (
      <DivFull>
        <Detail label="ID" data={<Link to={`dashboard/${_id}`}>{_id}</Link>} />
        <Detail label="Name" data={name} />
        <Detail label="Email" data={email} />
        <Detail label="Phone Number" data={phone} name />
        <Detail label="Package Count" data={packageCount} />
        <Clear/>
        <FlatButton style={{color: 'red'}} onClick={this.props.delete(_id)}>Delete</FlatButton>
      </DivFull>
    );
  }
}
