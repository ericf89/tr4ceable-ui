import React from 'react';
import localforage from 'localforage';
import jwtDecode from 'jwt-decode';
import TextField from 'material-ui/TextField';
import Loading from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';
import { Link } from 'react-router-dom';
import config from './config';
import User from './user';


export default class AdminDash extends React.Component {
  state = {
    loading: true,
    open: false,
    filter: '',
    message: '',
    users: [],
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
      const res = await fetch(`${config.apiUrl}users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.status === 401) {
        if(this.props.match.params.userId === viewer._id) {
          this.props.history.replace(`/dashboard/${viewer._id}`)
        }
      }
      const { users } = await res.json();
      this.setState({users, loading: false});
    }
  }
  deleteUser = userId => async () => {
    const token = await localforage.getItem('token');

    const res = await fetch(`${config.apiUrl}users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if(res.status !== 200) {
      this.setState({open: true, message: 'Something went wrong... try again.'})
    } else {
      this.setState(s => ({
        users: s.users.filter(u => u._id !== userId),
        message: 'Deleted!',
        open: true
      }));
    };
  }
  render() {
    const { loading, users: allUsers, filter } = this.state;
    const users = filter ? allUsers.filter(u => u.email.toLowerCase().includes(filter.toLowerCase())) : allUsers;
    return (
      <div>
        <h2 className="App">
          Tr4ceable!
        </h2>
        <Snackbar
          open={this.state.open}
          message={this.state.message}
          autoHideDuration={4000}
          onRequestClose={() => this.setState({open: false})}
        />
        <div style={{padding: 20}}>
          { loading
            ? <Loading />
            : (
              <div>
                <TextField value={filter} floatingLabelText="Email Filter" onChange={({target: { value: filter } }) => this.setState({filter})} />
                <Link to="/import">Import Users</Link>
                <div>
                  { users.map(u => <User key={u._id} {...u} delete={this.deleteUser} />)}
                </div>
              </div>
            )
          }
        </div>
      </div>
    );
  }
}