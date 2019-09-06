// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').config();

// Require keystone
var keystone = require('keystone');
var handlebars = require('express-handlebars');

// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({
	'name': 'capitalautoimportapp',
	'brand': 'Capital Auto Import SRL',

	'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': '.hbs',

	'custom engine': handlebars.create({
		layoutsDir: 'templates/views/layouts',
		partialsDir: 'templates/views/partials',
		defaultLayout: 'default',
		helpers: new require('./templates/views/helpers')(),
		extname: '.hbs',
	}).engine,

	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User',
	//'module root': '',
	'env': 'development',
	'view cache': false,


});

// Load your project's Models
keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js
keystone.set('locals', {
	_: require('lodash'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable,
});

//allen was here: overwrite admin path from /keystone to /capital
keystone.set('admin path', 'capital');


// Load your project's Routes
keystone.set('routes', require('./routes'));


// Configure the navigation bar in Keystone's Admin UI
keystone.set('nav', {
	galleries: 'galleries',
	websites: 'websites',
	adverts: 'adverts',
	users: 'users',
});
// Cron job for auto publish adverts
var cron = require('node-cron');
cron.schedule('*/10 * * * *', function () {
	const vo = require('vo');

	function* run() {
		var adsToBePublished = yield keystone.list('PublishAds').model.find()
			.where('publishAdvert', 'si')
			.where('status', 'Inédito')
			.populate('selectAdvert selectDomain')
			.exec()
			.then(function (ads) {
				return ads;
			}, function (err) {
				throw err;
			});
		for (let ad of adsToBePublished) {
			// loop over domains where to publish ad
			for (let website of ad.selectDomain) {
				if (website.domain === 'supercarros.com' && !ad.webProperty_supercarros) {
					var supercarros = require('./supercarros');
					vo(supercarros(ad._id, ad.selectAdvert, website))
						.then(function (result) {
							console.log(result);
						})
						.catch(e => {
							console.log(e);
						});
				}
			}
		}

	}

	vo(run)(
		function (err) {
			if (err) throw err;
		});

});

keystone.start();
