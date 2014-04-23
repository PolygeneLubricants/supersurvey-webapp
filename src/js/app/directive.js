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

.directive('datepicker', function() {
	return {
		link: function(scope, elem, attr) {
			$(elem).datetimepicker({
				pickTime: false
			});
			$(elem).datetimepicker().on("change",function(e){
				scope.$apply(function() {
					scope.cur.answer = elem.find('input').val(); // Bad hardcording. Would be better to get ng-model.
				});
			});
		}
	}
})

.directive('daterangepicker', function() {
	return {
		link: function(scope, elem, attr) {
			$(elem).datetimepicker({
				pickTime: false,
				// The documentation for datetimepicker does not specify the format, but MM/DD/YYYY works..
				// Would be awesome to at least throw an error on unreadable date.
				minDate: moment.unix(scope.cur.from).format("MM/DD/YYYY"),
				maxDate: moment.unix(scope.cur.to).format("MM/DD/YYYY")
			});
			$(elem).datetimepicker().on("change",function(e){
				scope.$apply(function() {
					scope.cur.answer = elem.find('input').val(); // Bad hardcording. Would be better to get ng-model.
				});
			});
		}
	}
})

.directive('timepicker', function() {
	return {
		link: function(scope, elem, attr) {
			$(elem).datetimepicker({
				format: 'HH:mm',
				pickDate: false,
				pickSeconds: false,
				pick12HourFormat: false  
			});
			$(elem).datetimepicker().on("change",function(e){
				scope.$apply(function() {
					scope.cur.answer = elem.find('input').val(); // Bad hardcording. Would be better to get ng-model.
				});
			});
		}
	}
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

.directive('notype', function() {
	return {
		replace: true,
		restrict: 'A',
		templateUrl: config.VIEW_URL + '/questions/notype.html'
	}
})
.directive('progressbar', function() {
	return {
		replace: true,
		restrict: 'E',
		templateUrl: config.VIEW_URL + '/progressbar.html',
		scope: {
			questions: "=",
			cur: "="
		},
		controller: "progressbarCtrl"
	}
})
;