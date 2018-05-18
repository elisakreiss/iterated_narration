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

        $('#next').focus();

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
    "text": "In each of the three trials of this experiment, you will read a short story. You are then asked to retell this story. <strong>Please do not take notes.</strong> Make sure to retell the story immediately after reading the original. <p><strong>Notice:</strong> You may experience lags during the experiment, because the experiment communicates with a data base. Please just be patient, as the experiment should resume soon enough.",
    // instuction's slide proceeding button text
    "buttonText": "Let's go!",
    render: function() {

        viewTemplate = $("#instructions-view").html();
        $('#main').html(Mustache.render(viewTemplate, {
            title: this.title,
            text: this.text,
            button: this.buttonText
        }));

        $('#next').focus();

        // moves to the next view
        $('#next').on('click', function(e) {
            $('#next').html('Loading...');
            $('#next').prop('disabled', true);
            exp.findNextView();
        }); 

    },
    trials: 1
}


var main = {
	
	trials : 3,
	
    render : function(CT) {

        // record first database load starting time
        var startingTimeMain = Date.now();

        var generation_max = 3;

		var retrieved_data;
		
		$.ajax({
				type: 'GET',
				url: "https://babe-backend.herokuapp.com/api/retrieve_experiment/4",
				crossDomain: true,
				success: function (responseData, textStatus, jqXHR) {
					// retrieved_data = JSON.stringify(responseData);
                    retrieved_data = responseData;
					callback("success");
				},
                statusCode: {
                    404: function() {
                        // alert( "page not found" );
                        callback("error");
                    }
                }
			  });
		
		function callback(state) {

            // record first database load ending time
            var endingTimeMain = Date.now();

            console.log(state);
            console.log(retrieved_data);
			
            // 
            // HELPER FUNCTIONS
            // 
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

            // returns true if chain number is already in chain_ends, otherwise false
            function checkChainPresence(chain) {
                for (var chain_end=0; chain_end<chain_ends.length; chain_end++) {
                    if (chain == chain_ends[chain_end]["chain"]) {
                        return chain_end;
                    }
                }
                return "not there";
            };

            function make_chainid() {
              var chain_id = "";
              var values = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

              for (var i = 0; i < 16; i++)
                chain_id += values.charAt(Math.floor(Math.random() * values.length));

              return chain_id;
            };


            // 
            // Decide on stimulus to show; define chain and generation
            // 
            var story_kind = exp.trial_info.main_trials[CT].title;
            var chain_ends = [];
            var chain;
            var generation;
            var story_text;

            if (state == 'success') {

                for (var participant=0; participant<retrieved_data.length; participant++){
                    for (var trial=0; trial<retrieved_data[participant].length; trial++){

                        var current_trial = retrieved_data[participant][trial];

                        if (current_trial["story_title"] == story_kind) {

                            var new_chain_end = {
                                chain: current_trial["chain"],
                                generation: current_trial["generation"],
                                deadend: current_trial["deadend"],
                                reproduction: current_trial["reproduction"]
                            };

                            var pos_in_chain_ends = checkChainPresence(current_trial["chain"]);

                            // if chain not yet in chain_ends, append
                            if (pos_in_chain_ends == "not there") {
                                chain_ends.push(new_chain_end);
                            } else {
                                // if generation of current trial is bigger than already saved one, replace it with current trial
                                if (current_trial["generation"] > chain_ends[pos_in_chain_ends]["generation"]) {
                                    chain_ends[pos_in_chain_ends] = new_chain_end;
                                // else if they are equal, keep the one that is not a deadend (if both are, keep saved one)
                                } else if ((current_trial["generation"] == chain_ends[pos_in_chain_ends]["generation"]) & (!current_trial["deadend"])) {
                                    chain_ends[pos_in_chain_ends] = new_chain_end;
                                }
                                // else keep saved one 
                            }
                        }
                    }
                };

                // add one new seed to chain_ends to enable the creation of new chains even when others are still open
                var new_chain = {
                    chain: make_chainid(),
                    generation: 0,
                    deadend: false,
                    reproduction: exp.trial_info.main_trials[CT].text
                };
                chain_ends.push(new_chain);
                console.log("chain_ends down here");
                console.log(chain_ends);
                // choose chain_end that will be continued here
                var shuffled = _.shuffle(chain_ends);
                var found_chainend = false;

                while (!found_chainend){
                    for (var chain_end=0; chain_end<shuffled.length; chain_end++) {

                        var current_chainend = shuffled[chain_end];
                        // each chain_end is acceptable that is not a deadend
                        if (current_chainend["deadend"]==false) {
                            found_chainend = true;

                            story_text = current_chainend["reproduction"];
                            chain = current_chainend["chain"];
                            generation = current_chainend["generation"]+1;
                            break; // but this doesn't make me exit for loop, right? 
                        }
                    }
                    // if there is no story in our data base that fits and is not a deadend, start with new seed
                    if (found_chainend == false) {
                        found_chainend = true;
                        story_text = exp.trial_info.main_trials[CT].text;
                        // if two people start at the same time, both can still be used, but system would fail if they get the same number
                        // chain = chain_ends.length;
                        chain = make_chainid();
                        generation = 1;
                    }
                }
            // else (if ajax GET call throws 404 error, because, e.g., the database doesn't exist yet, create new chain)
            } else {
                console.log("error was thrown");
                story_text = exp.trial_info.main_trials[CT].text;
                chain = make_chainid();
                generation = 1;
            }



            // fill variables in view-template
            var viewTemplate = $('#main-view').html();
            $('#main').html(Mustache.render(viewTemplate, {
                recap_instruction: recap_instruction,
                story_text:        story_text,
                button1:           "Ready!",
                button2:           "Done!"
            }));

            $('#start_repro').focus();

            // update the progress bar based on how many trials there are in this round
            var filled = exp.currentTrialInViewCounter * (180 / exp.views_seq[exp.currentViewCounter].trials);
            $('#filled').css('width', filled);

            var recap_instruction = "After you read the story, press 'Ready!'. Use the upcoming text field to reproduce the story, as best as you can. Then press 'Done!'.";

            // event listener for buttons; when an input is selected, the response
            // and additional information are stored in exp.trial_info
            $('#start_repro').on('click', function(e) {
                hide("story_text");
                hide("start_repro");
                show("reproduction");
                show("next");
                $('#next').focus(); // you want to delete this before deploying this experiment
                // $("reproduction").focus();
            }); 

			// event listener for buttons; when an input is selected, the response
			// and additional information are stored in exp.trial_info
			$('#next').on('click', function(e) {
                if (state == "error") {
                    trial_data = {
                        trial_type: "reproductionDemo",
                        trial_number: CT + 1,
                        story_title: story_kind,
                        story_text: story_text,
                        reproduction: $('#reproduction').val(),

                        // this is just default for now, you need to change this!
                        deadend: false,
                        chain: chain,
                        generation: generation,
                        RT_main: "NA",
                        RT_submit: "NA"
                    };
                    exp.trial_data.push(trial_data);
                    exp.findNextView();
                } else {
                    // record second database load starting time
                    var startingTimeSubmit = Date.now();      

                    var retrieved_data2;
            
                    $.ajax({
                            type: 'GET',
                            url: "https://babe-backend.herokuapp.com/api/retrieve_experiment/4",
                            crossDomain: true,
                            success: function (responseData, textStatus, jqXHR) {
                                // retrieved_data = JSON.stringify(responseData);
                                retrieved_data2 = responseData;
                                callback2(retrieved_data2);
                            }
                          });
                    
                    function callback2(rd) {

                        // record second database load starting time
                        var endingTimeSubmit = Date.now(); 

                        var deadend = false;

                        for (var participant=0; participant<retrieved_data.length; participant++){
                            for (var trial=0; trial<retrieved_data[participant].length; trial++){

                                var db_trial = retrieved_data[participant][trial];
                                // if story, chain and generation are the same, set deadend to false, since someone has submitted this in the meantime already
                                if (((db_trial["story_title"] == story_kind) & (db_trial["chain"] == chain) & (db_trial["generation"] == generation)) || (generation == generation_max)) {
                                    deadend = true;
                                }
                            }
                        }

                        trial_data = {
                            trial_type: "reproductionDemo",
                            trial_number: CT + 1,
                            story_title: story_kind,
                            story_text: story_text,
                            reproduction: $('#reproduction').val(),
                            deadend: deadend,
                            chain: chain,
                            generation: generation,
                            RT_main: endingTimeMain - startingTimeMain,
                            RT_submit: endingTimeSubmit - startingTimeSubmit
                        };
                        console.log("trial_data");
                        console.log(trial_data);
                        exp.trial_data.push(trial_data);
                        exp.findNextView();
                        
                    };
                }
			}); 
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
            exp.global_data.student_id = $('#student_id').val();
            exp.global_data.age = $('#age').val();
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