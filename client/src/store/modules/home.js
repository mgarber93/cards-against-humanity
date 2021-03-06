import React, {Component} from 'react';
import axios from 'axios';

export const ADD_FRIEND = 'home/ADD_FRIEND';
export const REMOVE_FRIEND = 'home/REMOVE_FRIEND';
export const ADD_SENT_FRIEND_REQUEST = 'home/ADD_SENT_FRIEND_REQUEST';
export const ADD_RECEIVED_FRIEND_REQUEST = 'home/ADD_RECEIVED_FRIEND_REQUEST';
export const SET_FRIENDS = 'home/SET_FRIENDS';

const initialState = {
  friends: [],
  requestsSent: [],
  requestsReceived: [],
};

/**
 * Main application reducer. Accepts a state and action object.
 * TODO: split up
 */
export default (state = initialState, {type, payload}) => {
  switch (type) {
  case ADD_FRIEND: 
    return {
      ...state,
      friends: state.friends.concat([payload]),
      requestsSent: state.requestsSent.filter(f => f.id !== payload.id),
      requestsReceived: state.requestsReceived.filter(f => f.id !== payload.id)
    };

  case SET_FRIENDS: 
    return {
      ...state,
      friends: payload
    };

  case ADD_SENT_FRIEND_REQUEST:
    return {
      ...state,
      requestsSent: state.requestsSent.concat(payload)
    };

  case ADD_RECEIVED_FRIEND_REQUEST:
    return {
      ...state,
      requestsReceived: state.requestsReceived.concat(payload)
    };

  case REMOVE_FRIEND:
    return {
      ...state,
      friends: state.friends.filter(f => f.id !== payload.id),
      requestsSent: state.requestsSent.filter(f => f.id !== payload.id),
      requestsReceived: state.requestsReceived.filter(f => f.id !== payload.id)
    };

  default: 
    return state;
  }
};

export const addFriend = payload => {
  return {
    type: ADD_FRIEND,
    payload
  };
};

export const addFriendRequestSent = payload => {
  return {
    type: ADD_SENT_FRIEND_REQUEST,
    payload
  };
};

export const addFriendRequestReceived = payload => {
  return {
    type: ADD_RECEIVED_FRIEND_REQUEST,
    payload
  };
};

export const removeFriend = payload => ({
  type: REMOVE_FRIEND,
  payload
});