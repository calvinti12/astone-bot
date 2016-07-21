'use strict';

import * as constants from '../consts';

export default class AuctionNameCommand {

  constructor(telegram, managerFactory, commandHelper) {
    this._telegram = telegram;
    this._auctionManager = managerFactory.getAuctionManager();
    this._helper = commandHelper;
  }

  execute(state, ...params) {

    return this
      ._auctionManager
      .createAuction(state.chat.username, params[0])
      .then((res) => {
        this._helper
          .simpleResponse(state.chat.id, 'Ok, give me now a description of the item');
        return Promise.resolve({state: constants.STATE_WAIT_FOR_DESC, auctionId: res});
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

}