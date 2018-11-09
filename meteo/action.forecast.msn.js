'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _weatherJs = require('weather-js');

var _weatherJs2 = _interopRequireDefault(_weatherJs);

var _helpers = require('../../node_modules/ava-ia/lib/helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -- Internal
var RELATIONS = ['when', 'location'];


exports.default = function (state) {

  return new Promise(function (resolve, reject) {
    var _relation = (0, _helpers.relation)(RELATIONS, state);

    var location = _relation.location;
    var when = _relation.when;
	
	 if (!location)
		location = Config.modules.meteo.default_location;

    if (state.debug) info('ActionForecastMsn'.bold.yellow, 'location:', location.yellow, ', when: ' + ((when) ? when.toString().yellow : 'today'.yellow));

	 _weatherJs2.default.find({ search: location, degreeType: 'C' }, function (error, response) {
		if (!error) {
			var item = response[0];
			state.action = {
				tokens : state.tokens,
				forecast : item.forecast,
				location : location,
				module: 'meteo',
				sentence: state.sentence,
				command: 'forcastMsn',
				when: (when) ? when : 'today'
			};
		
			resolve(state);
		} else {
			
			state.action = {
				module: 'meteo',
				command: 'error',
				error: 'je ne suis pas arrivé à récupérer la météo'
			};
			
		   resolve(state);
			
		}
    });
  });
};
