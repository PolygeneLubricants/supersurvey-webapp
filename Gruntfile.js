module.exports = function(grunt){
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		copy: {
			main: {
				files: [
					// copy  server files to build directory
					{expand: true, cwd: 'src/js/lib/', src: ['**'], dest: 'build/js/lib/'},	
					{expand: true, cwd: 'src/styles/', src: ['**'], dest: 'build/styles/'},
					{expand: true, cwd: 'src/js/app/views', src: ['**'], dest: 'build/js/app/views'},
					]
				}
			},
			concat: {
				options: {
					stripBanners: true,
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				},
				dist: {
					src: ['src/js/app/config.js', 'src/js/app/app.js', 'build/tmp/templates.js', 'src/js/app/router.js','src/js/app/**/*.js'],
					dest: 'build/js/app/<%= pkg.name %>.min.js',
				},
			},
			jshint: {
				options: {
					jshintrc: '.jshintrc'
				},
				all: ['Gruntfile.js', 'src/js/app/**/*.js']
			},
			html2js: {
				options: {
					base: './',
					module: 'compiled-templates'
     			},
     			main: {
     				src: ['build/js/app/views/**/*.html'],
     				dest: 'build/tmp/templates.js'
     			},
     		},
			smoosher: {
				options: {
				  jsTags: { // optional
					start: '<script type="text/javascript">', // default: <script>
					end: '</script>'                          // default: </script>
				  }
				},
				all: {
				  files: {
					'build/index.html': 'index.html',
				  },
				}
			}
     	});

	//Load the plugins
	grunt.loadNpmTasks('grunt-html2js');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-html-smoosher');

	//Default task(s).
	grunt.registerTask('default', ['copy', 'html2js', 'concat']);
	
	// Create index (Time consuming. Takes about 30 seconds)
	grunt.registerTask('purehtml', ['copy', 'html2js', 'concat', 'smoosher']);
	
	//other tasks
	grunt.registerTask('jslint', ['jshint']);
};