var intro = {
    name: "intro",
    // introduction title
    title: "ALPS lab Stanford",
    // introduction text
    text:
        "Thank you for participating in our study. In this study you’ll answer questions about a story that you’ll read. It will approximately take <strong>???</strong> minutes.<br>Note: The story might include sensitive content.",
    legal_info:
        "<strong>LEGAL INFORMATION</strong>:<br><br>We invite you to participate in a research study on language production and comprehension.<br>Your experimenter will ask you to do a linguistic task such as reading sentences or words, naming pictures or describing scenes, making up sentences of your own, or participating in a simple language game.<br><br>You will be paid for your participation at the posted rate.<br><br>There are no risks or benefits of any kind involved in this study.<br><br>If you have read this form and have decided to participate in this experiment, please understand your participation is voluntary and you have the right to withdraw your consent or discontinue participation at any time without penalty or loss of benefits to which you are otherwise entitled. You have the right to refuse to do particular tasks. Your individual privacy will be maintained in all published and written data resulting from the study.<br>You may print this form for your records.<br><br>CONTACT INFORMATION:<br>If you have any questions, concerns or complaints about this research study, its procedures, risks and benefits, you should contact the Protocol Director Meghan Sumner at <br>(650)-725-9336<br><br>If you are not satisfied with how this study is being conducted, or if you have any concerns, complaints, or general questions about the research or your rights as a participant, please contact the Stanford Institutional Review Board (IRB) to speak to someone independent of the research team at (650)-723-2480 or toll free at 1-866-680-2906. You can also write to the Stanford IRB, Stanford University, 3000 El Camino Real, Five Palo Alto Square, 4th Floor, Palo Alto, CA 94306 USA.<br><br>If you agree to participate, please proceed to the study tasks.",
    // introduction's slide proceeding button text
    buttonText: "Begin experiment",
    // render function renders the view
    render: function() {
        var viewTemplate = $("#intro-view").html();

        $("#main").html(
            Mustache.render(viewTemplate, {
                picture: "images/alpslogo.png",
                title: this.title,
                text: this.text,
                legal_info: this.legal_info,
                button: this.buttonText
            })
        );

        var prolificId = $("#prolific-id");
        var IDform = $("#prolific-id-form");
        var next = $("#next");

        var showNextBtn = function() {
            if (prolificId.val().trim() !== "") {
                next.removeClass("nodisplay");
            } else {
                next.addClass("nodisplay");
            }
        };

        if (config_deploy.deployMethod !== "Prolific") {
            IDform.addClass("nodisplay");
            next.removeClass("nodisplay");
        }

        prolificId.on("keyup", function() {
            showNextBtn();
        });

        prolificId.on("focus", function() {
            showNextBtn();
        });

        // moves to the next view
        next.on("click", function() {
            if (config_deploy.deployMethod === "Prolific") {
                exp.global_data.prolific_id = prolificId.val().trim();
            }

            exp.findNextView();
        });
    },
    // for how many trials should this view be repeated?
    trials: 1
};

