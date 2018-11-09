// https://developer.yahoo.com/weather/documentation.html

var moment = require('moment');
var wakeup;

require('colors');


exports.action = function(data, callback){
	
	var tblCommand = {
		error: function() {
			if (data.action.error)
				Avatar.speak('je suis désolé. Je ne suis pas arrivé à récupérer la météo', data.client, function(){
					Avatar.Speech.end(data.client);
				});
			error('Meteo:', data.action.error.red);
			return callback();
		},
		forcastMsn: function() {forcastMSN(data, callback)},
		forcastYahoo: function() {forcastYahoo(data, callback)},
		// pour le réveil...
		wakeup: function() {wakeup = true; Avatar.ia.action('donnes-moi la météo', data.client, callback)}
	};
	
	info("Meteo command:", data.action.command.yellow, "From:", data.client.yellow);
	tblCommand[data.action.command]();
	
}



function forcastMSN (state, callback) {
	
	moment.locale('en');
	
	if (state.action.sentence.toLowerCase().indexOf('today') != -1){
		var forday = 'Aujourd\'hui, le temps est ';
		var day = moment().format("DD MMM YYYY");
	} else if (state.action.sentence.toLowerCase().indexOf('after tomorrow') != -1){
		var forday = 'Après-demain, le temps sera ';
		var day = moment().add(2, 'days').format("DD MMM YYYY");
	} else if (state.action.sentence.toLowerCase().indexOf('tomorrow') != -1){
		var forday = 'Demain, le temps sera ';
		var day = moment().add(1, 'days').format("DD MMM YYYY");
	} else {
		var forday = 'Aujourd\'hui, le temps est ';
		var day = moment().format("DD MMM YYYY");
	}
	
	var forecasts = state.action.forecast;
	var condition;
	
	// décalage horaire...
	// je crois que c'est inutile pour Msn mais bon...
	if (moment(forecasts[0].date).format("DD MMM YYYY").toLowerCase() == moment().add(1, 'days').format("DD MMM YYYY").toLowerCase()){
		if (state.action.sentence.toLowerCase().indexOf('today') != -1) {
			var forday = 'avec le décalage horaire, c\'est déjà demain. Le temps est ';
			var day = moment().add(1, 'days').format("DD MMM YYYY");
		} else {
			if (state.action.sentence.toLowerCase().indexOf('tomorrow') != -1){
				var forday = 'avec le décalage horaire, c\'est après-demain. Le temps sera ';
				var day = moment().add(2, 'days').format("DD MMM YYYY");
			} else if (state.action.sentence.toLowerCase().indexOf('after tomorrow') != -1){
				var forday = 'avec le décalage horaire, c\'est dans 3 jours. Le temps sera ';
				var day = moment().add(3, 'days').format("DD MMM YYYY");
			}
		}
	} 
	
	day = day.replace('.', '');
	
	info('sentence:', state.action.sentence.yellow);
	info('local date:', day.yellow);
	
	forecasts.map(function (forecast) {
		forecast.date = moment(forecast.date).format("DD MMM YYYY");
		if (forecast.date.toLowerCase() == day.toLowerCase()) {
			condition = {
				text: forecast.skytextday,
				low: forecast.low,
				high: forecast.high
			}
		}
	});
	
	if (!condition) {
		if (!wakeup) {
			return Avatar.speak("Impossible de te donner la météo sans date",state.client, function(){
					Avatar.Speech.end(state.client);
				});
			return callback();
		} else {
			callback({'tts': 'Il me manque la date pour te donner la météo'});
			wakeup = false;
			return;
		}
	}
	info('Condition:', condition.text.yellow);
	
	var tag;
	state.action.tokens.map(function (token) {
		Config.modules.meteo.rules.map(function (rule) {
			if (token == rule) tag = rule;
		});
	});		

	if (!tag) {
		if (!wakeup) {
			return Avatar.speak("Je n'ai pas pu retrouver la météo",state.client, function(){
					Avatar.Speech.end(state.client);
			});
			return callback();
		} else {
			callback({'tts': 'Je n\'ai pas pu retrouver la météo'});
			wakeup = false;
		}
	} 
	
	var translated_condition, tts = '';
	Config.modules.meteo.translate.map(function (translate) {
		if (translate[0].toLowerCase() == condition.text.toLowerCase())
			 translated_condition = translate[1];
	});
	
	if (!translated_condition) translated_condition = condition.text; // par défaut
	
	if (Config.modules.meteo.answers[tag.toLowerCase()] && Config.modules.meteo.answers[tag.toLowerCase()][condition.text.toLowerCase().replace(/ /g,"_")])
		tts = Config.modules.meteo.answers[tag.toLowerCase()][condition.text.toLowerCase().replace(/ /gi,"_")] + '. ';
	
	tts = (state.action.location.toLowerCase() != Config.modules.meteo.default_location.toLowerCase()) ?  tts + "A " + state.action.location + ' ' : tts;
	
	tts += forday + translated_condition + ' avec des températures prévue entre ' + condition.low + ' et ' + condition.high + ' degré.';
	if (!wakeup) {
		Avatar.speak(tts,state.client, function(){
			Avatar.Speech.end(state.client);
		});
		callback();
	} else {
		callback({'tts': tts});
		wakeup = false;
	}
}





