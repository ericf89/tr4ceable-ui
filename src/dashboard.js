import React from 'react';
import localforage from 'localforage';
import fetch from 'isomorphic-fetch';
import jwtDecode from 'jwt-decode';
import Loading from 'material-ui/CircularProgress';
import styled from 'styled-components';
import FlatButton from 'material-ui/FlatButton/FlatButton';
import TextField from 'material-ui/TextField';
import Snackbar from 'material-ui/Snackbar/Snackbar';
import config from './config';
import Package, { Detail } from './package';
import { Link } from 'react-router-dom';

export const Clear = styled.div`
  content: '';
  clear: both;
  display: block;
`;

export default class Dashboard extends React.Component {
  state = {
    loading: true,
    open: false,
    message: '',
    user: {},
    trackingNumber: '',
    viewer: {}
  }
  async componentDidMount() {
    const token = await localforage.getItem('token');
    if(!token){
      this.props.history.replace('/');
    } else {
      const viewer =jwtDecode(token);
      this.setState({viewer});
      const res = await fetch(`${config.apiUrl}users/${this.props.match.params.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.status === 401) {
        if(this.props.match.params.userId === viewer._id) {
          this.props.history.push('/');
        } else {
          this.props.history.push(`/dashboard/${viewer._id}`)
        }
      }
      const user = await res.json();
      this.setState({user, packages: user.packages, loading: false});
    }
  }

  addNewPackage = async () => {
    const { userId } = this.props.match.params;
    const token = await localforage.getItem('token');
    const { trackingNumber } = this.state;

    const res = await fetch(`${config.apiUrl}users/${userId}/packages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({trackingNumber})
    });
    if(res.status !== 201) {
      this.setState({open: true, message: 'Something went wrong... try again.'})
    } else {
      const body = await res.json()
      const {packages, ...user} = body;
      this.setState({
        packages,
        user,
        trackingNumber: '',
        message: 'Added!',
        open: true
      });
    }
  }
  deletePackage = (packageId) => async () => {
    const { userId } = this.props.match.params;
    const token = await localforage.getItem('token');

    const res = await fetch(`${config.apiUrl}users/${userId}/packages/${packageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if(res.status !== 200) {
      this.setState({open: true, message: 'Something went wrong... try again.'})
    } else {
      const body = await res.json()
      const {packages, ...user} = body;
      this.setState({
        packages,
        user,
        trackingNumber: '',
        message: 'Deleted!',
        open: true
      });
    }
  }
  render(){
    const { loading, user, trackingNumber, viewer: { admin } } = this.state;
    return (
      <div>
        <h2 className="App" onClick={() => this.setState({trackingNumber: '9405511699000600435229'})}>
          Tr4ceable!
        </h2>
        <div style={{padding: 20 }}>
          <h3>User Details</h3>
          <Detail label="Email" data={user.email || ''}/>
          <Detail label="Phone" data={user.phone || ''}/>
          { admin ? <Link style={{float: 'right'}} to="/dashboard">Admin View</Link> : null}
        </div>
        <Clear/>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={4000}
          onRequestClose={() => this.setState({open: false})}
        />
        <div style={{padding: 20}}>
          <h3>Packages</h3>
            { loading
              ? ( <Loading /> )
              : (
                <div>
                  <TextField floatingLabelText="Tracking Number" value={trackingNumber} onChange={({target: { value: trackingNumber }}) => this.setState({trackingNumber})}/>
                  <FlatButton onClick={this.addNewPackage}>New</FlatButton>
                  {this.state.packages.map(p => <Package key={p._id} delete={this.deletePackage} {...p} />)}
                </div>
              )
            }
        </div>
      </div>
    );
  }
}
