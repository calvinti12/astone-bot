'use strict';

export default (auctionManager, telegram) => {
  const ageMessages = {
    65: (auction) => `No one offer more than € ${auction.price} ?`,
    70: (auction) => `Come on, don't be shy, make an offer`,
    90: (auction) => `*€ ${auction.price}* and one`,
    95: (auction) => `*€ ${auction.price}* and two`,
    100: (auction) => `*€ ${auction.price}* and three`,
    103: (auction) => `*${auction.title}* sold for *€ ${auction.price}*  💰`
  }

  function _handleAgeMessage(auction) {
    if (auction.bidAge > 60) {
      _sendMessageToSubscribers(auction, ageMessages[auction.bidAge](auction));
    }
  }

  function _sendMessageToSubscribers(auction, message) {
    auction.subscribers.forEach((subscriber) => {
      telegram.sendMessage({
        chat_id: subscriber.chatId,
        text: message,
        parse_mode: 'Markdown'
      });
    });
  }

  return {
    make: () => {
      const now = new Date();
      return auctionManager
        .getRunningAuctionsBidAge(now, 60)
        .then((res) => {
          res.forEach((auction) => {
            _handleAgeMessage(auction);
          });
          return Promise.resolve(res.length);
        });
    }
  };
};