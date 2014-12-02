'use strict';

angular.module('secretSantaApp')
.directive('fileUpload', function ($location, $window) {

    return {
        scope: {
            maxSize: '='
        },        //create a new scope
        link: function (scope, el, attrs) {

            var max = scope.maxSize || 600;
            var base64ImageObject = {};
            var currentFile, orientation;

            function setSize (data) {
                orientation = (data.exif)?data.exif.get('Orientation'):1;
                loadImage(
                    currentFile,
                    render,
                    {canvas: true, crop: 1, maxWidth: max, maxHeight: max, top: 0, left: 0, orientation: orientation}
                )
            }

            function render (canvas) {
                var url = canvas.toDataURL().replace('data:image/png;base64,', '');
                // var url = canvas.toDataURL();
                base64ImageObject = {url: url, height: canvas.height, width: canvas.width};
                console.log(base64ImageObject)
                scope.$emit("fileSelected", base64ImageObject);
            }
            el.bind('select submit error blur focus change', function () {
                $window.scrollTo(0,0)
            })
            el.bind('change', function (event) {
                $window.scrollTo(0,0)
                var files = event.target.files;
                //iterate files since 'multiple' may be specified on the element
                for (var i = 0;i<files.length;i++) {
                    // loadImage found in load-image.all.js
                    // Library to extract EXIF Orientation information from JPEGs
                    currentFile = files[i];
                    
                    loadImage.parseMetaData(
                        currentFile,
                        setSize
                    );
                }                                       
            });
        }
    };
});

