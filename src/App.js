import React, { Component } from 'react';
import styled from 'styled-components';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar/Snackbar';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import localforage from 'localforage';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import fetch from 'isomorphic-fetch';
import jwtDecode from 'jwt-decode';

import './App.css';
import Dashboard from './dashboard';
import AdminDashboard from './admin-dashboard';
import config from './config';


class Home extends Component {
  state = {
    email: '',
    password: '',
    open: false,
    message: ''
  }

  createAccount = async () => {
    const res = await fetch(`${config.apiUrl}/users`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(this.state)
    });
    if(res.status === 201) {
      this.setState({message: 'Registered Successfully! Please login', open: true})
    } else {
      this.setState({message: 'Failed to register... Maybe that email is taken?', open: true})
    }
  }

  login = async () => {
    const res = await fetch(`${config.apiUrl}/auth`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(this.state)
    });
    if(res.status === 200) {
      const body = await res.json();
      await localforage.setItem('token', body.token);
      const { _id } = jwtDecode(body.token)
      this.props.history.push(`/dashboard/${_id}`);
    } else {
      this.setState({message: 'Failed to login... doublecheck your password?', open: true})
    }
  }

  render() {
    const { email, password } = this.state;
    return (
      <div className="App">
        <h2>
          Tr4ceable!
        </h2>
        <h6>
          Simple Package Tracking
        </h6>
        <div>
        <b>Sign in</b> or <b>Create an Account</b> to get started.
        </div>
        <div>
          <TextField
            floatingLabelText="Email"
            value={email}
            onChange={({target: {value: email}}) => this.setState({email}) }
          />
        </div>
        <div>
          <TextField
            type="password"
            floatingLabelText="Password"
            value={password}
            onChange={({target: {value: password}}) => this.setState({password}) }
          />
        </div>
        <div>
        <FlatButton style={{ margin: 15, padding: '0px 10px'}} onClick={this.createAccount}>Create Account</FlatButton>
        <RaisedButton style={{ margin: 15 }} primary onClick={this.login}>Sign In</RaisedButton>
        </div>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={4000}
          onRequestClose={() => this.setState({open: false})}
        />
      </div>
    );
  }
}

class Logout extends React.Component {
  state = { done: false }
  async componentDidMount(){
    await localforage.removeItem('token');
    this.setState({done: true});
  }
  render() {
    return this.state.done ? <Redirect to="/" /> : <div>Plz Hold</div>
  }
}

class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <BrowserRouter>
          <div>
            <Route exact path="/" component={Home}/>
            <Route path="/dashboard/:userId" component={Dashboard} />
            <Route exact path="/dashboard" component={AdminDashboard} />
            <Route exact path="/logout" component={Logout} />
          </div>
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}

export default App;
