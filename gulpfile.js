var gulp = require('gulp');
var webserver = require('gulp-webserver');

gulp.task('webserver', function() {
    gulp.src('src').pipe(
        webserver({
            livereload: true,
            directoryListing: true,
            path: '/',
            open: 'index.html',
            fallback: 'index.html'
        })
    );
});
