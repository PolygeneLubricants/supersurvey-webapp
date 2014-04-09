app.directive('questionnaire', function() {
	return {
		replace: true,
		restrict: 'A',
		templateUrl: config.VIEW_URL + '/questionnaire.html'
	}
});