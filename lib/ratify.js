// Load modules

var RequestValidator = require('./RequestValidator.js'),
	SwaggerManager = require('./SwaggerManager.js'),
	Hoek = require('@hapi/hoek'),
	Boom = require('@hapi/boom'),
	defaults = {
		pluginName: 'ratify',
		auth: false,
		baseUrl: 'http://localhost',
		startingPath: '/api-docs',
		apiVersion: '',
		responseContentTypes: ['application/json'],
		log: function(){}
	};


function register(plugin, options) {

	const settings = Hoek.applyToDefaults(defaults, options || {});

	if (!options.disableSwagger) {
		const swaggerManager = new SwaggerManager(settings);
		plugin.route({
			method: 'GET',
			path: settings.startingPath + '/{path*}',
			config: {
				auth: settings.auth,
				handler: function(request) {
					let routes = request.server.table();

					routes = routes.filter(function (item) {
						return (request.route.path !== item.path && item.method !== 'options');
					});

					if (!request.params.path) {
						return swaggerManager.getResourceListingModel(routes);
					}
					else if (request.params.path && swaggerManager.isValidApi(routes, request.params.path)) {
						return swaggerManager.getApiDeclarationModel(routes, request.params.path);
					}
					else {
						throw Boom.notFound();
					}
				}
			}
		});
	}

	RequestValidator(plugin, settings);
}

module.exports = {
	name: 'ratify',
	register
};
