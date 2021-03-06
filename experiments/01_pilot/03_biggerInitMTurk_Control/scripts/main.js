// when the DOM is created and JavaScript code can run safely,
// the experiment initialisation is called
$('document').ready(function() {
	exp.init();
	// prevent scrolling when space is pressed (firefox does it)
	window.onkeydown = function(e) {
	if (e.keyCode == 32 && e.target == document.body) {
		e.preventDefault();
	}
	};
});

// empty shell for 'exp' object; to be filled with life by the init() function
var exp = {};

exp.init = function(){

	// allocate storage room for global data, trial data, and trial info
	this.global_data = {};
	this.trial_data = [];
	this.trial_info = {};

	// record current date and time
	this.global_data.startDate = Date();
	this.global_data.startTime = Date.now();

	// call user-defined costumization function
	this.customize()
	
	// flatten views_seq after possible 'loop' insertions
	this.views_seq = _.flatten(exp.views_seq)
	
	// insert a Current Trial counter for each view
	_.map(exp.views_seq, function(i) {i.CT = 0})
	
	// initialize procedure
	this.currentViewCounter = 0;
	this.currentTrialCounter = 0;
	this.currentTrialInViewCounter = 0;
	this.currentView = this.findNextView();
	
	// user does not (should not) change the following information
	// checks the config _deploy.deployMethod is MTurk or MTurkSandbox,
	// sets the submission url to MTukr's servers
	config_deploy.MTurk_server = config_deploy.deployMethod == "MTurkSandbox" ?
		"https://workersandbox.mturk.com/mturk/externalSubmit" : // URL for MTurk sandbox
		config_deploy.deployMethod == 'MTurk' ?
		"https://www.mturk.com/mturk/externalSubmit" : // URL for live HITs on MTurk
		""; // blank if deployment is not via MTurk
	// if the config_deploy.deployMethod is not debug, then liveExperiment is true
	config_deploy.liveExperiment = config_deploy.deployMethod !== "debug";
	config_deploy.prolificCode = '9BTAOPQD';
	config_deploy.is_MTurk = config_deploy.MTurk_server !== "";
	config_deploy.submissionURL = config_deploy.deployMethod == "localServer"? "http://localhost:4000/api/submit_experiment": "https://babe-backend.herokuapp.com/api/submit_experiment/13"
	console.log("deployMethod: " + config_deploy.deployMethod);
	console.log("live experiment: " + config_deploy.liveExperiment);
	console.log("runs on MTurk: " + config_deploy.is_MTurk);
	console.log("MTurk server: " + config_deploy.MTurk_server);
}



// navigation through the views and steps in each view;
// shows each view (in the order defined in 'config_general') for
// the given number of steps (as defined in 'config_general')
exp.findNextView = function() {
	var currentView = this.views_seq[this.currentViewCounter];
	if (this.currentTrialInViewCounter < currentView.trials) {
		currentView.render(currentView.CT);
	} else {
		this.currentViewCounter ++;
		currentView = this.views_seq[this.currentViewCounter];
		this.currentTrialInViewCounter = 0;
		currentView.render(currentView.CT);
	}
	// increment counter for how many trials we have seen of THIS view during THIS occurrence of it
	this.currentTrialInViewCounter ++;
	// increment counter for how many trials we have seen in the whole experiment
	this.currentTrialCounter ++;
	// increment counter for how many trials we have seen of THIS view during the whole experiment
	this.views_seq[this.currentViewCounter].CT ++;
	
	return currentView;
};

