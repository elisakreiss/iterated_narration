var my_node_id;

// Consent to the experiment.
$(document).ready(function() {

    // do not allow user to close or reload
    prevent_exit = true;

    // Print the consent form.
    $("#print-consent").click(function() {
        window.print();
    });

    // Consent to the experiment.
    $("#consent").click(function() {
        store.set("hit_id", getUrlParameter("hit_id"));
        store.set("worker_id", getUrlParameter("worker_id"));
        store.set("assignment_id", getUrlParameter("assignment_id"));
        store.set("mode", getUrlParameter("mode"));

        allow_exit();
        window.location.href = '/instructions';
    });

    // Consent to the experiment.
    $("#no-consent").click(function() {
        allow_exit();
        window.close();
    });

    // Show full instructions
    $("#go-specific").click(function() {
        $("#specific").show();
        $("#go-specific").hide();
    });

    // Consent to the experiment.
    $("#go-to-experiment").click(function() {
        allow_exit();
        window.location.href = '/exp';
    });

    // $("#finish-reading").click(function() {
    //     $("#stimulus").hide();
    //     $("#response-form").show();
    //     $("#submit-response").removeClass('disabled');
    //     $("#submit-response").html('Submit');
    // });

    $("#finish-reading").click(function() {
        $("#quest-familiar").show();
        $("#finish-reading").hide();
    });

    $("#submit-quest").click(function() {
        $("#stimulus").hide();
        $("#quest-familiar").hide();
        $("#response-form").show();
        $("#submit-response").removeClass('disabled');
        $("#submit-response").html('Submit');
    });

    $("#submit-response").click(function() {
        $("#submit-response").addClass('disabled');
        $("#submit-response").html('Sending...');

        var response = $("#reproduction").val();

        $("#reproduction").val("");

        reqwest({
            url: "/info/" + my_node_id,
            method: 'post',
            data: {
                contents: response,
                info_type: "Info"
            },
            success: function (resp) {
                create_agent();
            }
        });

    });

    // Submit the questionnaire.
    $("#submit-questionnaire").click(function() {
        submitResponses();
        console.log("log this stuff");
        console.log(dallinger.models.Participant.all_questions);
    });
});

// Create the agent.
var create_agent = function() {
    $('#finish-reading').prop('disabled', true);
    reqwest({
        url: "/node/" + participant_id,
        method: 'post',
        type: 'json',
        success: function (resp) {
            $('#finish-reading').prop('disabled', false);
            my_node_id = resp.node.id;
            get_info(my_node_id);
        },
        error: function (err) {
            console.log(err);
            errorResponse = JSON.parse(err.response);
            if (errorResponse.hasOwnProperty('html')) {
                $('body').html(errorResponse.html);
            } else {
                allow_exit();
                go_to_page('questionnaire');
            }
        }
    });
};

var get_info = function() {
    reqwest({
        url: "/node/" + my_node_id + "/received_infos",
        method: 'get',
        type: 'json',
        success: function (resp) {
            console.log(resp)
            var story = resp.infos[0].contents;
            var storyHTML = markdown.toHTML(story);
            $("#story").html(storyHTML);
            $("#stimulus").show();
            $("#quest-familiar").hide();
            $("#response-form").hide();
            $("#finish-reading").show();
        },
        error: function (err) {
            console.log(err);
            var errorResponse = JSON.parse(err.response);
            $('body').html(errorResponse.html);
        }
    });
};

var create_agent_failsafe = function() {
    if ($("#story").html == '<< loading >>') {
        create_agent();
    }
};
