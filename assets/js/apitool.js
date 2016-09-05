$(document).ready(function() {
    /* apitool js */
    console.log('apitool.js JqueryVersion', $.fn.jquery);// v1.11.1
    var freshdata = 0;// false = from database : true = from LMS
    var nextcount = 0;// question num for question details modal
    var selectedTitle = '';// quiz.title for question details modal
    var quests = [];// selected quiz questions
    
    $('#fresh-data').change(function(){
        // 0 or 1 for php functions
        if ( $(this).prop( "checked" ) ) {
           freshdata = 1;// true
        } else {
           freshdata = 0;// false
        }
        console.log('freshdata:',freshdata, $(this).prop( "checked" ));
    });
    
    $('#clear-results').on('click', function(e){
        $('.results').empty();
        //$('#data-results').html('');
    });
    
    // course, account, enrollments, refreshCache?
    // modules  
    $('#getAllModules').on('click', function(e){
        // call function in Apitool.php : freshdata?
        $.request('onGetAllModules', {
            data: {'freshdata':freshdata},
            dataType: 'text',// returning info type. returns a json string
            success: function(data) { // data contains the returning result
                //console.log('data:', data.length, data);// len 90,000 chars
                var res =$.parseJSON(data);
                //console.log('res:', res.length, res);
                var result=$.parseJSON(res.result);
                console.log('result:', result.length, result);
                //$('#data-results').html(result.length+' Modules.');
                $('.results').append(result.length+' Modules:');
                
                // display module names, items count
                for (var i=0; i<result.length; i++) {
                    var content = '<div id='+result[i].module_id+' class="module alert alert-info">';// blue
                    content += result[i].name+' : Items '+result[i].items_count;
                    //content += '';
                    content += '</div>';
                    $('.results').append(content);
                }
                
                $('.module').on('click', function(e) {
                    e.preventDefault();
                    // find this module
                    var mod= $.grep(result, function(elem, indx){
                        return elem.module_id == e.target.id; }
                    );
                    console.log('module:',e.target.id, mod[0]);
                });
            }
        });
    });
    
    // assignments
    $('#getAllAssignments').on('click', function(e){
        // call function in Apitool.php : freshdata?
        $.request('onGetAllAssignments', {
            data: {'freshdata':freshdata},
            dataType: 'text',// returning info type. returns a json string
            success: function(data) {
                //console.log('data:', data.length, data);
                var res =$.parseJSON(data);
                //console.log('res:', res.length, res);
                var result=$.parseJSON(res.result);
                console.log('result:', result.length, result);
                //$('#data-results').html(result.length+' Modules.');
                $('.results').append(result.length+' Assignments:');
                
                // display assignment names, points possible
                for (var i=0; i<result.length; i++) {
                    var content = '<div id='+result[i].assignment_id+' class="assignment alert alert-info">';// blue
                    content += result[i].name+' : points possible '+result[i].points_possible;
                    if (result[i].quiz_id != null) {
                        content += ' : Quiz '+result[i].quiz_id;
                    }
                    if (result[i].tags != '') {
                        content += ' : Tags '+result[i].tags;
                    }
                    content += '</div>';
                    $('.results').append(content);
                }
                // no other details to show?
                
            }
        });
    });
    
    // quizzes
    $('#getAllQuizzes').on('click', function(e){
        // call function in Apitool.php : freshdata?
        $.request('onGetAllQuizzes', {
            data: {'freshdata':freshdata},
            dataType: 'text',// returning info type. returns a json string
            success: function(data) { // data contains the returning result
                //console.log(data);// quiz contains questions
                var result =$.parseJSON(data);
                console.log('result:', result.length, result);
                //$('#data-results').html(result.length+' Quizzes. Click one to see the questions.');
                $('.results').append(result.length+' Quizzes:');
                
                /* construct clickable items with id=quizid to display questions
                    put in two columns inc row to count, reset : inc colm
                */
                //var count = Math.ceil(data.length/2);
                //var col=0;
                //var row=0;
                for (var i=0; i<result.length; i++) {
                    var content = '<div id='+result[i].quiz_id+' class="quiz alert alert-info">';// blue
                    content += result[i].title + ' : total questions: '+result[i].questions.length;//.question_count;
                    //content += ' worth: '+data[i].points_possible;
                    content += '</div>';
                    $('.results').append(content);
                    //$('#col_'+col).append(content);
                    //row++;
                    //if (row==count) { row=0; col++; }
                }
                
                //click quiz to view questions
                $('.quiz').on('click', function(e) {
                    e.preventDefault();
                    // find this quiz
                    var quiz= $.grep(result, function(elem, indx){
                        return elem.quiz_id == e.target.id; }
                    );
                    console.log('quiz:', e.target.id, quiz[0]);
                    selectedTitle = quiz[0].title;
                    quests=quiz[0].questions;
                    nextcount=0;// first question
                    constructQuestion(nextcount); 
                    $('#quest-details').modal('show');
                });
            }
        });
    });

    
    // see question details 
    $('#nextbtn').on('click', function(e) {
        e.preventDefault();
        //next question
		nextcount++;
		if(nextcount==quests.length){ nextcount=0; }
		constructQuestion(nextcount);
    });
    $('#backbtn').on('click', function(e) {
        e.preventDefault();
        //previous question
		nextcount--;
		if(nextcount<0){ nextcount=quests.length-1; }
		constructQuestion(nextcount);
    });

	/*
	*   index is first selected question to see in #quest-details modal
    *   construct: type, points, question, answers and comments
	*/
	function constructQuestion(index)
	{	
		var quest = quests[index];
		$('#quest-details-title').html(selectedTitle+' - question '+(index+1));
		$('#qtype').html('Type: '+quests[index].type);
		$('#qpoints').html('Points: '+quests[index].points_possible);
		var txt = quests[index].text;//.toString();
			txt = $.parseHTML(txt);
			txt = txt[0].textContent;
		$('#qtext').html(txt);
		var answers= $.parseJSON(quests[index].answers);
		var ansdiv='';
		//console.log(answers);//for each
		for(var i=0; i<answers.length; i++)
		{
			if(answers[i].weight==0){
				ansdiv+='<div class="alert alert-danger">';
			} else {
				ansdiv+='<div class="alert alert-success">';
			}
			ansdiv+=answers[i].text;
			ansdiv+='</div>';
		}
		$('#qanswers').html('<hr/>Answers:<br/>'+ansdiv);
		
		var comdiv='';
		if(quests[index].correct_comments!= "")
		{
			comdiv+='<div class=bg-success>';
			comdiv+=quests[index].correct_comments;
			comdiv+='</div>';
		}
		if(quests[index].incorrect_comments != "")
		{
			comdiv+='<div class=bg-danger>';
			comdiv+=quests[index].incorrect_comments;
			comdiv+='</div>';
		}
		if(quests[index].neutral_comments != "")
		{
			comdiv+='<div class=bg-warning>';
			comdiv+=quests[index].neutral_comments;
			comdiv+='</div>';
		}
		$('#qfeedback').html('<hr/>Comments:<br/>'+comdiv);
	}
    
    // End document.ready
});
