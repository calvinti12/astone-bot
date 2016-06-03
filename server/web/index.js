'use strict';

import Koa from 'koa';
import Router from 'koa-router';
import convert from 'koa-convert';
import bodyParser from 'koa-bodyparser';
import telegramRoutes from './telegram.route';
import paymetRoutes from './payment.route';
import logger from '../services/logger';

export default (auctionManager, chatter, paypal, config) => {
	const app = new Koa();

	app.use(convert(bodyParser()));

	const router = new Router();

	telegramRoutes(router, chatter);
	paymetRoutes(router, auctionManager, paypal, config);

	app.use(router.routes());

	(async() => {
		app.listen(config.server.port, () => {
			logger.debug(`App started on port ${config.server.port} with environment ${config.env}`);
		});
	})();

};