// submits the data
exp.submit = function() {
	// adds columns with NA values
	var addEmptyColumns = function(trialData) {
		var columns = [];

		for (var i=0; i<trialData.length; i++) {
			for (prop in trialData[i]) {
				if ((trialData[i].hasOwnProperty(prop)) && (columns.indexOf(prop) === -1)) {
					columns.push(prop);
				}
			}
		}

		for (var j=0; j<trialData.length; j++) {
			for (var k=0; k<columns.length; k++) {
				if (!trialData[j].hasOwnProperty(columns[k])) {
					trialData[j][columns[k]] = 'NA';
				}
			}
		}

		return trialData;
	};

	var formatDebugData = function(data) {
		var output = "<table id='debugresults'>";

		var trials = data.trials;
		delete data.trials;

		var t = trials[0];

		output += "<thead><tr>";

		for (var kt in t) {
			if (t.hasOwnProperty(kt)) {
				output += "<th>" + kt + "</th>";
			}
		}

		for (var kd in data) {
			if (data.hasOwnProperty(kd)) {
				output += "<th>" + kd + "</th>";
			}
		}

		output += "</tr></thead>";

		output += "<tbody><tr>";

		for (var i = 0; i < trials.length; i++) {
			var currentTrial = trials[i];
			for (var trialKey in currentTrial) {
				if (t.hasOwnProperty(trialKey)) {
					entry = String(currentTrial[trialKey])
					output += "<td>" + entry.replace(/ /g, "&nbsp;") + "</td>";
				}
			}

			for (var dataKey in data) {
				if (data.hasOwnProperty(dataKey)) {
					entry = String(data[dataKey])
					output += "<td>" + entry.replace(/ /g, "&nbsp;") + "</td>";
				}
			}

			output += "</tr>";
		}

		output += "</tbody></table>";

		return output;
	};

	var flattenData = function(data){
		var trials = data.trials;
		delete data.trials;
		var out = _.map(trials, function(t) {return _.merge(t, data);});
		return out;
	};

	// construct data object for output
	var data = {
		'author': config_deploy.author,
		'experiment_id': config_deploy.experiment_id,
		'description': config_deploy.description,
		'trials': addEmptyColumns(exp.trial_data)
	};

	// parses the url to get the assignmentId and workerId
	var getHITData = function() {
		var url = window.location.href;
		var qArray = url.split('?');
		qArray = qArray[1].split('&');
		var HITData = {};

		for (var i=0; i<qArray.length; i++) {
			HITData[qArray[i].split('=')[0]] = qArray[i].split('=')[1];
		}

		return HITData;
	};
	
	// add more fields depending on the deploy method
	if (config_deploy.is_MTurk) {
		var HITData = getHITData();
		// MTurk expects a key 'assignmentId' for the submission to work,
		// that is why is it not consistent with the snake case that the other keys have
		data['assignmentId'] = HITData['assignmentId'];
		data['workerId'] = HITData['workerId'];
		data['HITId'] = HITData['HITId'];

		// creates a form with assignmentId input for the submission ot MTurk
		var form = jQuery('<form/>', {
			id: 'mturk-submission-form',
			action: config_deploy.MTurk_server
		}).appendTo('.thanks-templ')
		var dataForMTurk = jQuery('<input/>', {
			type: 'hidden',
			name: 'data'
		}).appendTo(form);
		// MTurk expects a key 'assignmentId' for the submission to work,
		// that is why is it not consistent with the snake case that the other keys have
		var assignmentId = jQuery('<input/>', {
			type: 'hidden',
			name: 'assignmentId',
			value: HITData['assignmentId']
		}).appendTo(form);
	} else if (config_deploy.deployMethod === 'Prolific') {
		console.log();
	} else if (config_deploy.deployMethod === 'directLink'){
		console.log();
	} else if (config_deploy.deployMethod === 'debug') {
		console.log();
	} else {
		console.log('no such config_deploy.deployMethod');
	}

	// merge in global data accummulated so far
	// this could be unsafe if 'exp.global_data' contains keys used in 'data'!!
	data = _.merge(exp.global_data, data);

	// if the experiment is set to live (see config.js liveExperiment)
	// the results are sent to the server
	// if it is set to false
	// the results are displayed on the thanks slide
	if (config_deploy.liveExperiment) {
		console.log('submits');
	// submitResults(config_deploy.contact_email, config_deploy.submissionURL, data);
		submitResults(config_deploy.contact_email, config_deploy.submissionURL, flattenData(data));
	} else {
		// hides the 'Please do not close the tab.. ' message in debug mode
		console.log(data)
		$('.warning-message').addClass('nodisplay');
		jQuery('<h3/>', {
			text: 'Debug Mode'
		}).appendTo($('.view'));
		jQuery('<div/>', {
			class: 'debug-results',
			html: formatDebugData(data)
		}).appendTo($('.view'));
	}
};

var processTrialsData = function(rows) {
	var toReturn = [];
	var headers = rows[0];
	for (var indexTrial = 1; indexTrial < rows.length; indexTrial++) {
		var thisTrial = {};
		for (var indexKey = 0; indexKey < headers.length; indexKey++) {
			thisTrial[headers[indexKey]] = rows[indexTrial][indexKey];
		}
		toReturn.push(thisTrial);
	}
	return toReturn;
};

var prepareDataFromCSV = function(practiceTrialsFile, trialsFile) {
	var data = {
		'out': [] // mandatory field to store results in during experimental trials
	};

	// Need to use such a callback since AJAX is async.
	var addToContainer = function(container, name, results) {
		container[name] = results;
	};


	$.ajax({
		url: practiceTrialsFile,
		dataType: "text",
		crossDomain: true,
		success: function(file, textStatus, jqXHR) {
			addToContainer(data, "practice_trials", processTrialsData(CSV.parse(file)));
		}
	});

	$.ajax({
		url: trialsFile,
		dataType: "text",
		crossDomain: true,
		success: function(file, textStatus, jqXHR) {
			addToContainer(data, "trials", _.shuffle(processTrialsData(CSV.parse(file))));
		}
	});


	return data;
};

// functions to expand 'loop' statements `from views_seq`
var loop = function(arr, count, shuffleFlag) {
	return _.flatMapDeep(_.range(count), function(i) {return arr})
}
var loopShuffled = function(arr, count) {
	return _.flatMapDeep(_.range(count), function(i) {return _.shuffle(arr)})		
	
}