function forcastYahoo (state, callback) {
	
	moment.locale('en');
	
	if (state.action.sentence.toLowerCase().indexOf('today') != -1){
		var forday = 'Aujourd\'hui, le temps est ';
		var day = moment().format("DD MMM YYYY");
	} else if (state.action.sentence.toLowerCase().indexOf('after tomorrow') != -1){
		var forday = 'Après-demain, le temps sera ';
		var day = moment().add(2, 'days').format("DD MMM YYYY");
	} else if (state.action.sentence.toLowerCase().indexOf('tomorrow') != -1){
		var forday = 'Demain, le temps sera ';
		var day = moment().add(1, 'days').format("DD MMM YYYY");
	} else {
		var forday = 'Aujourd\'hui, le temps est ';
		var day = moment().format("DD MMM YYYY");
	}
	
	var forecasts = state.action.forecast;
	var condition;
	
	// décalage horaire...
	if (forecasts[0].date.toLowerCase() == moment().add(1, 'days').format("DD MMM YYYY").toLowerCase()){
		if (state.action.sentence.toLowerCase().indexOf('today') != -1) {
			var forday = 'avec le décalage horaire, c\'est déjà demain. Le temps est ';
			var day = moment().add(1, 'days').format("DD MMM YYYY");
		} else {
			if (state.action.sentence.toLowerCase().indexOf('tomorrow') != -1){
				var forday = 'avec le décalage horaire, c\'est après-demain. Le temps sera ';
				var day = moment().add(2, 'days').format("DD MMM YYYY");
			} else if (state.action.sentence.toLowerCase().indexOf('after tomorrow') != -1){
				var forday = 'avec le décalage horaire, c\'est dans 3 jours. Le temps sera ';
				var day = moment().add(3, 'days').format("DD MMM YYYY");
			}
		}
	} 
	
	day = day.replace('.', '');
	
	info('sentence:', state.action.sentence.yellow);
	info('local date:', day.yellow);
	
	forecasts.map(function (forecast) {
		if (forecast.date.toLowerCase() == day.toLowerCase()) {
			condition = forecast;
		}
	});
	
	if (!condition) {
		if (!wakeup) {
			return Avatar.speak("Impossible de te donner la météo sans date",state.client, function(){
					Avatar.Speech.end(state.client);
				});
			return callback();
		} else {
			callback({'tts': 'Il me manque la date pour te donner la météo'});
			wakeup = false;
			return;
		}
	}
	info('Condition:', condition.text.yellow);
	
	var tag;
	state.action.tokens.map(function (token) {
		Config.modules.meteo.rules.map(function (rule) {
			if (token == rule) tag = rule;
		});
	});		

	if (!tag) {
		if (!wakeup) {
			return Avatar.speak("Je n'ai pas pu retrouver la météo",state.client, function(){
					Avatar.Speech.end(state.client);
			});
			return callback();
		} else {
			callback({'tts': 'Je n\'ai pas pu retrouver la météo'});
			wakeup = false;
		}
	} 
	
	var translated_condition, tts = '';
	Config.modules.meteo.translate.map(function (translate) {
		if (translate[0].toLowerCase() == condition.text.toLowerCase())
			 translated_condition = translate[1];
	});
	
	if (!translated_condition) translated_condition = condition.text; // par défaut
	
	if (Config.modules.meteo.answers[tag.toLowerCase()] && Config.modules.meteo.answers[tag.toLowerCase()][condition.text.toLowerCase().replace(/ /g,"_")])
		tts = Config.modules.meteo.answers[tag.toLowerCase()][condition.text.toLowerCase().replace(/ /gi,"_")] + '. ';
	
	tts = (state.action.location.toLowerCase() != Config.modules.meteo.default_location.toLowerCase()) ?  tts + "A " + state.action.location + ' ' : tts;
	
	tts += forday + translated_condition + ' avec des températures prévue entre ' + condition.low + ' et ' + condition.high + ' degré.';
	if (!wakeup) {
		Avatar.speak(tts,state.client, function(){
			Avatar.Speech.end(state.client);
		});
		callback();
	} else {
		callback({'tts': tts});
		wakeup = false;
	}
}