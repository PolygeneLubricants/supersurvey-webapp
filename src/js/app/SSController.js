app.controller('surveyCtrl', ['$rootScope', '$scope', '$stateParams', '$timeout', function($rootScope, $scope, $stateParams, $timeout) {

	$scope.$on('$locationChangeSuccess', function(evt) {
		$timeout(function() { // Timeout is used to wait for the angular cycle to finish. This avoids a race condition with stateparams.
			if(typeof $stateParams.Id === 'undefined')
				return;

			var id = parseInt($stateParams.Id);
			$scope.questionId = id;
			$scope.previousId = id - 1;
			$scope.nextId = id + 1;
			$scope.cur = $scope.getQuestion(id);
			$scope.$digest();
		});
	});

	this.init = function() {
		$scope.cur;
		$scope.questionnaire;
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
					return 0;
					case "text":
					return "";
					case "time":
					return "";
					default:
					throw "Type not supported. " + type;
				}
			}
			question.answer = getAnswerType(question.type);
		});
		$scope.$digest();
	},
	$scope.questionnaireIsReady = function() {
		return typeof $scope.questionnaire !== 'undefined';
	}
}]);