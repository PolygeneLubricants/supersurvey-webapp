app.directive('questionnaire', function() {
	return {
		replace: true,
		restrict: 'A',
		templateUrl: config.VIEW_URL + '/questionnaire.html'
	}
})

.directive('filelistBind', function() {
	return function( scope, elm, attrs ) {
		elm.bind('change', function( evt ) {
			scope.$apply(function() {
				if(evt.target.files.length !== 1)
					return;
				var reader = new FileReader();
				reader.addEventListener("load", function(e) {
					scope.loadQuestionnaire(e.target.result);
				});

				reader.readAsText(evt.target.files[0]);
			});
		});
	};
})

.directive('choices', function() {
	return {
		replace: true,
		restrict: 'A',
		templateUrl: config.VIEW_URL + '/questions/choices.html'
	}
})

.directive('date', function() {
	return {
		replace: true,
		restrict: 'A',
		templateUrl: config.VIEW_URL + '/questions/date.html'
	}
})
.directive('datetimepicker', function() {
	return function(scope, elem, attr) {
		$(elem).datetimepicker({
			format: 'dd/MM/yyyy hh:mm:ss'
		});
	}
})

.directive('daterange', function() {
	return {
		replace: true,
		restrict: 'A',
		templateUrl: config.VIEW_URL + '/questions/dateRange.html'
	}
})

.directive('floatrange', function() {
	return {
		replace: true,
		restrict: 'A',
		templateUrl: config.VIEW_URL + '/questions/floatRange.html'
	}
})

.directive('text', function() {
	return {
		replace: true,
		restrict: 'A',
		templateUrl: config.VIEW_URL + '/questions/text.html'
	}
})

.directive('time', function() {
	return {
		replace: true,
		restrict: 'A',
		templateUrl: config.VIEW_URL + '/questions/time.html'
	}
})

.directive('timerange', function() {
	return {
		replace: true,
		restrict: 'A',
		templateUrl: config.VIEW_URL + '/questions/timeRange.html'
	}
})
.directive('notype', function() {
	return {
		replace: true,
		restrict: 'A',
		templateUrl: config.VIEW_URL + '/questions/notype.html'
	}
});