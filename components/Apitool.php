<?php
/**
 * Copyright (C) 2012-2016 Project Delphinium - All Rights Reserved
 *
 * This file is subject to the terms and conditions defined in
 * file 'https://github.com/ProjectDelphinium/delphinium/blob/master/EULA',
 * which is part of this source code package.
 *
 * NOTICE:  All information contained herein is, and remains the property of Project Delphinium. The intellectual and technical concepts contained
 * herein are proprietary to Project Delphinium and may be covered by U.S. and Foreign Patents, patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained
 * from Project Delphinium.
 *
 * THE RECEIPT OR POSSESSION OF THIS SOURCE CODE AND/OR RELATED INFORMATION DOES NOT CONVEY OR IMPLY ANY RIGHTS
 * TO REPRODUCE, DISCLOSE OR DISTRIBUTE ITS CONTENTS, OR TO MANUFACTURE, USE, OR SELL ANYTHING THAT IT  MAY DESCRIBE, IN WHOLE OR IN PART.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Non-commercial use only, you may not charge money for the software
 * You can modify personal copy of source-code but cannot distribute modifications
 * You may not distribute any version of this software, modified or otherwise
 */
namespace Delphinium\Toolbox\Components;

// for custom functions
use Delphinium\Roots\Roots;
use Delphinium\Roots\db\DbHelper;
use Delphinium\Roots\lmsclasses\CanvasHelper;
use Delphinium\Roots\Enums\ActionType;
use Delphinium\Roots\Requestobjects\SubmissionsRequest;
use Delphinium\Roots\Requestobjects\ModulesRequest;
use Delphinium\Roots\Requestobjects\AssignmentsRequest;
use Delphinium\Roots\Requestobjects\AssignmentGroupsRequest;
use Delphinium\Roots\Requestobjects\QuizRequest;

use Delphinium\Roots\Guzzle\GuzzleHelper;//for getOutcomeResults custom api call

// required
use Delphinium\Toolbox\Controllers\Apitool as MyController;
use Delphinium\Toolbox\Models\Apitool as MyModel;
use Cms\Classes\ComponentBase;

class Apitool extends ComponentBase
{

    public $apitoolrecordId;
    public $roots;
    
    /**
     * @return array An array of details to be shown in the CMS section of OctoberCMS
     */
    public function componentDetails()
    {
        return [
            'name'        => 'APItoolbox',
            'description' => 'API call buttons'
        ];
    }

    /**
     * @return array Array of properties that can be configured in this instance of this component
     */
    public function defineProperties()
    {
        return [
            'instance'	=> [
                'title'             => '(Optional) Apitool instance',
                'description'       => 'Select the apitool instance to display. If an instance is selected, it will be
                                    the configuration for all courses that use this page. Leaving this field blank will allow
                                    different configurations for every course.',
                'type'              => 'dropdown',
                'default'           => 0
            ]
        ];
    }

    /**
     * @return array An array of instances (eloquent models) to populate the instance dropdown to configure this component
     */
    public function getInstanceOptions()
    {

        $instances = MyModel::all();

        if (count($instances) === 0) {
            return $array_dropdown = ["0" => "No instances available."];
        } else {
            $array_dropdown = ["0" => "- select MyModel Instance - "];
            foreach ($instances as $instance) {
                $array_dropdown[$instance->id] = $instance->name;//assuming that the model has id and name fields
            }
            return $array_dropdown;
        }

    }

