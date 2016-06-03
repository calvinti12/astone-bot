'use strict';

import chai from 'chai';
import sinon from 'sinon';
import {BidResponse} from '../services/domain/auction-manager';
import {ObjectID} from 'mongodb';
import CommandHelper from './command-helper';

chai.should();
const expect = chai.expect;

import BidCommand from './bid.cmd';

describe('BidCommand', () => {
	let telegram;
	let managerFactory;
	let auctionManager;
	let commandHelper;

	beforeEach(() => {
		telegram = {};
		telegram.sendMessage = sinon.stub();
		telegram.answerCallbackQuery = sinon.stub();

		auctionManager = {};
		managerFactory = {
			getAuctionManager: () => {
				return auctionManager;
			}
		};

		commandHelper = sinon.stub(CommandHelper(telegram));

	});

	it('Should respond asking to select an Auction when trying to bid without selecting one', (done) => {
		let command = new BidCommand(telegram, managerFactory, commandHelper);

		command.execute({chat: {id: 10}}, [10])
			.then((res) => {
				commandHelper.simpleResponse
					.calledWith(10, 'Before bidding You must choose an active auction')
					.should.be.ok;
				done();
			});
	});

	it('Should respond \'Auction closed\' when bid on a closed Auction', (done)=> {

		auctionManager.bid = sinon.stub()
			.returns(Promise.resolve({status: BidResponse.AuctionClosed}));

		let command = new BidCommand(telegram, managerFactory, commandHelper);

		command.execute({auctionId: "aabbcc", chat: {id: 10}}, [10])
			.then((res) => {
				commandHelper.simpleResponse
					.calledWith(10, `This auction is closed and can't accept new bids`)
					.should.be.ok;
				done();
			})
			.catch((err) => {
				done(err);
			});
	});

	it('Should respond Auction isn\'t active when trying to bid on a not started one', (done) => {
		auctionManager.bid = sinon.stub()
			.returns(Promise.resolve({status: BidResponse.AuctionNotActive}));

		let command = new BidCommand(telegram, managerFactory, commandHelper);

		command.execute({auctionId: "aabbcc", chat: {id: 10}}, [10])
			.then((res) => {
				commandHelper.simpleResponse
					.calledWith(10, 'Can\'t bid on this Auction because is inactive')
					.should.be.ok;
				done();
			})
			.catch((err) => {
				done(err);
			});
	});

	it('Should send a message to all subscriber of Acution when bid accepted', (done) => {

		var startDate = new Date();
		startDate.setDate(startDate.getDate() - 1);
		auctionManager.bid = sinon.stub().returns(Promise.resolve(
			{
				status: BidResponse.Success,
				auction: {
					_id: ObjectID("572cc825de91f5b2bc3c24d8"),
					title: "Commodore 64",
					description: "A beautiful Commodore 64!",
					image: "http://www.oldcomputers.net/pics/C64-left.jpg",
					startDate: startDate,
					startingPrice: 10,
					price: 11,
					username: "guglielmino",
					subscribers: [
						{username: "guglielmino", chatId: 123},
						{username: "tizio", chatId: 234},
						{username: "caio", chatId: 567}
					]
				}
			}));

		let command = new BidCommand(telegram, managerFactory, commandHelper);
		let mock = sinon.mock(command);
		let expectation = mock.expects('_sendMessageToSubscriber').exactly(3);

		command.execute({auctionId: "aabbcc", chat: {id: 123, username: "guglielmino"}}, [10])
			.then((res) => {
				expectation.verify();
				done();
			})
			.catch((err) => {
				done(err);
			});
	});

	it('Should respond with min number of subscriber requests when bid and there are less than 10 subscribers', (done) => {

		var startDate = new Date();
		startDate.setDate(startDate.getDate() - 1);
		auctionManager.bid = sinon.stub().returns(Promise.resolve({
			status: BidResponse.InsufficientSubscribers,
			auction: {
				_id: ObjectID("572cc825de91f5b2bc3c24d8"),
				title: "Commodore 64",
				description: "A beautiful Commodore 64!",
				image: "http://www.oldcomputers.net/pics/C64-left.jpg",
				startDate: startDate,
				startingPrice: 10,
				price: 11,
				username: "guglielmino",
				subscribers: [
					{username: "guglielmino", chatId: 123},
					{username: "tizio", chatId: 234},
					{username: "caio", chatId: 567}
				]
			}
		}));

		let command = new BidCommand(telegram, managerFactory, commandHelper);

		command.execute({auctionId: "aabbcc", chat: {id: 123, username: "guglielmino"}}, [10])
			.then((res) => {
				commandHelper.simpleResponse
					.calledWith(123, 'We need at least *10* participants to start the Auction')
					.should.be.ok;
				done();
			})
			.catch((err) => {
				done(err);
			});
	});

});
