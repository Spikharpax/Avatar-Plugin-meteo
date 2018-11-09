'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeFetch = require('node-fetch');
var _nodeFetch2 = _interopRequireDefault(_nodeFetch);
var _helpers = require('../../node_modules/ava-ia/lib/helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// -- Internal
var API = 'http://query.yahooapis.com/v1/public/yql?q=';
var RELATIONS = ['when', 'location'];

exports.default = function (state) {

  return new Promise(function (resolve, reject) {
    var _relation = (0, _helpers.relation)(RELATIONS, state);

    var location = _relation.location;
    var when = _relation.when;
	
	 if (!location)
		location = Config.modules.meteo.default_location;

    var query = escape('select item from weather.forecast where woeid in (select woeid from geo.places where text=\'' + location + '\') and u=\'c\' | truncate(count=1)');
    if (state.debug) info('ActionForecastYahoo'.bold.yellow, 'location:', location.yellow, ', when: ' + ((when) ? when.toString().yellow : 'today'.yellow));

    (0, _nodeFetch2.default)('' + API + query + '&format=json')
	.then(function (response) {
      return response.json();
    })
	.then(function (body) {
		if (body &&  body.query &&  body.query.results) {
			var item = body.query.results.channel.item;
			state.action = {
				tokens : state.tokens,
				forecast : item.forecast,
				location : location,
				module: 'meteo',
				sentence: state.sentence,
				command: 'forcastYahoo',
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
    }).catch(function (error) {
		
			 reject(error);
	
    });
  });
};
