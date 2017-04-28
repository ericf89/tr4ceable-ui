import React from 'react';
import localforage from 'localforage';
import jwtDecode from 'jwt-decode';
import TextField from 'material-ui/TextField';
import Loading from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import isEqual from 'lodash.isequal';
import partition from 'lodash.partition';
import compose from 'compose-function';
import config from './config';
import User from './user';


export default class AdminDash extends React.Component {
  state = {
    loading: false,
    open: false,
    json: '[]',
    validJson: true,
    message: '',
    viewer: {},
  }
  async componentDidMount() {
    const token = await localforage.getItem('token');
    if(!token){
      this.props.history.replace('/');
    } else {
      const viewer = jwtDecode(token);
      if(!viewer.admin) return this.props.history.replace(`/dashboard/${viewer._id}`);
      this.setState({viewer});
    }
  }
  count = 0;
  hidden = () => {
    this.count += 1;
    if(this.count % 5 === 0) {
      this.setState({validJson: true, json: JSON.stringify([
        {
          "name": "KevinNuut",
          "email": "kevin+awesome@aceable.com",
          "phone": "(555) 234-5234",
          "trackingNumber": "9405511699000600435229"
        },
        {
          "name": "Powell, Mark",
          "email": "mark+worldstar@aceable.com",
          "phone": "555.235.0452",
          "trackingNumber": "9405511ERR699000600434482"
        },
        {
          "name": "Christine Pristine",
          "email": "data-so-clean@aceable.com",
          "phone": "(555) 234-0417",
          "trackingNumber": "9405511699000600435229"
        },
        {
          "name": "Ira Coverable",
          "email": "data@ace..........",
          "phone": "(5.............7",
          "trackingNumber": "94055116990...435229"
        }
      ], null, 2)})
    }
  }

  importUsers = async () => {
    await new Promise(res => this.setState({loading: true}, res));
    const token = await localforage.getItem('token');
    this.users = JSON.parse(this.state.json)

    // Data Sanitize Helpers (Most copied from various stack overflow posts.)
    const commaSwap = name => (name.match(/,/g) || []).length === 1 ? name.split(',').reverse().map(s => s.trim()).join(' ') : name;
    const splitCaps = name => name.includes(' ') ? name : name.split(/(?=[A-Z])/).join(' ');
    const removeNonAlpha = name => name.replace(/^a-zA-Z\ /gi, '');

    const removeNonNumeric = phone => phone.replace(/\D/g, '')
    const phoneFormat = phone => {
      const m = phone.match(/^(\d{3})(\d{3})(\d{4})$/);
      return m ? '(' + m[1] + ') ' + m[2] + '-' + m[3] : phone;
    }
    const cleanedUp = this.users.map(u => ({
      name: compose(removeNonAlpha, splitCaps, commaSwap)(u.name || ''),
      phone: compose(phoneFormat, removeNonNumeric)(u.phone || ''),
      email: u.email,
      trackingNumber: removeNonNumeric(u.trackingNumber)
    }));
    const [toPost, dirty] = partition(cleanedUp, (u) => isEqual(u, this.users.find(ou => ou.email === u.email)));

    await Promise.all(toPost.map(async (u, idx) => {
      try {
        const userRes = await fetch(`${config.apiUrl}users/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({...u, password: 'ace'})
        });
        if (userRes.status !== 201) {
          return dirty.push(u);
        }
        const { _id: userId } = await userRes.json()
        const packageRes = await fetch(`${config.apiUrl}users/${userId}/packages/`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({trackingNumber: u.trackingNumber})
        });
        if(packageRes.status !== 201) {
          return dirty.push(u);
        }
      } catch (e) {
        dirty.push(u);
      }
    }));

    this.setState({
      loading: false,
      json: JSON.stringify(dirty, null, 2)
    })
  }
  textChange = ({target: { value: text }}) => {
    let validJson = true;
    try {
      JSON.parse(text);
    } catch (e) {
      validJson = false;
    } finally {
      this.setState({
        json: text,
        validJson
      });
    }
  }
  render() {
    const { loading, json, validJson } = this.state;
    return (
      <div>
        <h2 className="App" onClick={this.hidden}>
          Tr4ceable!
        </h2>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={4000}
          onRequestClose={() => this.setState({open: false})}
        />
        <div style={{padding: 20}}>
          <div>
            <h2>Import</h2>
            <p>Paste some user json below and we'll do our best to try and import them!</p>
            <h6>{validJson ? 'Valid!' : 'Your JSON needs some work'}</h6>
            <TextField multiLine fullWidth rows={20} value={json} disabled={loading} floatingLabelText="User JSON" onChange={this.textChange} />
            <div>
              <FlatButton onClick={() => this.props.history.push('/dashboard')}>Go Back</FlatButton>
              <RaisedButton primary disabled={!validJson} onClick={this.importUsers}>Import!</RaisedButton>
            </div>
          </div>
        </div>
      </div>
    );
  }
}