var main = {
    name: "main",
    title: "Questions",
    text: "Read the story and answer the questions below.",
    render: function(CT) {
        // fill variables in view-template
        var viewTemplate = $("#main-view").html();

        $("#main").html(
            Mustache.render(viewTemplate, {
                title: this.title,
                text: this.text,
                story_text: exp.trial_info.main_trials[CT].reproduction
            })
        );

        function create_obj(name){
            return {
                question: name,
                slider_changed: false,
                slider_val: $('#'+name+'_slider').val(),
                box_checked: false
            }
        };

        function update_sliderChange(name,obj){
            var slider = $('#'+name+'_slider');
            slider.on('change', function() {
                obj.slider_changed = true;
                obj.slider_val = slider.val();
                console.log("Yey, you changed the value to " + obj.slider_val);
            });
            var box = name + '_checkbox';
            $('input[id='+box+']').change(function(){
                if($(this).is(':checked')) {
                    obj.box_checked = true;
                    console.log("Yey, you checked the box!");
                } else {
                    obj.box_checked = false;
                    console.log("Yey, you unchecked the box!");
                }
            });
        };

        // Suspect
        var suspect_committedCrime = create_obj("suspect_committedCrime");
        update_sliderChange("suspect_committedCrime",suspect_committedCrime);

        var suspect_likability = create_obj("suspect_likability");
        update_sliderChange("suspect_likability",suspect_likability);

        var suspect_conviction = create_obj("suspect_conviction");
        update_sliderChange("suspect_conviction",suspect_conviction);

        var suspect_convictionJustified = create_obj("suspect_convictionJustified");
        update_sliderChange("suspect_convictionJustified",suspect_convictionJustified);

        // Author
        var author_likability = create_obj("author_likability");
        update_sliderChange("author_likability",author_likability);

        var author_trust = create_obj("author_trust");
        update_sliderChange("author_trust",author_trust);

        var author_judgmental = create_obj("author_judgmental");
        update_sliderChange("author_judgmental",author_judgmental);

        // Story
        var story_subjectivity = create_obj("story_subjectivity");
        update_sliderChange("story_subjectivity",story_subjectivity);

        var story_emotion = create_obj("story_emotion");
        update_sliderChange("story_emotion",story_emotion);

        // Reader
        var reader_emotion = create_obj("reader_emotion");
        update_sliderChange("reader_emotion",reader_emotion);

        var list = [suspect_committedCrime,suspect_likability,suspect_conviction,suspect_convictionJustified,author_likability,author_trust,author_judgmental,story_subjectivity,story_emotion,reader_emotion];

        function all_questions_answered(list){
            var i;
            for (i = 0; i < list.length; i++) { 
                if (list[i].slider_changed == false & list[i].box_checked == false){
                    console.log(list[i]);
                    return false;
                };
            };
            return true;
        };

        // event listener for buttons; when an input is selected, the response
        // and additional information are stored in exp.trial_info
        $("#next").on("click", function() {
            if (all_questions_answered(list) == true){
                var RT = Date.now() - startingTime; // measure RT before anything else
                var trial_data = {
                    trial_type: "mainForcedChoice",
                    trial_number: CT + 1,
                    story_reproduction: exp.trial_info.main_trials[CT].reproduction,
                    story_title:exp.trial_info.main_trials[CT].story_title,
                    generation:exp.trial_info.main_trials[CT].generation,
                    chain:exp.trial_info.main_trials[CT].chain,
                    suspect_committedCrime_slider: suspect_committedCrime.slider_val,
                    suspect_committedCrime_checkbox: suspect_committedCrime.box_checked,
                    suspect_likability_slider: suspect_likability.slider_val,
                    suspect_likability_checkbox: suspect_likability.box_checked,
                    suspect_conviction_slider: suspect_conviction.slider_val,
                    suspect_conviction_checkbox: suspect_conviction.box_checked,
                    suspect_convictionJustified_slider: suspect_convictionJustified.slider_val,
                    suspect_convictionJustified_checkbox: suspect_convictionJustified.box_checked,
                    author_likability_slider: author_likability.slider_val,
                    author_likability_checkbox: author_likability.box_checked,
                    author_trust_slider: author_trust.slider_val,
                    author_trust_checkbox: author_trust.box_checked,
                    author_judgmental_slider: author_judgmental.slider_val,
                    author_judgmental_checkbox: author_judgmental.box_checked,
                    story_subjectivity_slider: story_subjectivity.slider_val,
                    story_subjectivity_checkbox: story_subjectivity.box_checked,
                    story_emotion_slider: story_emotion.slider_val,
                    story_emotion_checkbox: story_emotion.box_checked,
                    reader_emotion_slider: reader_emotion.slider_val,
                    reader_emotion_checkbox: reader_emotion.box_checked
                };
                exp.trial_data.push(trial_data);
                exp.findNextView();
            } else {
                //display error "you haven't changed all sliders yet, please answer question..."
                console.log($("#error"));
                $("#error").css({"visibility": "visible"});;
            }
        });

        // record trial starting time
        var startingTime = Date.now();
    },
    trials: 1
};


var postTest = {
    name: "postTest",
    title: "Additional Info",
    text:
        "Answering the following questions is optional, but will help us understand your answers.",
    buttonText: "Continue",
    render: function() {
        var viewTemplate = $("#post-test-view").html();
        $("#main").html(
            Mustache.render(viewTemplate, {
                title: this.title,
                text: this.text,
                buttonText: this.buttonText
            })
        );

        $("#next").on("click", function(e) {
            // prevents the form from submitting
            e.preventDefault();

            // records the post test info
            exp.global_data.age = $("#age").val();
            exp.global_data.gender = $("#gender").val();
            exp.global_data.education = $("#education").val();
            exp.global_data.languages = $("#languages").val();
            exp.global_data.comments = $("#comments")
                .val()
                .trim();
            exp.global_data.endTime = Date.now();
            exp.global_data.timeSpent =
                (exp.global_data.endTime - exp.global_data.startTime) / 60000;

            // moves to the next view
            exp.findNextView();
        });
    },
    trials: 1
};

var thanks = {
    name: "thanks",
    message: "Thank you for taking part in this experiment!",
    render: function() {
        var viewTemplate = $("#thanks-view").html();

        // what is seen on the screen depends on the used deploy method
        //    normally, you do not need to modify this
        if (
            config_deploy.is_MTurk ||
            config_deploy.deployMethod === "directLink"
        ) {
            // updates the fields in the hidden form with info for the MTurk's server
            $("#main").html(
                Mustache.render(viewTemplate, {
                    thanksMessage: this.message
                })
            );
        } else if (config_deploy.deployMethod === "Prolific") {
            $("main").html(
                Mustache.render(viewTemplate, {
                    thanksMessage: this.message,
                    extraMessage:
                        "Please press the button below to confirm that you completed the experiment with Prolific<br />" +
                        "<a href=" +
                        config_deploy.prolificURL +
                        ' class="prolific-url">Confirm</a>'
                })
            );
        } else if (config_deploy.deployMethod === "debug") {
            $("main").html(Mustache.render(viewTemplate, {}));
        } else {
            console.log("no such config_deploy.deployMethod");
        }

        exp.submit();
    },
    trials: 1
};
