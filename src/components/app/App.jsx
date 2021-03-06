import React, { Component } from 'react';
import { Switch } from 'react-router-dom'
import { withCookies, CookiesProvider } from 'react-cookie';
import axios from 'axios';
import { notification } from 'antd';
import { Route, BrowserRouter as Router, Redirect } from 'react-router-dom';
import HelpPage from '../help/HelpPage';
import Login from '../login/Login';
import Orders from '../orders/Orders';
import Profile from '../profile/Profile';
import "react-notifications-component/dist/theme.css";
import { NOTIFICATION_TYPES } from "../../constants/NotificationTypes";
import { APIContext } from '../../utils/API';
import { ApiServer } from '../../settings';
import Navbar from '../navbar/Navbar';
import SideMenu from '../side-menu/SideMenu';
import 'antd/dist/antd.css';
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      access_token: undefined,
      isLoggedIn: false,
      openDrawer: false,
      user: {
        fullName: '',
        fullNameCopy: '',
        photoUrl: '',
        email: '',
        role: '',
        drugStore: {},
      }
    }

    this.API = axios.create({
      baseURL: ApiServer,
      responseType: "json"
    });
    
    this.API.interceptors.request.use((config) => {
      config.headers = { Authorization: `Bearer ${this.props.cookies.get('token', { path: '/' })}` };
      return config;
    }, error => Promise.reject(error));
  }

  addNotification = (title, message, duration, type) => {
    notification[type]({
      message: title,
      description: message,
    });
  };

  componentWillMount() {
    // Get user access token
    const accessToken = this.props.cookies.get('token', { path: '/' });
    if (!!accessToken) {
      this.setState({access_token: accessToken, isLoggedIn: true}, () => {
        this.configureAxios();
        this.getCurrentUserData();
      });
    }
  }

  componentDidMount = () => {
    const accessToken = this.props.cookies.get('token', { path: '/' });
    if (accessToken) {
      this.getCurrentUserData();
    }
  }

  configureAxios = () => {
    const { access_token } = this.props;
    this.API.interceptors.request.use((config) => {
      config.headers = { Authorization: `Bearer ${access_token}` };
      return config;
    }, error => Promise.reject(error));
  }

  handleLoginLogout = async (loggedStatus) => {
    if (loggedStatus) {
      await this.configureAxios();
      this.getCurrentUserData();
    }
    this.setState({
      isLoggedIn: loggedStatus
    });
  }

  getCurrentUserData = () => {
    this.API.get(`${ApiServer}/user`).then(data => {
      const response = data.data;
      console.log('Logged in::', data.data);
      this.setState({
        user: {
          fullName: response.complete_name,
          email: response.email,
          photoUrl: response.profile_picture_url,
          role: 'Product Manager',
          drugStore: response.drug_stores[0],
        },
      })
    });
  }

  toggleDrawer = () => {
    this.setState((prevState) => ({
      openDrawer: !prevState.openDrawer,
    }));
  }

  closeDrawer = () => {
    this.setState({
      openDrawer: false,
    });
  }
  
  doNothing = () => {

  }

  handleLogout = () => {
    this.setState({
      isLoggedIn: false,
      openDrawer: false,
    }, () => {
      this.props.cookies.remove('token', { path: '/' });
      window.location.href = "/";
    });
  }

  onProfileNameChange = (name) => {
    this.setState((prevState) => ({
      user: {
        ...prevState.user,
        fullNameCopy: name,
      }
    }));
  }

  cleanUserNameCopy = () => {
    this.setState((prevState) => ({
      user: {
        ...prevState.user,
        fullNameCopy: '',
      }
    }));
  }

  rewriteUserInfo = (modifiedUser) => {
    this.setState((prevState) => ({
      user: {
        fullName: modifiedUser.complete_name,
        fullNameCopy: '',
        photoUrl: (!!modifiedUser.profile_picture_url) ? modifiedUser.profile_picture_url : prevState.photoUrl,
        email: modifiedUser.email,
        role: 'Product Manager',
        drugStore: prevState.drugStore
      }
    }));
  }

  handleNewPhoto = (location) => {
    let user = { ...this.state.user };
    user.photoUrl = location;
    this.setState({ user });
  }

  render() {
    const { isLoggedIn, openDrawer, user } = this.state;
    const { cookies } = this.props;
    return (
      <APIContext.Provider value={this.API}>
        <CookiesProvider>
          <Router>
            <div>
              {
                isLoggedIn ?
                  <Navbar toggleDrawer={this.toggleDrawer} user={user} /> : null
              }
              <Switch>
                <Route exact path='/' render={() => (isLoggedIn)? <Redirect to='/orders' /> : <Login handleLogin={this.handleLoginLogout} />} />
                <Route exact path='/support' render={() => (!isLoggedIn)? <Redirect to='/' /> : <HelpPage />} />
                <Route exact path='/orders' render={() => (!isLoggedIn)? <Redirect to='/' /> : <Orders user={user} addNotification={this.addNotification} handleLoginLogout={this.handleLoginLogout} cookies={cookies}  />} />
                <Route exact path='/profile' render={() => (!isLoggedIn)? <Redirect to='/' /> : <Profile handleNewPhoto={this.handleNewPhoto} user={user} rewriteUserInfo={this.rewriteUserInfo} cleanUserNameCopy={this.cleanUserNameCopy} onNameChange={this.onProfileNameChange} addNotification={this.addNotification} handleLoginLogout={this.handleLoginLogout} cookies={cookies} />} />
              </Switch>
              <SideMenu handleLogut={this.handleLogout} open={openDrawer} onClose={this.closeDrawer} onKeyDownDrawer={this.doNothing} onClickDrawer={this.doNothing} />
            </div>
          </Router>
        </CookiesProvider>
      </APIContext.Provider>
    );
  }
}

export default withCookies(App);
