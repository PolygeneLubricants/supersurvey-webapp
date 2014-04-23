app.controller('progressbarCtrl', ['$scope', function($scope) {
	
	$scope.questionStatus = function (question) {
		if (question.isSkipped) {
			return "skipped";
		} else if (question.status === "excluded") {
			return "excluded";
		} else if(!question.isAnswered) { 
			return "included-unanswered"; 
		} else if (question.isAnswered) {
			return "included-answered";
		} else {
			return "something bad happened in progressbarCtrl.questionStatus";
		}
	};

	$scope.numOfIncludedQuestions = function(questions) {
		var count = 0;
		for (var i = 0 ; i < questions.length ; i++ ) {
			if (questions[i].status != "excluded") {
				count++;
			}
		};
		return count;
	};

} ] );