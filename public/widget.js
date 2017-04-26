

var Readical = (function (window, undefined) {
    var Readical = {};

    var READICAL_SCRIPT_ID = 'readical-widget';
    var READICAL_ATTRIBUTE_ID = 'data-readical-id';

    var WIDGET_HOST_NAME = '';
    if (location.hostname == "publisher.dev") {
        WIDGET_HOST_NAME = 'http://widget.dev:8081';
    }
    else {
        WIDGET_HOST_NAME = 'https://readical.herokuapp.com';
    }
    var SUPPORTING_FILES = {
        verge: WIDGET_HOST_NAME + '/verge.js',
        most_visible: WIDGET_HOST_NAME + '/most-visible.js'
    }

    //  loads files asynchronously
    // we could replace this with a script loader i bleive. 
    // can still use it to load out jquery and what not
    Readical.loadScript = function loadScript(url, callback) {
        var script = document.createElement('script');
        script.async = true;
        script.src
            = url;

        var entry = document.getElementsByTagName('script')[0];
        entry.parentNode.insertBefore(script, entry);
        script.onload = script.onreadystatechange = function () {
            var rdyState = script.readyState;

            if (!rdyState || /complete|loaded/.test(script.readyState)) {
                callback();

                script.onload = null;
                script.onreadystatechange = null;

            }
        };

    }

    function loadSupportingFiles() {
        Readical.loadScript(WIDGET_HOST_NAME + '/verge.js', function () {
            Readical.verge = readical_helper_verge;
        });
        Readical.loadScript(WIDGET_HOST_NAME + '/most-visible.js', function () {
            Readical.most_visible = readical_helper_mostVisible;
        });
    };
    loadSupportingFiles();


    Readical.xhr = function xhr(opts) {
        if (typeof opts === 'string') {
            opts = {
                url: opts
            };
        }
        opts = opts || {};
        opts.method = opts.method || 'get';
        if (typeof opts.data === 'object') {
            var formData = new FormData();
            Object.keys(opts.data).forEach(function (prop) {
                formData.append(prop, opts.data[prop]);
            });
            opts.data = formData;
        }
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(opts.method, opts.url, 'true');
            xhr.addEventListener('load', function () {
                resolve(xhr.responseText);
            });
            xhr.addEventListener('error', reject);
            xhr.send(opts.data);
        });
    }

    Readical.widgetParams = (function getWidgetParams() {
        var params = {};

        var scripts = document.getElementsByTagName('script');
        var id = null;
        for (var i = 0; i < scripts.length; i++) {
            id = scripts[i].getAttribute(READICAL_ATTRIBUTE_ID);
            if (id) {
                break;
            }
        }

        params = {
            id: id
        }
        return params;
    })();


    function getWidgetData(widgetParams) {
        var url = WIDGET_HOST_NAME + '/widgetData?page=' + widgetParams.id;
        console.log(url);
        return Readical.xhr({
            method: 'get',
            url: url
        })
    }

    function addAudibleHandlers() {
        var page = Readical.widgetParams.id;

        var audioPlayer = document.getElementById('readical_audio_' + page);
        var subtitles = document.getElementById("readical_subtitles_" + page);

        var currTime = flatTime = 0.0;
        var prevFlatTime = -1.0;
        var className = '';
        var elements, prevElements;
        var scrolled = false;

        audioPlayer.addEventListener("timeupdate", function (e) {
            currTime = audioPlayer.currentTime;
            flatTime = Math.floor(currTime);

            if (flatTime != prevFlatTime) {
                className = 'readical_group_' + flatTime;
                elements = document.getElementsByClassName(className);
                for (let i = 0; i < elements.length; i++) {
                    elements[i].style.background = 'yellow';
                    if (!Readical.verge.inViewport(elements[i])) {
                        elements[i].scrollIntoView(true);
                        scrolled = true;
                    }
                }
            }

            // unhilight prev word or phrase
            if (flatTime > prevFlatTime || flatTime < prevFlatTime) {
                className = 'readical_group_' + prevFlatTime;
                elements = document.getElementsByClassName(className);
                for (let i = 0; i < elements.length; i++) {
                    elements[i].style.background = '';
                }
                prevFlatTime = flatTime;
            }

            console.log(currTime);

        });


        var wordSpans = document.querySelectorAll('.readical_wordSpan');

        var topWordSpan = null;
        var wordTimeStamp = null;
        // Update player based on top most word
        window.addEventListener('scroll', function (e) {
            if (scrolled) {
                scrolled = false;
            }
            else {
                topWordSpan = Readical.most_visible(wordSpans);
                wordTimeStamp = topWordSpan.getAttribute('class').split(" ")[0].split('_')[2];
                audioPlayer.currentTime = wordTimeStamp;
            }

        }, true);
    }

    function drawWidget(data) {
        data = JSON.parse(data);

        // draw it in the current div we are in
        var div = document.createElement('div');
        div.innerHTML = data.html;

        var appendTo = document.getElementById(READICAL_SCRIPT_ID);
        appendTo.parentNode.insertBefore(div, appendTo);

        addAudibleHandlers();
    }

    getWidgetData(Readical.widgetParams).then(drawWidget);

    return Readical;
})(window);
console.log(Readical);


    // //  loads files asynchronously
    // // we could replace this with a script loader i bleive. 
    // // can still use it to load out jquery and what not
    // Readical.loadScript = function loadScript(url, callback) {
    //     var script = document.createElement('script');
    //     script.async = true;
    //     script.src
    //         = url;

    //     var entry = document.getElementsByTagName('script')[0];
    //     entry.parentNode.insertBefore(script, entry);
    //     script.onload = script.onreadystatechange = function () {
    //         var rdyState = script.readyState;

    //         if (!rdyState || /complete|loaded/.test(script.readyState)) {
    //             callback();

    //             script.onload = null;
    //             script.onreadystatechange = null;

    //         }
    //     };

    // }

    // Readical.loadScript('http://widget.dev:8081/verge.js');


    // // we can assign our readical object with Readical.audible = json object 
    // function getWidgetData(params, callback) {

    // }

    // get data about product in our sample app ... a dummy method
    // whatever data it ends up getting it will eventually be used 
    // by the draw widget to the document. 

    // function getRatingData(params, callback) { }
    // function loadSupportingFiles(callback) { }

    /* ... */
    // we will ultimately use a strategy similar to include snippet 
    // to load javascript files. 
    // loadSupportingFiles(function () {
    //     var params = getWidgetParams();
    //     getRatingData(params, function () {
    //         drawWidget();

    //     });
    // });