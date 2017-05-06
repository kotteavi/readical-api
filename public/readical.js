$(document).ready(function () {
    var Readical = (function (window, undefined) {

        var Readical = {};

        function initialize() {
            var wordSpans = document.querySelectorAll('.readical_wordSpan');
            var options = { percentage: true };
            Readical.mostVisible = new readical_helper_mostVisible(wordSpans, options);
            Readical.playerStat = {
                currPositionElements: null,
                isVisible: false
            };
        };
        initialize();


        function addAudibleHandlers() {
            var audioPlayer = Readical.player;
            var subtitles = document.getElementById("readical_subtitles");

            var currTime = flatTime = 0.0;
            var prevFlatTime = -1.0;
            var className = '';
            var elements, prevElements;
            var scrolled = false;

            audioPlayer.addEventListener("timeupdate", function (e) {
                currTime = audioPlayer.currentTime;
                flatTime = Math.floor(currTime);

                if (flatTime != prevFlatTime && Readical.playerStat.isVisible) {
                    className = 'readical_group_' + flatTime;
                    elements = document.getElementsByClassName(className);
                    Readical.playerStat.currPositionElements = elements;
                    for (let i = 0; i < elements.length; i++) {
                        elements[i].style.background = 'yellow';
                        if (!readical_helper_verge.inViewport(elements[i])) {
                            // scroll into view assumes it's scrubbing 
                            // but if from last thing 
                            elements[i].scrollIntoView(true);
                            scrolled = true;
                        }
                    }
                }

                // unhilight prev word or phrase
                if ((flatTime > prevFlatTime || flatTime < prevFlatTime) && Readical.playerStat.isVisible) {
                    className = 'readical_group_' + prevFlatTime;
                    elements = document.getElementsByClassName(className);
                    for (let i = 0; i < elements.length; i++) {
                        elements[i].style.background = '';
                    }
                    prevFlatTime = flatTime;
                }

            });

            var topWordSpan = null;
            var wordTimeStamp = null;
            window.addEventListener('scroll', function (e) {
                if (scrolled) {
                    scrolled = false;
                }
                else {
                    // update player based on to pmost visible element/word 
                    topWordSpan = Readical.mostVisible.getMostVisible();
                    wordTimeStamp = topWordSpan.getAttribute('class').split(" ")[0].split('_')[2];
                    audioPlayer.currentTime = wordTimeStamp;
                }


            }, true);
        }

        function addPlayerUIHandlers() {
            var audioLink = document.getElementById('subtitle-audio');
            var controlsMenu = document.getElementById('article-controle-menu');
            var player = document.getElementById('article-controle-player');
            var playerX = document.getElementById('player-x');
            var play = document.querySelector('.fa-play');
            var pause = document.querySelector('.fa-pause');
            var audioPlayer = Readical.player;

            audioLink.addEventListener('click', function () {
                controlsMenu.style.display = 'none';
                player.style.display = 'table';
                Readical.playerStat.isVisible = true;
            });

            playerX.addEventListener('click', function () {
                controlsMenu.style.display = '';
                player.style.display = 'none';
                audioPlayer.pause();

                pause.style.display = 'none';
                play.style.display = '';
                Readical.playerStat.isVisible = false;

                // clear hilighted 
                var elements = Readical.playerStat.currPositionElements;
                for (let i = 0; i < elements.length; i++) {
                    elements[i].style.background = '';
                }
            });


            play.addEventListener('click', function () {
                play.style.display = 'none';
                pause.style.display = '';
                audioPlayer.play();

            });
            pause.addEventListener('click', function () {
                pause.style.display = 'none';
                play.style.display = '';
                audioPlayer.pause();
            });
        }


        audiojs.events.ready(function () {

            var as = audiojs.createAll();
            Readical.player = as[0]['element'];
            addAudibleHandlers();
            addPlayerUIHandlers();

        });


        $(window).scroll(function () {

            var article = $('#article-controle-container');
            if ($(this).scrollTop() > article.position().top) {
                article.css({ position: 'fixed', top: 0, 'padding-left': '0', 'padding-right': 40 });
                article.removeClass("row");
                article.addClass("container");

            } else {
                article.css({ position: 'relative', 'padding-left': 0, 'padding-right': 0 });
                article.removeClass("container");
                article.addClass("row");
            }





        });

        // function addArticleTime(){
        //     var article = document.getElementById('readical_subtitles');
        //     var calc = estimate.element(article);

        //     var date = new Date(null);
        //     date.setSeconds(calc.total); // specify value for SECONDS here

        //     var min = date.toISOString().substr(14, 2);
        //     document.getElementById('read-time').innerHTML = min + ' min read';
        // }
        // addArticleTime();


        return Readical;
    })(window);
});


