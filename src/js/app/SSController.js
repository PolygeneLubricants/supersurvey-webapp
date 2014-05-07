app.controller('surveyCtrl', ['$rootScope', '$scope', '$stateParams', '$timeout', '$state', '$window', function($rootScope, $scope, $stateParams, $timeout, $state, $window) {

	$scope.$on('$locationChangeSuccess', function(evt) {

		// Remove zombie divs from DTP. Fucking leaky ass bootstrap datetime picker.
		$('.bootstrap-datetimepicker-widget.dropdown-menu').remove();

		$timeout(function() { // Timeout is used to wait for the angular cycle to finish. This avoids a race condition with stateparams.

			if(typeof $stateParams.Id === 'undefined')
				return;

			var id = parseInt($stateParams.Id);

			if($scope.questionnaire.questions[id].isExcluded) {

				// Check if there are any remaining questions who are not excluded. If true, got to that.
				for(var i = id; i < $scope.questionnaire.questions.length - 1; i++) {
					if(!$scope.questionnaire.questions[i].isExcluded) {
						return $state.go('question', {Id:i});
					}
				}
				// If no valid questions remain, step back one question and repeat until we reach a valid question.
				return $state.go('question', {Id: id - 1});
			}

			$scope.questionId = id;
			$scope.previousId = id - 1;
			$scope.nextId = id + 1;
			$scope.cur = $scope.getQuestion(id);
			
			$scope.$digest();
		});
	});

this.init = function() {
	if(typeof $scope.questionnaire === 'undefined')
		return $state.go('entryPoint');

	$scope.cur;
};

this.init();

/* SCOPE */
$scope.getQuestion = function(id) {
	return $scope.questionnaire.questions[id];
},
$scope.loadQuestionnaire = function(rawText) {
	$scope.questionnaire = JSON.parse(rawText);
	var i = 0;
	$scope.questionnaire.questions.forEach(function(question) {
		function getAnswerType(type) {
			switch(type.toLowerCase()) {
				case "choices":
				return {};
				case "date":
				return "";
				case "daterange":
				return "";
				case "range":
				return "";
				case "text":
				return "";
				case "time":
				return "";
				default:
				throw "Type not supported. " + type;
			}
		}
		question.Id = i;
		i++;
		question.answer = getAnswerType(question.type);

		if(question.type === "choices") {
			question.options.forEach(function(option) {
				if(typeof option.status !== 'undefined' && option.status === 'excluded') {
					option.isExcluded = true;
				}
				else {
					option.isExcluded = false;
				}
			});
		}
		question.isAnswered = false;
		question.isSkipped = false;
		question.isExcluded = question.status === "excluded";
	});

	$scope.applyAllRules($scope.questionnaire.rules);

	$scope.$watch('cur.answer', function() {
		$timeout(function() {
			if(typeof $scope.cur === 'undefined')
				return;

			$scope.applyRulesByQuestion($scope.cur);
		});
	}, true);

	$scope.$digest();
},
$scope.questionnaireIsReady = function() {
	return typeof $scope.questionnaire !== 'undefined';
},

$scope.nextQuestion = function() {
	var nextId;
	for(var i = 0; i < $scope.questionnaire.questions.length; i++) {
		if($scope.questionnaire.questions[i].isAnswered == false && $scope.questionnaire.questions[i].isSkipped == false) {
			nextId = i;
			break;
		}
	}

	$state.go('question', {Id:nextId});
},

$scope.autoNext = function(isChecked) {
	$timeout(function() {
		if(!isChecked && $scope.cur.max === 1) {
			$scope.nextQuestion();
		}
	});
},

$scope.previousQuestion = function(id) {
	for(var i = id; i >= 0; i--) {
		if(!$scope.questionnaire.questions[i].isExcluded) {
			return $state.go('question', {Id: i});
		}
	}
}

$scope.skip = function(id) {
	$scope.cur.isSkipped = true;
	$state.go('question', {Id:$scope.nextId});
},

/* INPUT VALIDATION */
$scope.isValid = function() {
	if(typeof $scope.cur === 'undefined')
		return false;

	if($scope.hasAnswer() && $scope.isWithinBoundaries()) {
		$scope.cur.isAnswered = true;
		$scope.cur.isSkipped = false;
		return true;
	} else {
		$scope.cur.isAnswered = false;
		return false;
	}
},

$scope.hasAnswer = function() {
	if($scope.cur.type === 'choices')
		return Object.keys($scope.cur.answer).length !== 0;
	else
		return $scope.cur.answer.length !== 0;
},

$scope.isWithinBoundaries = function() {
	switch($scope.cur.type.toLowerCase()) {
		case "choices":
		var choices = 0;
		for(var a in $scope.cur.answer) {
			if($scope.cur.answer[a])
				choices++;
		}

		return choices >= $scope.cur.min && choices <= $scope.cur.max;
		case "range":
		return $scope.cur.answer >= $scope.cur.from && $scope.cur.answer <= $scope.cur.to && $scope.cur.answer % $scope.cur.interval == 0;
		case "text":
		return true;
		case "date":
		return moment($scope.cur.answer, "DD-MM-YYYY").isValid();
		case "daterange":
		var from = moment.unix($scope.cur.from).startOf('day');
		var to = moment.unix($scope.cur.to).startOf('day');
		var d = moment($scope.cur.answer, 'DD-MM-YYYY');
		return d <= to && d >= from;
		case "time":
		return moment($scope.cur.answer, "HH:mm").isValid();
		default:
		throw "Type not supported: " + $scope.cur.type;
	}
},

$scope.maxReached = function() {
	var choices = 0;
	for(var a in $scope.cur.answer) {
		if($scope.cur.answer[a])
			choices++;
	}

	return choices >= $scope.cur.max;
},

/* END INPUT VALIDATION */
/* NAVIGATION VALIDATION */
$scope.isRequired = function() {
	if(typeof $scope.cur === 'undefined')
		return true;

	return $scope.cur.status === 'required';
},

$scope.hasPrevious = function() {
	if(typeof $scope.cur === 'undefined')
		return false;
	if($scope.questionId < 1)
		return false;

	for(var i = $scope.questionId - 1; i >= 0; i--) {
		if(!$scope.questionnaire.questions[i].isExcluded) {
			return true;
		}
	}

	return false;
},

$scope.hasNext = function() {
	if(typeof $scope.cur === 'undefined')
		return false;

	if($scope.questionId === $scope.questionnaire.questions.length - 1)
		return false;

	for(var i = $scope.questionId + 1; i < $scope.questionnaire.questions.length - 1; i++) {
		if(!$scope.questionnaire.questions[i].isExcluded) {
			return true;
		}
	}
	return false;
},

$scope.canSubmit = function() {
	var canSubmit = true;
	$scope.questionnaire.questions.forEach(function(q) {
		if(q.status === "required") {
			canSubmit &= q.isAnswered;
		}
	});

	return canSubmit;
},
/* END NAVIGATION VALIDATION */
/* SUBMISSION */
$scope.submitAnswers = function() {
	var subject = "Questionnaire \"" + $scope.questionnaire.title +"\" has been answered";
	var answers = "";
	$scope.questionnaire.questions.forEach(function(q) {
		answers += "[" + q.ident + "]" + ": " + $scope.wrapAnswer(q) + "%0D%0A";
	});
	$window.location = "mailto:?subject=" + subject + "&body=" + answers + "";
},

$scope.wrapAnswer = function(question) {
	switch(question.type.toLowerCase()) {
		case "choices":
		var choiceString = "";
		for(var a in question.answer) {
			if(question.answer[a])
				choiceString += a + ",";
		}

			return choiceString.substring(0, choiceString.length - 1); // Remove trailing comma.
			case "date":
			return question.answer;
			case "daterange":
			return question.answer;
			case "range":
			return question.answer;
			case "text":
			return question.answer.replace(/\r?\n/g, '%0D%0A');
			case "time":
			return question.answer;
			default:
			return "";
		}
	},
	/* END SUBMISSION */

	/* RULING */
	$scope.applyAllRules = function(rules) {
		rules.forEach(function(rule) {
			$scope.applyRule(rule);
		});
	},

	$scope.applyRule = function(rule) {
		var question = $scope.getQuestionByIdent(rule.trigger.ident);
		if(((question.type === 'choices' && question.answer[rule.trigger.answer]) || (question.isAnswered && rule.trigger.answer === null)) && $scope.isValid()) {
			var target = $scope.getQuestionByIdent(rule.target.ident);
			// Exclude specific choice.
			if(typeof rule.target.answer !== 'undefined' && rule.target.answer !== null) {
				var option = $scope.getOptionByIdent(target, rule.target.answer);
				if(rule.status === 'excluded') {
					option.isExcluded = true;
				}
			}
			// Exclude entire question
			else {
				target = $scope.applyStatus(rule, target);
			}
		} 
		else if(((question.answer === rule.trigger.answer) || (question.isAnswered && rule.trigger.answer === null)) && $scope.isValid()) {
			var target = $scope.getQuestionByIdent(rule.target.ident);
			if(typeof rule.target.answer !== 'undefined' && rule.target.answer !== null) {
				var option = $scope.getOptionByIdent(target, rule.target.answer);
				if(rule.status === 'excluded') {
					option.isExcluded = true;
				}
			}
			// Exclude entire question
			else {
				target = $scope.applyStatus(rule, target);
			}
		}
		else { // Negate existing rule
			var target = $scope.getQuestionByIdent(rule.target.ident);
			if(typeof rule.target.answer !== 'undefined' && rule.target.answer !== null) {
				target.options.forEach(function(option) {
					option.isExcluded = false;
				});
			}
			else {
				$scope.applyStatus({status: target.status}, target);
			}
		}
	},

	$scope.applyStatus = function(rule, target) {
		if(rule.status === 'excluded') {
			target.isExcluded = true;
		}
		else if(rule.status === 'optional') {
			target.isExcluded = false;
			target.isRequired = false;
		}
		else if(rule.status === 'required') {
			target.isExcluded = false;
			target.isRequired = true;
		}

		return target;
	},

	$scope.applyRulesByQuestion = function(question) {
		$scope.questionnaire.rules.forEach(function(rule) {
			if(String(rule.trigger.ident) === String(question.ident))
				$scope.applyRule(rule);
		});
	},

	$scope.getQuestionByIdent = function(ident) {
		var question;
		$scope.questionnaire.questions.forEach(function(q) {
			if(String(q.ident) === String(ident))
				question = q;
		});

		if(typeof question === 'undefined')
			throw "Question not found. Ident: " + ident;

		return question;
	},

	$scope.getOptionByIdent = function(question, ident) {
		var option;
		question.options.forEach(function(o) {
			if(String(o.ident) === String(ident)) {
				option = o;
			}
		});

		if(typeof option === 'undefined')
			throw "Option not found. Option: " + ident;

		return option;
	}
	/* END RULING */
}]);