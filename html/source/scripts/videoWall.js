/* global _V_ */

$(document).ready(function () {
    // variable declarations
    var isMobile = sniffUA(), // hold a boolean value to determine the client
        myPlayer = _V_('videoclip'), // hold the HTML5 player ID
        imageType, // hold the video thumbnail image format
        totalGroup, // hold the total number of groups
        prevGroup,
        videoIndex, // hold the current clicked video index
        prevIndex, // hold the previous clicked video index
        totalVideo, // hold the total number of videos
        vidName, // hold an array of video names
		vidExSrc,
        vidAuthor, // hold an array of video authors
        vidTitle, // hold an array of video titles
        vidDesc; // hold an array of video descriptions


    // AJAX setup
    $.ajaxSetup({
        url: 'assets/videoWall.xml', // the url/path to the XML file
        dataType: 'xml', // the data type of the file
        accepts: 'xml', // the acceptable type of file
        content: 'xml', // the content of the file
        contentType: 'xml; charset="utf-8"', // the type and encoding of the file content
        cache: false // telling the browser to cache (true) or not (false)
    });

    // Encoding and overiding XML data via ajax requesting
    $.ajax({
        type: 'get', // how the ajax should retreive the data
        // before sending the request, override mime type and
        // set request header
        beforeSend: function (xhr) {
            xhr.overrideMimeType("xml; charset=utf-8");
            xhr.setRequestHeader("Accept", "text/xml");
        },
        // if successful, call setup function
        success: function (xml) {
            setupXML(xml);
        },
        // if there is error, call displayError function
        error: function (xhr, exception) {
            displayError(xhr.status, exception);
        }
    });

    // XML Setup function
    function setupXML(xml) {
        var SETUP = $(xml).find('setup'); // hold the setup node in XML
        var GROUP = $(xml).find('group'); // hold the group node in XML
        var VIDEO = $(xml).find('video'); // hold the video node in XML

        totalVideo = VIDEO.length; // assign total number of videos
        imageType = (SETUP.find('imgFormat').text().length <= 0) ? 'jpg' : SETUP.find('imgFormat').text(); // assign the image format
        totalGroup = GROUP.attr('total'); // assign the total number of groups

        vidName = new Array(totalVideo); // create the video name array just enough for total number of videos
		vidExSrc = new Array(totalVideo);
        vidAuthor = new Array(totalVideo); // create the video author array just enough for total number of videos
        vidTitle = new Array(totalVideo); // create the video title array just enough for total number of videos
        vidDesc = new Array(totalVideo); // create the video description array just enough for total number of videos

        // if total group is greater than zero
        if (totalGroup > 0) {

            // loop through each group for group name
            GROUP.find('name').each(function () {
                // and create a group button for each
                $('#group ul').append('<li><a href="JavaScript:void(0);" class="minimal">' + $(this).text() + '</li>');
            });

            // if the group div tag is not visible
            if (!$('#group').is(':visible')) {
                // then remove the hidden class
                $('#group').removeClass('hidden');
            }

        }

        // loop through each topic node to get lesson topics
        VIDEO.each(function (i) {
            var videoName = $(this).attr('fileName');
            var videoGroup = $(this).attr('group');
            var videoAuthor = $(this).find('author').text();
            var videoTitle = $(this).find('title').text();
            var videoDesc = $(this).find('description').text();
			var exSrc = $(this).find('src').text();

            if (exSrc.length > 0) {
				vidExSrc[i] = exSrc;
			} else {
				vidExSrc[i] = 0;
			}

			vidName[i] = videoName;
            vidAuthor[i] = videoAuthor;
            vidTitle[i] = videoTitle;
            vidDesc[i] = videoDesc;

            // display each topic to web page as well
			$('#videoWall').append('<div class="vh ' + videoGroup + '"><span class="hoverTitle">' + videoTitle + '</span><span class="thumb"><img src="assets/thumbs/' + videoName + '.' + imageType + '" width="160" height="100" border="0" /></span></div>');

        });

        // preload the image
        $("#videoWall").preloader();

        // initialize whether the isMobile or regular event
        init();
    }

    // error handling function
    function displayError(status, exception) {
        var statusMsg, exceptionMsg; // hold status and error message

        // assign status
        if (status === 0) {
            statusMsg = '<strong>Error 0</strong> - Not connect. Please verify network.';
        } else if (status === 404) {
            statusMsg = '<strong>Error 404</strong> - Requested page not found.';
        } else if (status === 406) {
            statusMsg = '<strong>Error 406</strong> - Not acceptable error.';
        } else if (status === 500) {
            statusMsg = '<strong>Error 500</strong> - Internal Server Error.';
        } else {
            statusMsg = 'Unknow error';
        }

        // assign error
        if (exception === 'parsererror') {
            exceptionMsg = 'Requested XML parse failed.';
        } else if (exception === 'timeout') {
            exceptionMsg = 'Time out error.';
        } else if (exception === 'abort') {
            exceptionMsg = 'Ajax request aborted.';
        } else if (exception === "error") {
            exceptionMsg = 'HTTP / URL Error.';
        } else {
            exceptionMsg = ('Uncaught Error.\n' + status.responseText);
        }

        $('#errorMsg').html('<p>' + statusMsg + '<br />' + exceptionMsg + '</p>'); // display error message

    }

    // initialize function
    function init() {
        // conditional statement to determine
        // which event to run
        if (isMobile) {
            mobileEvents();
        } else {
            regularEvents();
        }
		if (totalGroup > 0) {
           groupBtnEvt();
        }
		$('.vh').each(function(i) {
            if ($('.vh:eq('+ i +')').hasClass('0')) {
				$('.vh:eq('+ i +')').css({'cursor':'default','box-shadow':'none'});
				$('.vh:eq('+ i +')').unbind('mouseenter');
				$('.vh:eq('+ i +')').unbind('mouseleave');
				$('.vh:eq('+ i +')').unbind('click');
			}
        });
    }

    // *MOIBLE* function to run mobile events
    function mobileEvents() {
        bindMobileEvents();
    }

    function bindMobileEvents() {
        // when clicked / touched / tapped
        $('.vh').click(function () {
            // hold the index of the current clicked video thumb
            var index = $('.vh').index(this);

            // if the current thumb image does NOT have the current class
            if (!$('.thumb img:eq(' + index + ')').hasClass('current') && !$('.vh:eq('+ index +')').hasClass('0')) {
                // call fade out function to fade out the exist selection
                fadeOut();

                // call fade in function to fade in the new selection
                fadeIn(index);
            } else {
                // the current video index is the current clicked index
                videoIndex = $('.vh').index($(this));

				if (vidTitle[videoIndex] !== '' || !isEmpty(vidTitle[videoIndex])) {

					if (!isEmpty(vidAuthor[videoIndex])) {

						// open the fancy box that hold the video
						$.fancybox.open('#videoContainer', {
							padding: 0, // show no border
							openEffect: 'fade', // fade in
							closeEffect: 'fade', // fade out
							closeClick: false, // prevent "click content to close"
							helpers: {
								overlay: {
									opacity: 0.9, // the overlay opacity
									css: {
										cursor: 'default', // the cursor type when over the overlay
										'background-color': '#000' // the color of the overlay
									},
									closeClick: false // prevent "click overlay to close"
								}
							},
							autoSize: false, // auto size the fancy box to the content
							// before showing the fancy box
							beforeShow: function () {
								// current video index is not equal to the previous index
								if (videoIndex !== prevIndex) {
									// populate the fancy box with current video and information
									// the title and the author
									$('#title').html(vidTitle[videoIndex] + '<br /><small>' + vidAuthor[videoIndex] + '</small>');
									// the description
									$('#desc').html(vidDesc[videoIndex]);
									// attach the poster attribute to the video tag
									$('.vjs-poster').attr('src', 'assets/thumbs/' + vidName[videoIndex] + '.' + imageType).css('display', 'block');

									if (vidExSrc[videoIndex].length > 0) {
										$('#videoclip').addClass('hidden');
										$('#exVid').removeClass('hidden').html(vidExSrc[videoIndex]);
									} else {
										// set the source of the video
										$('#videoclip').removeClass('hidden');
										myPlayer.src({
											type: 'video/mp4', // video type
											src: 'assets/videos/' + vidName[videoIndex] + '.mp4' // path to the video
										});
									}
								}
							},
							afterClose: function () {
								$('#exVid').html("").addClass('hidden');
							}
						});

					}

				}

            }
        });
    }

    // *NON-MOIBLE* function to run regular events
    function regularEvents() {
        bindRegEvents();

        // when clicked
        $('.vh').bind('click', function () {
            // the current video index is the current clicked index
            videoIndex = $('.vh').index($(this));

			if (vidTitle[videoIndex] !== '' || !isEmpty(vidTitle[videoIndex])) {
				if (!isEmpty(vidAuthor[videoIndex])) {

				// open the fancy box that hold the video
				$.fancybox.open('#videoContainer', {
					padding: 0, // with no border
					openEffect: 'fade', // fade in
					closeEffect: 'fade', // fade out
					closeClick: false, // prevent "click content to close"
					helpers: {
						overlay: {
							opacity: 0.9, // the overlay opacity
							css: {
								cursor: 'default', // the cursor type when over the overlay
								'background-color': '#000' // the overlay color
							},
							closeClick: false // prevent "click overlay to close"
						}
					},
					scrolling: 'auto', // no scrolling allowed (to remove the ugly scroll bar)
					autoSize: false, // auto size the fancy box to the content
					// before showing the fancy box
					beforeShow: function () {
						// current video index is not equal to the previous index
						if (videoIndex !== prevIndex) {
							// populate the fancy box with current video and information
							// the title and the author
							$('#title').html(vidTitle[videoIndex] + '<br /><small>' + vidAuthor[videoIndex] + '</small>');

							// the description
							$('#desc').html(vidDesc[videoIndex]);

							if (vidExSrc[videoIndex].length > 0) {
								$('#videoclip').addClass('hidden');
								$('#exVid').removeClass('hidden').html(vidExSrc[videoIndex]);
							} else {
								// set the source of the video
								$('#videoclip').removeClass('hidden');
								myPlayer.src({
									type: 'video/mp4', // video type
									src: 'assets/videos/' + vidName[videoIndex] + '.mp4' // path to the video
								});
							}
						}
					},
					// after showing the fancy box,
					afterShow: function () {
						// call playVideo function
						if (vidExSrc[videoIndex].length > 0) {
							playVideo();
						}
					},
					afterClose: function () {
						$('#exVid').html("").addClass('hidden');
					}
				});

				} // end inner if statement

			} // end if statement

        });

    }

    function bindRegEvents() {
        // when hover over
        $('.vh').bind('mouseover', function () {
            // hold the index of the current clicked video thumb
            var index = $('.vh').index(this);

            // if the current thumb does NOT have the current class
            if (!$('.thumb img:eq(' + index + ')').hasClass('current') && !$('.vh:eq('+ index +')').hasClass('0')) {
                // call fade in function to fade in the new selection
                fadeIn(index);
            }
        });

        $('.vh').bind('mouseleave', function () {
            // fade out all other thumbs
            fadeOut();
        });
    }

    function groupBtnEvt() {
        var button = $('#group ul li');
        // if the current thumb does NOT have the current class

        button.bind('click', function () {
            var index = $(button).index(this);

            if ((index + 1) !== prevGroup) {
                // fade all out first
                fadeOut();

                $('#group ul li a').css({
                    'background-color': '#e3e3e3',
                    'color': '#555'
                });
                $('#group ul li a:eq(' + index + ')').css({
                    'background-color': '#d0d0d0',
                    'color': '#000'
                });

                $('.vh.' + (index + 1) + ' .thumb img').each(function (i) {
                    fadeGroupIn($(this), $('.vh.' + (index + 1) + ' .hoverTitle:eq('+i+')'));
                });

                if (isMobile) {
                    //$('.vh').unbind('click');
                } else {
                    $('.vh').unbind('mouseover');
                    $('.vh').unbind('mouseleave');
                }

                prevGroup = index + 1;
            } else {

                // fade all out first
                fadeOut();
                if (isMobile) {
                    bindMobileEvents();
                } else {
                    bindRegEvents();
                }
                $('#group ul li a').css({
                    'background-color': '#e3e3e3',
                    'color': '#555'
                });
                prevGroup = 0;
            }
        });
    }

    // play video function
    function playVideo() {

        // play the video
        myPlayer.play();

        // set previous video index to current video index
        prevIndex = videoIndex;

    }

    // function that fade in the video thumbs
    function fadeIn(index) {
        // light up the thumb
        $('.thumb img:eq(' + index + ')').animate({
            opacity: 1 // animate opacity to 1
        }, 250, function () // at 250 milsiseconds, with callback
        {
            // add current class to current thumb
            $(this).addClass('current');
        });

		if (vidTitle[index].length > 0 || !isEmpty(vidTitle[index])) {

			// slide up the title
			$('.hoverTitle:eq(' + index + ')').animate({
				marginTop: '68px' // animate the margin to slide up
			}, 500, function () // at 500 milliseconds, with callback
			{
				// add current class to current title
				$(this).addClass('current');
			});

		}
    }

    // function that fade out the video thumbs
    function fadeOut() {
        // fade out each thumb
        $('.thumb img').each(function (i) {
			if ($('.vh:eq('+ i +')').hasClass('0')) {
				$(this).css('opacity',1).unbind('mouseleave');
			} else {
				$(this).animate({
					opacity: 0.85 // animate opacity to .85
				}, 250, function () // at 250 milliseconds, with callback
				{
					// if current thumb has the current class
					if ($(this).hasClass('current')) {
						// remove current class
						$(this).removeClass('current');
					}
				});
			}
        });

		// slide out each title
		$('.hoverTitle').each(function () {
			$(this).animate({
				marginTop: "100px" // animate the margin to slide down
			}, 250, function () // at 250 milliseconds, with callback
			{
				// if current thumb has current class
				if ($(this).hasClass('current')) {
					// remove class
					$(this).removeClass('current');
				}
			});
		});

    }

    // fading group in
    function fadeGroupIn(img, hTitle) {
        // light up the thumb
        img.animate({
            opacity: 1 // animate opacity to 1
        }, 250, function () // at 250 milsiseconds, with callback
        {
            // add current class to current thumb
            $(this).addClass('current');
        });

		if (hTitle.text().length > 0 || !hTitle.text().match(/^[\s ]*$/gi)) {
			// slide up the title
			hTitle.animate({
				marginTop: '68px' // animate the margin to slide up
			}, 500, function () // at 500 milliseconds, with callback
			{
				// add current class to current title
				$(this).addClass('current');
			});

		}
    }

    // function that sniff the UA of the client and show hidden div's for that device
    function sniffUA() {
        var ua = navigator.userAgent; // hold the user agent
        // structure to hold the available user agents
        var checker = {
            iphone: ua.match(/(iPhone|iPod|iPad)/), // iOS devices
            blackberry: ua.match(/BlackBerry/), // Blackberry devices
            android: ua.match(/Android/), // Android devices
            browser: ua.match(/(Mozilla|Webkit|msie|Opera)/) // desktop/laptop devices
        };

        // if agent is android
        if (checker.android) {
            $('#device').html('<p>You are viewing this website on an Android device.</p>');

            // return true for mobile event
            return true;
        }
        // if agent is ios
        else if (checker.iphone) {
            $('#device').html('<p>You are viewing this website on an iOS device.</p>');

            // return true for mobile event
            return true;
        }
        // if agent is blackberry devices
        else if (checker.blackberry) {
            $('#device').html('<p>You are viewing this website on a Blackberry device.</p>');

            // return true for mobile event
            return true;
        }
        // if agent is a desktop/laptop web browser
        else if (checker.browser) {
            $('#device').html('<p>You are viewing this website on a desktop/laptop web browser.</p>');

            // return false for regular event
            return false;
        }
        // if agent is unknow device
        else {
            $('#device').html('<p>You are viewing this website on an unknown device.</p>');

            // return true for mobile event
            return true;
        }
    }

	// check for empty field
    function isEmpty(str) {

        var strRE = /^[\s ]*$/gi;

        return strRE.test(str);

    }

});