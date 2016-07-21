'use strict';

import chai from 'chai';
import sinon from 'sinon';
import * as constants from '../consts';
import CommandHelper from '../command-helper';
import {ObjectID} from 'mongodb';

chai.should();
const expect = chai.expect;

import AuctionDescriptionCommand from './auction-description.cmd';

describe('AuctionDescriptionCommand', () => {
  let telegram;
  let managerFactory;
  let auctionManager;
  let commandHelper;
  let command;

  beforeEach(() => {
    telegram = {};
    auctionManager = {
      updateAuction: (data) => {
        return Promise.resolve(true);
      }
    };

    managerFactory = {
      getAuctionManager: () => {
        return auctionManager;
      }
    };

    telegram.sendMessage = sinon.stub();
    telegram.sendChatAction = sinon.stub();
    commandHelper = sinon.stub(CommandHelper(telegram));
    command = new AuctionDescriptionCommand(telegram, managerFactory, commandHelper);
  });

  it('Should set state to STATE_WAIT_FOR_PRICE when no description is passed', (done) => {
    command
      .execute({chat: {id: 10}, state: constants.STATE_WAIT_FOR_DESC}, "")
      .then((res) => {
        res.state.should.be.equal(constants.STATE_WAIT_FOR_DESC);
        res.result.should.be.false;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('Should set state to STATE_WAIT_FOR_PRICE when description is set', (done) => {
    command
      .execute({chat: {id: 10}, state: constants.STATE_WAIT_FOR_DESC}, -3)
      .then((res) => {
        res.state.should.be.equal(constants.STATE_WAIT_FOR_PRICE);
        res.result.should.be.true;
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

});