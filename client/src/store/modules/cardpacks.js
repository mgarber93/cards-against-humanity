/**
 * Keep track of available cardpacks here.
 */
import axios from 'axios';

const SET_CARDPACKS = 'cardpacks/SET_CARDPACKS';

const initialState = {
  cardpacks: []
};

export default (state = initialState, {type, payload}) => {
  switch (type) {
  case SET_CARDPACKS:
    return {
      ...state,
      cardpacks: payload
    };
  default:
    return state;
  }
};

export const setCardpacks = payload => {
  return {
    type: SET_CARDPACKS,
    payload
  };
};