    /**
     * This function will run every time this component runs. To use this component, drop it on a OctoberCMS page along with the dev component
     * (for development) or LTIConfiguration component (for production)
     */
    public function onRun()
    {
        
        try {
            //NOTES:
            //Components have database instances. The logic for how they are created is as follows:
            //is an instance set in this component's properties? yes show it
            //else get all instances
            //    is there an instance with this alias_course? yes use it
            //else create dynamicInstance, save new instance, show it

            //************NOTE:**********
            //Requires minimal.htm layout
            //Requires the LTIConfiguration or Dev component set up from Here:
            //https://github.com/ProjectDelphinium/delphinium/wiki/
            //**************************

            $config = $this->getInstance();
            //use the record in the component and frontend form
            $this->page['config'] = json_encode($config);
            //Use the primary key of the record you want to update
            $this->page['recordId'] = $config->id;
            $this->page->apitoolrecordId = $config->id;
            $this->roots = new Roots();
            
            if (!isset($_SESSION)) {
                 session_start();
             }
            //get LMS roles --used to determine functions and display options
            $roleStr = $_SESSION['roles'];
            $this->page['role'] = $roleStr;
            //$userId = $_SESSION['userID'];

            //THIS NEXT SECTION WILL PROVIDE TEACHERS WITH FRONT-EDITING CAPABILITIES OF THE BACKEND INSTANCES.
            //A CONTROLLER AND MODEL MUST EXIST FOR THE INSTANCES OF THIS COMPONENT SO THE BACKEND FORM CAN BE USED IN THE FRONT END FOR THE TEACHERS TO USE
            //ALSO, AN INSTRUCTIONS PAGE WITH THE NAME instructor.htm MUST BE ADDED TO YOUR CONTROLLER DIRECTORY, AFTER THE CONTROLLER IS CREATED
            //IN Delphinium\Toolbox\controllers\Apitool\_instructions.htm

            //This will add the custom css, if any, that can be configured in the front-end of the component
            if($config&&$config->custom_css)
            {
                $cssStr = $config->custom_css;
                $this->page['custom_css'] = $cssStr;
            }
            // include the backend form with instructions for instructor.htm
            
            //if(stristr($roleStr, 'Instructor')||stristr($roleStr, 'TeachingAssistant'))
            if ( !stristr($roleStr, 'Learner') )
            {
            //INCLUDE JS AND CSS
            //include your css. Note: bootstrap.min.css is part of minimal layout.
            //See #10 in https://github.com/ProjectDelphinium/delphinium/wiki/1.-Installation#setup
            //if you desire to use OctoberCMS' ui library (See https://octobercms.com/docs/ui/form) uncomment the following three lines

                $this->addCss('/modules/system/assets/ui/storm.css', 'core');
                $this->addJs('/modules/system/assets/ui/js/flashmessage.js', 'core');
                //$this->addCss('/modules/system/assets/ui/storm.less', 'core');// Frontend form works without it
                $this->addJs('/plugins/delphinium/toolbox/assets/js/apitool_instructor.js');
                $formController = new MyController();
                $formController->create('frontend');

                //Append the formController to the page
                $this->page['apitoolform'] = $formController;

                //Append the Instructions to the page
                $instructions = $formController->makePartial('apitoolinstructions');
                $this->page['apitoolinstructions'] = $instructions;
            }
            else if(stristr($roleStr, 'Learner'))
            {
                //code specific to the student.htm goes here
            }
            //foreach($_POST as $key => $value ) { echo "$key = $value <br/>"; }
            // custom variables are there
            // all roles use the main js & css files
            $this->addCss('/plugins/delphinium/toolbox/assets/css/apitool.css');
            $this->addJs('/plugins/delphinium/toolbox/assets/js/apitool.js');
            
        //Error handling requires nonlti.htm. See #11 in https://github.com/ProjectDelphinium/delphinium/wiki/1.-Installation#setup
        }
        catch (\GuzzleHttp\Exception\ClientException $e) {
            return;
        }
        catch(Delphinium\Roots\Exceptions\NonLtiException $e)
        {
            if($e->getCode()==584)
            {
                return \Response::make($this->controller->run('nonlti'), 500);
            }
        }
        catch(\Exception $e)
        {
            if($e->getMessage()=='Invalid LMS')
            {
                return \Response::make($this->controller->run('nonlti'), 500);
            }
            return \Response::make($this->controller->run('error'), 500);
        }

    }

    /**
     * Retrieves instance of this component. If no specific instance was selected in the CMS configuration of this component
     * then it will create a dynamic instance based on the alias_courseId in which this component was launched
     * @param null $name The name of the component
     * @return mixed Instance of Component
     */
    private function getInstance($name=null)
    {
        if (!isset($_SESSION)) {
            session_start();
        }
        $courseId = $_SESSION['courseID'];
        //if instance has been set
        if ($this->property('instance')) {
            echo "instance was set";
            //use the instance set in CMS dropdown
            $config = MyModel::find($this->property('instance'));
        } else {
            if (is_null($name)) {
                $name = $this->alias . '_' . $courseId;
            }
            $config = MyModel::firstOrNew(array('name' => $name));
            if (is_null($config->name)) {$config->name = $name;}
            if (is_null($config->animate)) {$config->animate = 1;}
            if (is_null($config->size)) {$config->size = 100;}
            if (is_null($config->custom_css)) {$config->custom_css = '';}
            //TODO: finish setting some default values
        }
        $config->save();
        return $config;
    }

