'use strict';

import chai from 'chai';
import sinon from 'sinon';

import StartAuctionCommand from './start-auction.cmd.js';

describe('StartAuctionCommand', () => {
	let telegram;
	let i18n;
	let auctionManager;

	beforeEach(() => {
		i18n = {};
		i18n.__ = (label) => {
			return label;
		};

		telegram = {};
		auctionManager = {};

		telegram.sendMessage = sinon.stub();
		telegram.answerCallbackQuery = sinon.stub();
	});
	
	it('Should respond with \'AUCTION SUBSCRIBED\' when subscription succeeds', () => {
		auctionManager.subscribe = sinon.stub()
			.returns(Promise.resolve({ status: {name: 'Success'}}));


		const command = new StartAuctionCommand(telegram, i18n, auctionManager);
		command.execute({callback_query_id: 100, chat: {id: 10}}, 123)
			.then((res) => {
				telegram.answerCallbackQuery
					.calledWith(
						100,
						'AUCTION SUBCRIBED', false)
					.should.be.ok;
				done();
			})
			.catch((err) => {
				done(err);
			});
	});


	it('Should respond with \'Sorry, this auction isn\'t active You can\'t start bidding on it.\' when Auction is closes', () => {

		auctionManager.subscribe = sinon.stub()
			.returns(Promise.resolve({ status: {name: 'AuctionNotActive'}}));


		const command = new StartAuctionCommand(telegram, i18n, auctionManager);
		command.execute({callback_query_id: 100, chat: {id: 10}}, 123)
			.then((res) => {
				telegram.sendMessage
					.calledWith(sinon.has('text', 'Sorry, this auction isn\'t active You can\'t start bidding on it.'))
						.should.be.ok;
				done();
			})
			.catch((err) => {
				done(err);
			});
	});
	

});
