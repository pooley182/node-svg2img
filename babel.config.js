module.exports = function (api) {
	api.cache(true);

	const presets = [
		[
			'@babel/preset-env',
			{
				targets: {
					node: 'current'
				}
			}
		],
		"@babel/typescript",
	];
	const plugins = [
		"@babel/proposal-class-properties",
		"@babel/proposal-object-rest-spread"
	];

	return {
		presets,
		plugins
	};
};