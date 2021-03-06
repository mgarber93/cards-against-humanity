import React, { Component } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Snackbar from 'material-ui/Snackbar';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      errorMessage: '',
      showError: false
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.sendSignupRequest = this.sendSignupRequest.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.showError = this.showError.bind(this);
    this.hideError = this.hideError.bind(this);
    if (props.currentUser) {
      props.history.push('/');
    }
  }

  handleInputChange (property, e) {
    let stateChange = {};
    stateChange[property] = e.target.value;
    this.setState(stateChange);
  }

  handleKeyPress (e) {
    if (e.key === 'Enter') {
      this.sendSignupRequest();
    }
  }

  sendSignupRequest () {
    if (this.state.name && this.state.email && this.state.password) {
      axios.post('/signup', {
        name: this.state.name,
        email: this.state.email,
        password: this.state.password
      })
      .then((res) => {
        window.location.replace(res.request.responseURL); // Performs redirect to proper page
        return res;
      })
      .catch((err) => {
        this.setState({errorMessage: 'Email is invalid or already in use'});
        this.showError();
      });
    } else {
      let missingVals = [];
      if (!this.state.name) {
        missingVals.push('name');
      }
      if (!this.state.email) {
        missingVals.push('email');
      }
      if (!this.state.password) {
        missingVals.push('password');
      }
      let errorString = 'Incomplete! You are missing';
      for (let i = 0; i < missingVals.length; i++) {
        if (i === missingVals.length - 1 && missingVals.length > 1) {
          errorString += ', and ' + missingVals[i];
        } else if (i === 0) {
          errorString += ' ' + missingVals[i];
        } else {
          errorString += ', ' + missingVals[i];
        }
      }
      this.setState({errorMessage: errorString});
      this.showError();
    }
  }

  showError () {
    this.setState({showError: true});
  }
  hideError () {
    this.setState({showError: false});
  }

  render() {
    const navItemStyle = {textDecoration: 'none'};
    return (
      <div className='signup center'>
        <h1>Signup</h1>
        <TextField onKeyPress={this.handleKeyPress} hintText='Joe Swanson' floatingLabelText='Name' type='text' value={this.state.name} onChange={this.handleInputChange.bind(this, 'name')} /><br/>
        <TextField onKeyPress={this.handleKeyPress} hintText='joeswanson@familyguy.com' floatingLabelText='Email' type='email' value={this.state.email} onChange={this.handleInputChange.bind(this, 'email')} /><br/>
        <TextField onKeyPress={this.handleKeyPress} floatingLabelText='Password' type='password' value={this.state.password} onChange={this.handleInputChange.bind(this, 'password')} /><br/>
        <RaisedButton className='btn' onClick={this.sendSignupRequest}>Signup</RaisedButton>
        <NavLink to='/login' style={navItemStyle}>
          <FlatButton className='btn'>Login</FlatButton>
        </NavLink>
        <Snackbar open={this.state.showError} message={this.state.errorMessage} autoHideDuration={4000} onRequestClose={this.hideError} />
      </div>
    ) 
  }
}

const mapStateToProps = ({global}) => ({
  currentUser: global.currentUser
});

export default connect(mapStateToProps)(Signup);