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
        //console.log('freshdata:',freshdata, $(this).prop( "checked" ));
    });
    
    $('#clear-results').on('click', function(e){
        $('.results').empty();
        //$('#data-results').html('');
    });
    
    // course, enrollments, refreshCache?, account 16?
    // Assignment Groups
    $('#getCourse').on('click', function(e){
        // call function in Apitool.php : freshdata?
        $.request('onGetCourse', {
            data: {'freshdata':'N/A'},
            dataType: 'text',// returning info type. returns a json string
            success: function(data) {
                //console.log('data:', data.length, data);
                var res =$.parseJSON(data);
                //console.log('res:', res.length, res);
                var result=$.parseJSON(res.result);
                console.log('Course:', result);
                //$('#data-results').html(result.length+' Modules.');
                //$('.results').append(result.length+' Course:');
                var display = 'Course account '+result.account_id+' : name '+result.name+' is '+result.workflow_state+' role '+result.enrollments[0].type;;
                // returns account id now go get account?
                $.request('onGetAccount', {
                    data: {'accountId':result.account_id},
                    dataType: 'text',// returning info type. returns a json string
                    success: function(data) {
                        //console.log('data:', data.length, data);
                        var res =$.parseJSON(data);
                        //console.log('res:', res.length, res);
                        var result=$.parseJSON(res.result);
                        console.log('Account:', result);
                        //$('#data-results').html(result.length+' Modules.');
                        display += '<br/>Account name '+result.name+' : parent account id '+result.parent_account_id+' : is '+result.workflow_state;
                        $('.results').append(display);
                        // returns account id now go get account?

                    }
                });
            }
        });
    });
    
    $('#getEnrollments').on('click', function(e){
        // call function in Apitool.php : freshdata?
        $.request('onGetEnrollments', {
            data: {'freshdata':'N/A'},
            dataType: 'text',// returning info type. returns a json string
            success: function(data) {
                //console.log('data:', data.length, data);
                var res =$.parseJSON(data);
                //console.log('res:', res.length, res);
                var result=$.parseJSON(res.result);
                console.log('Enrollments:', result.length, result);
                //$('#data-results').html(result.length+' Modules.');
                $('.results').append(result.length+' Enrollments:');
                // returns all course htm_url Im enrolled in, id and role
                
                /* // display assignment group names plus assignment?
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
                // on click open html_url in new tab?
                */
            }
        });
    });
    
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
                console.log('Modules:', result.length, result);
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
                    
                    // open modal and display module_items
                    var items = mod[0].module_items;
                    var modalbody = '';
                    for (i=0; i<items.length; i++) {
                        modalbody +=  '<div id='+items[i].html_url+' class="module-item alert alert-success">';//green
                        modalbody +=  items[i].title+' : Type '+items[i].type;
                        modalbody +='</div>';
                    }
                    $('#quest-details-title').html(mod[0].name+' - module items');
                    $('.modal-body').html(modalbody);
                    $('.modal-footer').hide();// back next btns
                    $('#quest-details').modal('show');
                    
                    // click will open in a new tab?
                    
                });
            }
        });
    });
    
    // Module Tree is constructed with Stem manager
    $('#getModuleTree').on('click', function(e){
        // call function in Apitool.php : freshdata?
        $.request('onGetModuleTree', {
            data: {'freshdata':'N/A'},
            dataType: 'text',// returning info type. returns a json string
            success: function(data) { // data contains the returning result
                //console.log('data:', data.length, data);// len 90,000 chars
                var res =$.parseJSON(data);
                //console.log('res:', res.length, res);
                var result=$.parseJSON(res.result);
                console.log('Module Tree:', result.length, result);
                //$('#data-results').html(result.length+' Modules.');
                $('.results').append(result.length+' Module Tree:');
                
                // display module tree structure
                var content = '<div id='+result[0].module_id+' class="module alert alert-info">';// blue
                    content += result[0].name+' : Items '+result[0].items_count;
                    //content += '';
                    content += '</div>';
                    $('.results').append(content);
                
                //https://github.com/Hermes-888/blossom/blob/master/assets/javascript/modulemap.js
                var childrn = result[0].children;
                for (var i=0; i<childrn.length; i++) {
                    
                    //getMyChildren(childrn[i]['children']);// add any children of this child recursively
                    // or like Stem does
                    content = '<div id='+childrn[i].module_id+' class="module alert alert-info">';// blue
                    content += '&nbsp; - '+childrn[i].name+' : Items '+childrn[i].items_count;
                    //content += '';
                    content += '</div>';
                    $('.results').append(content);
                }
                // module items
                $('.module').on('click', function(e) {
                    e.preventDefault();
                    // find this module
                    var mod= $.grep(result, function(elem, indx){
                        return elem.module_id == e.target.id; }
                    );
                    console.log('module:',e.target.id, mod[0]);
                    
                    // open modal and display module_items
                    var items = mod[0].module_items;
                    var modalbody = '';
                    for (i=0; i<items.length; i++) {
                        modalbody +=  '<div id='+items[i].html_url+' class="module-item alert alert-success">';//green
                        modalbody +=  items[i].title+' : Type '+items[i].type;
                        modalbody +='</div>';
                    }
                    $('#quest-details-title').html(mod[0].name+' - module items');
                    $('.modal-body').html(modalbody);
                    $('.modal-footer').hide();// back next btns
                    $('#quest-details').modal('show');
                    
                    // click will open in a new tab?
                    
                });
                
            }
        });
    });
    // Module States
    $('#getModuleStates').on('click', function(e){
        // call function in Apitool.php : freshdata?
        $.request('onGetModuleStates', {
            data: {'freshdata':freshdata},
            dataType: 'text',// returning info type. returns a json string
            success: function(data) { // data contains the returning result
                //console.log('data:', data.length, data);// len 90,000 chars
                var res =$.parseJSON(data);
                console.log('res:', res.length, res);
                var result=$.parseJSON(res.result);
                console.log('Module States:', result.length, result);
                //$('#data-results').html(result.length+' Modules.');
                $('.results').append(result.length+' Module States:');
                /*
                    Error GuzzleHelper line 108 : user not authorized to perform that action
                    specific moduleId = same error
                    https://github.com/Hermes-888/blossom/blob/master/components/Modulemap.php
                    research Modulemap it uses module states, err still
                    is this from role=Teacher? token IS available
                */
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
                console.log('Assignments:', result.length, result);
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
                // on click open html_url in new tab?
                
            }
        });
    });
    // Assignment Groups
    $('#getAssignmentGroups').on('click', function(e){
        // call function in Apitool.php : freshdata?
        $.request('onGetAssignmentGroups', {
            data: {'freshdata':freshdata},
            dataType: 'text',// returning info type. returns a json string
            success: function(data) {
                //console.log('data:', data.length, data);
                var res =$.parseJSON(data);
                //console.log('res:', res.length, res);
                var result=$.parseJSON(res.result);
                console.log('Assignment Groups:', result.length, result);
                //$('#data-results').html(result.length+' Modules.');
                $('.results').append(result.length+' Assignment Groups:');
                
                /* // display assignment group names plus assignment?
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
                // on click open html_url in new tab?
                */
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
                console.log('Quizzes:', result.length, result);
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
                    
                    // setup modal for questions
                    var modalbody = '<div class="clearfix"><div id="qtype" class="left questype"></div><div id="qpoints" class="right questype"></div></div>';
                        modalbody +='<hr/><div><div id="qtext"></div></div>';
                        modalbody +='<div><div id="qanswers"></div><div id="qfeedback"></div></div>';
                    $('.modal-body').html(modalbody);
                    $('.modal-footer').show();// back next btns
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
    
    // common functions
    
    /* recursive deep search children for ModuleTree*/
    function getMyChildren(theObj) {
        var result = null;
        for (var i=0; i<theObj.length; i++) {
            if ('children' in theObj[i]) {
                // dont use if unpublished
                if (theObj[i].published == 1) {
                    modobjs.push(theObj[i]);// all objects
                    modlist.push(theObj[i]);// build moduledata, modules in tab
                    result = getMyChildren(theObj[i].children);
                if (result) { break; }
                }
            }
        }
        return result;
    }
    
    // End document.ready
});