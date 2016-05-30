'use strict';

import chai from 'chai';
import sinon from 'sinon';
import * as constants from './consts';
import {ObjectID} from 'mongodb';

chai.should();
const expect = chai.expect;

import AuctionListCommand from './auction-list.cmd';

describe('AuctionListCommand', () => {
	let telegram;
	let i18n;
	let auctionManager

	beforeEach(() => {
		i18n = {};
		i18n.__ = (label) => {
			return label;
		};

		telegram = {};
		auctionManager = {};

		telegram.sendMessage = sinon.stub();
		telegram.sendChatAction = sinon.stub();
	});

	it('Should respond with a message for the active auction', (done) => {

		var startDate = new Date();
		startDate.setDate(startDate.getDate() - 1);
		auctionManager.getActiveAuctions = sinon.stub().returns(
			Promise.resolve([
				{
					_id: ObjectID("572cc825de91f5b2bc3c24d8"),
					title: "Commodore 64",
					description: "A beautiful Commodore 64!",
					image: "http://www.oldcomputers.net/pics/C64-left.jpg",
					startDate: startDate,
					startingPrice: 10,
					price: 11,
					username: "guglielmino",
					subscribers: [
						{username: "guglielmino"},
						{username: "tizio"},
						{username: "caio"}
					]

				}
			])
		);

		const command = new AuctionListCommand(telegram, i18n, auctionManager);
		command.execute({chat: {id: 10}})
			.then((res) => {
				telegram.sendMessage
					.calledWith(
						sinon.match.has('text', '*Commodore 64 (price € 11)*\nhttp://www.oldcomputers.net/pics/C64-left.jpg\nA beautiful Commodore 64!'))
					.should.be.ok;
				done();
			})
			.catch((err) => {
				done(err);
			});
	});

	it('Should respond with a message informing there are no active auction with called with empty auction list', (done)=>{
		auctionManager.getActiveAuctions = sinon.stub().returns(Promise.resolve([]));

		const command = new AuctionListCommand(telegram, i18n, auctionManager);
		command.execute({chat: {id: 10}})
			.then((res) => {
				telegram.sendMessage
					.calledWith(
						sinon.match.has('text', 'Sorry, no Auctions active now'))
					.should.be.ok;
				done();
			})
			.catch((err) => {
				done(err);
			});

	});


});
