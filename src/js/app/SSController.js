app.controller('surveyCtrl', ['$rootScope', '$scope', '$stateParams', '$timeout', '$state', '$window', function($rootScope, $scope, $stateParams, $timeout, $state, $window) {

	$scope.$on('$locationChangeSuccess', function(evt) {
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
		$scope.questionnaire.questions.forEach(function(question) {
			function getAnswerType(type) {
				switch(type) {
					case "choices":
					return {};
					case "date":
					return "";
					case "dateRange":
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
			question.answer = getAnswerType(question.type);
			question.isAnswered = false;
			question.isSkipped = false;
			question.isExcluded = question.status === "excluded";
		});
		$scope.$digest();
	},
	$scope.questionnaireIsReady = function() {
		return typeof $scope.questionnaire !== 'undefined';
	},

	$scope.nextQuestion = function() {
		var nextId;
		for(var i = 0; i < $scope.questionnaire.questions.length; i++) {
			if($scope.questionnaire.questions[i].isAnswered == false) {
				nextId = i;
				break;
			}
		}

		$state.go('question', {Id:nextId});
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
		$state.go('question', {Id:nextId});
	}

	/* INPUT VALIDATION */
	$scope.isValid = function() {
		if(typeof $scope.cur === 'undefined')
			return false;

		if($scope.hasAnswer() && $scope.isWithinBoundaries()) {
			$scope.cur.isAnswered = true;
			return true;
		} else {
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
		switch($scope.cur.type) {
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
			case "dateRange":
			var from = moment.unix($scope.cur.from).startOf('day');
			var to = moment.unix($scope.cur.to).startOf('day');
			var d = moment($scope.cur.answer, 'DD-MM-YYYY');
			return d <= to && d >= from;
			case "time":
			return moment($scope.cur.answer, "HH:mm").isValid();
			default:
			throw "Type not supported: " + $scope.cur.type;
		}
	}

	/* END INPUT VALIDATION */
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

	$scope.submitAnswers = function() {
		var subject = "Questionnaire \"" + $scope.questionnaire.title +"\" has been answered";
		var answers = "";
		$scope.questionnaire.questions.forEach(function(q) {
			answers += "[" + q.ident + "]" + ": " + $scope.wrapAnswer(q) + "%0D%0A";
		});
		$window.location = "mailto:?subject=" + subject + "&body=" + answers + "";
	},

	$scope.wrapAnswer = function(question) {
		switch(question.type) {
			case "choices":
			var choiceString = "";
			for(var a in question.answer) {
				if(question.answer[a])
					choiceString += a + ",";
			}

			return choiceString.substring(0, choiceString.length - 1); // Remove trailing comma.
			case "date":
			return question.answer;
			case "dateRange":
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
	}
}]);