    /**
     * Ajax Handler for when teachers update the component from the frontend view
     * @return string Json encoded instance of component
     */
    public function onUpdate()
    {
        $data = post('Apitool');//model name
        $id = intval($this->page->apitoolrecordId);// convert string to integer
        $config = $this->getInstance($data['name']);// retrieve existing record

        //update record with new data coming from POST
        $config->name = $data['name'];
        $config->animate = intval($data['animate']);
        $config->size = intval($data['size']);
        $config->custom_css = trim(preg_replace('/\s+/', ' ',  $data['custom_css']));

        //TODO: must finish updating the rest of the fields in your table
        $config->save();// update original record
        return json_encode($config);// back to instructor view
    }
    
    /**
        API functions:
            onGetCourse : returns account_id then calls onGetAccount
            onGetEnrollments : All courses this user is enrolled in
            
            onGetAllModules : Basic Modules Request contains module items and content
            onGetModuleTree : 
            onGetModuleStates :
            
            onGetAllAssignments :
            onGetAsssignmentGroups :
            
            onGetAllQuizzes : quizzes also contain their questions and answers
            
            onGetOutcomes: eventually will have multiple options
            onGetUsers: doesn't return TestStudent
            
            onGetExternalTools: course level tools
            onGetSubmissions: must have at least one valid TestStudent id, or array of ids?
            
        https://octobercms.com/docs/cms/ajax#ajax-handlers
        https://github.com/Hermes-888/delphinium/blob/master/dev/components/TestRoots.php
        need to create a get question_BANKS
    */
    public function onGetAccount()
    {
        $accountId = \Input::get('accountId');
        $roots = new Roots();
        $result = $roots->getAccount($accountId);
        return json_encode($result);
    }
    public function onGetCourse()
    {
        $roots = new Roots();
        $result = $roots->getCourse();
        return json_encode($result);
    }
    public function onGetEnrollments()
    {
        $roots = new Roots();
        $result = $roots->getUserEnrollments();
        return json_encode($result);
    }
    /* getUsers or enrollments?
     *   https://canvas.instructure.com/doc/api/users.html
     *   https://canvas.instructure.com/doc/api/enrollments.html
    
        $roots->getUsersInCourse();
        $roots->getStudentsInCourse(); 
        $roots->getUser(user_id);
        getAccount($accountId) ?
     */
    public function onGetUsers() {
        $roots = new Roots();
        $result = $roots->getUsersInCourse();
        return json_encode($result);
    }

    public function onGetGradingStandards()
    {
        $roots = new Roots();
        $result = $roots->getGradingStandards();// nada nope empty
        return json_encode($result);
    }

    public function onGetAllModules()
    {
        $moduleId = null;// specific module
        $moduleItemId = null;// specific module item
        $includeContentDetails = true;
        $includeContentItems = true;
        $module = null;
        $moduleItem = null;
        $freshData = \Input::get('freshdata');//true = from LMS : false = from database only
        
        $req = new ModulesRequest(ActionType::GET, $moduleId, $moduleItemId, $includeContentItems, $includeContentDetails, $module, $moduleItem, $freshData);
        $roots = new Roots();
        $result = $roots->modules($req);
        return json_encode($result);
    }
    
    public function onGetModuleTree()
    {
        $roots = new Roots();
        $result = $roots->getModuleTree(true);
        return json_encode($result);
    }

    /*
        Error GuzzleHelper line 108 : user not authorized to perform that action
        Must be in Student View. role=Learner
    */
    public function onGetModuleStates()
    {
        $moduleId = null;// specific 3846827;//
        $moduleItemId = null;// specific
        $includeContentDetails = false;//true; //throws error
        $includeContentItems = false;//true; //throws error
        $module = null;
        $moduleItem = null;// matches Modulemap
        $freshData = true;//\Input::get('freshdata');//true = from LMS : false = from database only
        
        $req = new ModulesRequest(ActionType::GET, $moduleId, $moduleItemId, $includeContentItems, $includeContentDetails, $module, $moduleItem, $freshData);
        $roots = new Roots();
        $result = $roots->getModuleStates($req);
        return json_encode($result);
    }

    public function onGetAllAssignments()
    {
        $assignmentId = null;// or specific id
        $freshData = \Input::get('freshdata');//true = from LMS : false = from database only
        //$freshData = true;//true = from LMS : false = from database only
        $includeTags = true;// Stem can add tags to assingments
        
        $req = new AssignmentsRequest(ActionType::GET, $assignmentId, $freshData, null, $includeTags);
        $roots = new Roots();
        $result = $roots->assignments($req);
        return json_encode($result);
    }

