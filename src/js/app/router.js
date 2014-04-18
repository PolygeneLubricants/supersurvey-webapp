app.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider
		.state("question", {
			url: "/question/{Id}",
			templateUrl: config.VIEW_URL + "/question.html"
		})
		.state("entryPoint", {
			url: "/",
			templateUrl: config.VIEW_URL + "/questionnaire.html"
		})
});