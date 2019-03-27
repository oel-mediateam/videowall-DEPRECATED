$(document).ready(function () {
    // variable declarations
    var isMobile = sniffUA();
	var delay = 50;
	var index;
	
    // initially fade all video thumb out linearly
    $('.thumb').each(function () {
        $(this).delay(delay).animate({
            opacity: .50
        }, 1000);
        delay += 50;
    });
	
    // conditional statement to determine
	// which event to run
    if (isMobile) {
        mobileEvents();
    } else {
        regularEvents();
    }
	
    // *MOIBLE* function to run mobile events
    function mobileEvents() {
        $('.vh').click(function () {
            // hold the index of the current clicked video thumb
            index = $('.vh').index(this);
            if (!$('.thumb:eq(' + index + ')').hasClass('current')) {
                // call fade out function to fade out the exist selection
                fadeOut();
                // call fade in function to fade in the new selection
                fadeIn(index);
            } else {
                alert('Video ' + (index + 1) + ' start playing.');
            }
        });
    }
	
	// *NON-MOIBLE* function to run mobile events
    function regularEvents() {
		$('.vh').hover(function () {
            // hold the index of the current clicked video thumb
            index = $('.vh').index(this);
            if (!$('.thumb:eq(' + index + ')').hasClass('current')) {
                // call fade in function to fade in the new selection
                fadeIn(index);
            }
        }, function () {fadeOut();});
		
		$('.vh').click(function () {
            var index = $('.vh').index(this);
            alert('Video ' + (index + 1) + ' start playing.');
        });
	}
	
    // function that fade in the video thumbs
    function fadeIn(index) {
        // light up the thumb
        $('.thumb:eq(' + index + ')').animate({
            opacity: 1
        }, 250, function () {
            $(this).addClass('current');
        });
        // slide up the title
        $('.hoverTitle:eq(' + index + ')').animate({
            marginTop: '80px'
        }, 500, function () {
            $(this).addClass('current');
        });
    }
	
    // function that fade out the video thumbs
    function fadeOut() {
        $('.thumb').each(function () {
            $(this).animate({
                opacity: .50
            }, 100, function () {
                if ($(this).hasClass('current')) {
                    $(this).removeClass('current');
                }
            });
        });
        $('.hoverTitle').each(function () {
            $(this).animate({
                marginTop: "100px"
            }, 100, function () {
                if ($(this).hasClass('current')) {
                    $(this).removeClass('current');
                }
            });
        });
    }
	
	/*** sniff the UA of the client and show hidden div's for that device ***/
    function sniffUA() {
        var ua = navigator.userAgent;
        var checker = {
            iphone: ua.match(/(iPhone|iPod|iPad)/),
            blackberry: ua.match(/BlackBerry/),
            android: ua.match(/Android/),
            browser: ua.match(/(Mozilla|Webkit|msie|Opera)/)
        };
        if (checker.android) {
            $('#device').html("<p><img src='assets/img/android.png' width='114' height='16' alt='Android' border='0' /><br/ >You are viewing this website on an Android device.</p>");
            return true;
        } else if (checker.iphone) {
            $('#device').html("<p><img src='assets/img/ios.png' width='42' height='24' alt='iOS' border='0' /><br/ >You are viewing this website on an iOS device.</p>");
            return true;
        } else if (checker.blackberry) {
            $('#device').html("<p><img src='assets/img/blackberry.png' width='132' height='24' alt='Blackberry' border='0' /><br/ >You are viewing this website on a Blackberry device.</p>");
            return true;
        } else if (checker.browser) {
            $('#device').html("<p>You are viewing this website on a desktop/laptop web browser.</p>");
            return false;
        } else {
            $('#device').html("<p>You are viewing this website on an unknown device.</p>");
            return false;
        }
    }
});