    public function onGetAssignmentGroups()
    {
        $includeAssignments = false;// true to retrieve assignments in group
        $freshData = \Input::get('freshdata');//true = from LMS : false = from database only
        $assignmentGpId = null;// id for specific group
        
        $req = new AssignmentGroupsRequest(ActionType::GET, $includeAssignments, $assignmentGpId, $freshData);
        $roots = new Roots();
        $result = $roots->assignmentGroups($req);
        return json_encode($result);
    }

    public function onGetAllQuizzes()
    {
        $quizId = null;// specific quiz
        $freshData = \Input::get('freshdata');//true = from LMS : false = from database only
        $req = new QuizRequest(ActionType::GET, $quizId, $freshData, true);
            //return json_encode($this->roots->quizzes($req));// error
        $roots = new Roots();
        $result = $roots->quizzes($req);
        
        //remove quizzes with no questions. (uses question groups)
        $list = array();
        foreach ($result as $quiz)
        {
            if (count($quiz['questions']) > 0) {
                array_push($list, $quiz);
            }
        }
        return $list;
    }

    /**
     *  Custom Canvas API call that has not been added to Roots yet
     *  https://canvas.instructure.com/doc/api/outcome_results.html
     */
    public function onGetOutcomes() {
        if (!isset($_SESSION)) {
            session_start();
        }
        $domain = $_SESSION['domain'];
        $token = \Crypt::decrypt($_SESSION['userToken']);
        $courseId = $_SESSION['courseID'];
        $urlPieces = array();
        $urlArgs = array();
        $singleRow = false;
    
        $urlPieces[] = "https://{$domain}/api/v1/courses/{$courseId}";
        $urlPieces[] = "outcome_results";
        //$urlArgs[] = "include=['alignments','outcomes','outcomes.alignments','outcome_groups','outcome_links','outcome_paths','users']";
        $urlArgs[] = "include=['outcomes']";
    
        //Attach token
        $urlArgs[] = "access_token={$token}";
        $urlArgs[] = "per_page=5000";
        $url = GuzzleHelper::constructUrl($urlPieces, $urlArgs);
        
        $response = json_encode($response);
        $response = json_decode($response);
        
        $request = new ModulesRequest(ActionType::GET);// worked
        $response = GuzzleHelper::makeRequest($request, $url, false, $token);
        
        //$outs = $response['linked']["['outcomes']"];// php 7 ?
        $outs = $response->linked->{"['outcomes']"};// php 5.5.38 ?
        $outs = array_map('json_encode', $outs);
        $outs = array_unique($outs);
        $outs = array_map('json_decode', $outs);
        return json_encode($outs);
        //return $outs;
    }

    /*
        https://github.com/Hermes-888/delphinium/blob/master/dev/components/TestRoots.php
        wish there was a get question_BANKS
    */
    /* https://canvas.instructure.com/doc/api/external_tools.html */
    public function onGetExternalTools() {
        $roots = new Roots();
        $result = $roots->getExternalTools();
        return json_encode($result);
    }

    public function onGetSubmissions()
    {
        $studentId = \Input::get('studentId');

        $studentIds = array($studentId);// must have at least one valid id like TestStudent
        $assignmentIds = array();//if we leave this param empty it will return all of the available submissions
        //(see https://canvas.instructure.com/doc/api/submissions.html#method.submissions_api.for_students)
        $multipleStudents = false;
        $multipleAssignments = true;
        $allStudents = false;
        $allAssignments = true;

        //can have the student Id param null if multipleStudents is set to false (we'll only get the current user's submissions)
        $req = new SubmissionsRequest(ActionType::GET, $studentIds, $allStudents,
            $assignmentIds, $allAssignments, $multipleStudents, $multipleAssignments);

        $roots = new Roots();
        $result = $roots->submissions($req);
        return json_encode($result);
    }
    
    public function onGetAnalytics()
    {
        $studentId = \Input::get('studentId');
        $includeTags = \Input::get('includeTags');
        $roots = new Roots();
        //$result = $roots->getAnalyticsAssignmentData($includeTags);// no Submissions
        //$studentId = 1669437;//1695680;//TestStudent dev : 1688499
        $result = $roots->getAnalyticsStudentAssignmentData($includeTags, $studentId);// known user id
        //$result = $roots->getAnalyticsStudentAssignmentDataMultiple(array($studentId));
        //$result = $roots->getAnalyticsStudentAssignmentDataMultiple(array('all'));
        return json_encode($result);
    }
    
    public function onGetAnalyticsAll()
    {
        $roots = new Roots();
        $result = $roots->getAnalyticsStudentAssignmentDataMultiple('all');
        return json_encode($result);
    }
    
}
