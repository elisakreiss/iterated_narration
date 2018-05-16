var intro = {
    // introduction title
    "title": "Welcome!",
    // introduction text
    "text": "Thank you for participating in our study. In this study, you will read three stories and are asked to reproduce them as accurately as you can.",
    // introduction's slide proceeding button text
    "buttonText": "Begin experiment",
    // render function renders the view
    render: function() {
        
        viewTemplate = $('#intro-view').html();
        $('#main').html(Mustache.render(viewTemplate, {
            title: this.title,
            text: this.text,
            button: this.buttonText
        }));

        // moves to the next view
        $('#next').on('click', function(e) {
            exp.findNextView();
        });

    },
    // for how many trials should this view be repeated?
    trials: 1
}

var instructions = {
     // instruction's title
    "title": "Instructions",
    // instruction's text
    "text": "In each of the three trials of this experiment, you will read a short story. You are then asked to retell this story. <strong>Please do not take notes.</strong> Make sure to retell the story immediately after reading the original.",
    // instuction's slide proceeding button text
    "buttonText": "Let's go!",
    render: function() {

        viewTemplate = $("#instructions-view").html();
        $('#main').html(Mustache.render(viewTemplate, {
            title: this.title,
            text: this.text,
            button: this.buttonText
        }));

        // moves to the next view
        $('#next').on('click', function(e) {
            exp.findNextView();
        }); 

    },
    trials: 1
}


var main = {
	
	trials : 3,
	
    render : function(CT) {

		var retrieved_data = "huhu"
		
		$.ajax({
				type: 'GET',
				url: "https://babe-backend.herokuapp.com/api/retrieve_experiment/1",
				crossDomain: true,
				success: function (responseData, textStatus, jqXHR) {
					$("#datacontainer").text(JSON.stringify(responseData));
					retrieved_data = JSON.stringify(responseData);
//					console.log(JSON.stringify(responseData))
					callback(retrieved_data)
				}
			  });
		
		function callback(rd) {
			
			retrieved_data = rd	
		
			console.log(rd)
			
			function show(obj) {
				$("#"+obj).css({"visibility": "visible"});

				if (obj=="next"){
					$("#"+obj).css({"display": "block"});
				} else {
					$("#"+obj).css({"display": "inline"});
				}
			};

			function hide(obj) {
				$("#"+obj).css({"visibility": "hidden"});
				$("#"+obj).css({"display": "none"});
			};  

			var recap_instruction = "After you read the story, press 'Ready!'. Use the upcoming text field to reproduce the story, as best as you can. Then press 'Done!'.";

			// [[1]]

	//		console.log(this.retrieved_data.responseJSON)

			// fill variables in view-template
			var viewTemplate = $('#main-view').html();
			$('#main').html(Mustache.render(viewTemplate, {
				recap_instruction: recap_instruction,
				story:    exp.trial_info.main_trials[CT].story,
				button1:  "Ready!",
				button2:  "Done!"
			}));

			// update the progress bar based on how many trials there are in this round
			var filled = exp.currentTrialInViewCounter * (180 / exp.views_seq[exp.currentViewCounter].trials);
			$('#filled').css('width', filled);

			// event listener for buttons; when an input is selected, the response
			// and additional information are stored in exp.trial_info
			$('#start_repro').on('click', function(e) {
				hide("story");
				hide("start_repro");
				show("reproduction");
				show("next");
				// $("reproduction").focus();
			}); 

			// event listener for buttons; when an input is selected, the response
			// and additional information are stored in exp.trial_info
			$('#next').on('click', function(e) {
				// RT = Date.now() - startingTime; // measure RT before anything else
				trial_data = {
					trial_type: "reproductionDemo",
					trial_number: CT + 1,
					story: exp.trial_info.main_trials[CT].title,
					reproduction: $('#reproduction').val(),
					// RT: RT
				};
				exp.trial_data.push(trial_data);
				exp.findNextView();
			}); 

			// record trial starting time
			startingTime = Date.now();
		}
    }
};

var postTest = {
    "title": "Additional Info",
    "text": "Answering the following questions is optional, but will help us understand your answers.",
    "buttonText": "Continue",
    render : function() {

        viewTemplate = $('#post-test-view').html();
        $('#main').html(Mustache.render(viewTemplate, {
            title: this.title,
            text: this.text,
            buttonText: this.buttonText
        }));

        $('#next').on('click', function(e) {
            // prevents the form from submitting
            e.preventDefault();

            // records the post test info
            exp.global_data.age = $('#age').val();
            exp.global_data.gender = $('#gender').val();
            exp.global_data.education = $('#education').val();
            exp.global_data.languages = $('#languages').val();
            exp.global_data.comments = $('#comments').val().trim();
            exp.global_data.endTime = Date.now();
            exp.global_data.timeSpent = (exp.global_data.endTime - exp.global_data.startTime) / 60000;

            // moves to the next view
            exp.findNextView();
        })

    },
    trials: 1
};

var thanks = {
    "message": "Thank you for taking part in this experiment!",
    render: function() {

        viewTemplate = $('#thanks-view').html();

        // what is seen on the screen depends on the used deploy method
		//    normally, you do not need to modify this
        if ((config_deploy.is_MTurk) || (config_deploy.deployMethod === 'directLink')) {
            // updates the fields in the hidden form with info for the MTurk's server
            $('#main').html(Mustache.render(viewTemplate, {
                thanksMessage: this.message,
            }));
        } else if (config_deploy.deployMethod === 'Prolific') {
            var prolificURL = 'https://prolific.ac/submissions/complete?cc=' + config_deploy.prolificCode;

            $('main').html(Mustache.render(viewTemplate, {
                thanksMessage: this.message,
                extraMessage: "Please press the button below<br />" + '<a href=' + prolificURL +  ' class="prolific-url">Finished!</a>'
            }));
        } else if (config_deploy.deployMethod === 'debug') {
            $('main').html(Mustache.render(viewTemplate, {}));
        } else {
            console.log('no such config_deploy.deployMethod');
        }

        exp.submit();

    },
    trials: 1
}