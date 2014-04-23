app.controller('progressbarCtrl', ['$scope', function($scope) {
	
	$scope.questionStatus = function (question) {
		if (question.isSkipped) {
			return "skipped";
		} else if (question.isExcluded) {
			return "excluded";
		} else if(!question.isAnswered) { 
			return "included-unanswered"; 
		} else if (question.isAnswered) {
			return "included-answered";
		} else {
			return "something bad happened in progressbarCtrl.questionStatus";
		}
	},

	$scope.getWidth = function(questions) {
		var count = 0;
		for (var i = 0 ; i < questions.length ; i++ ) {
			if (questions[i].status != "excluded") {
				count++;
			}
		};
		return 100 / count;
	},

	$scope.isCurrent = function(question) {
		return (typeof $scope.cur !== 'undefined') && $scope.cur.Id === question.Id; 
	},

	$scope.isCurrentSelector = function(question) {
		return $scope.isCurrent(question) ? "progress-striped" : "";
	}

	$scope.isCurrentUnAnswered = function(question) {
		return $scope.isCurrent(question) ? "progress-bar-current" : "progress-bar-default";
	};
}]);