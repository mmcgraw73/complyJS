/**
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

 Project: ComplyJS
 Copyright (C) 2016
 Author: Brian L. Ellis
 **/

jQuery(document).ready(function ($) {
    /* jshint loopfunc:true */
    var doc = jQuery(document),
        body = jQuery('html'),
        winWidth = window.innerWidth,
        menuOn = false, // Sets the menu off till tab key activates it
        outerIndex = 0, // outer index count of the adaLinks array
        innerIndex = 0, // inner index count of the jquery objects within adaLinks
        innerLength, // Length of the current inner array
        adaLinks = [], // All links associated with menus to be navigated via keyboard
        adaParents = [],  // All parent items for a submenu
        parentStatus = false, // Open/close for parent submenus. false = closed / true = opened
        firstParentEle, // This holds a value for the first ele in a sub-menu for when it is opened
        parentEle, // This holds the value of what the parent element is to refocus on the ele on submenu close
        parentEsc = false, // Escapes the parent class for when a menu recently closed
        prevParentHolder, // This holds a value for index skipping if the menu is never opened
        nextParentHolder, // This holds a value for index skipping if the menu is never opened
        arraySwitch = false,
        systemStart = false,
        screenSize,

        // Non menu variables for system interaction
        viewingMain = false, // Tells user if they are currently scrolled to content or not


        // Contrast color ADA variables
        colorSel = 0, // Array index hold for colorChecker
        foreground,
        background,
        foreSpec, // Combined RGB value in 16-base for determining luminance
        backSpec, // Combined RGB value in 16-base for determining luminance
        counter = 0, // This is used to stop a max call stack issue and issue a warning to the user
        arrayVal,
        arrayHold = [[], []],

        // Debug console css values
        debugCss = 'background: #FF0000; color:#FFFFFF; padding: 0 5px;',
        debugCss2 = 'background: #009900; color:#FFFFFF; padding: 0 20px; font-size: 16px;',
        debugCss3 = 'background: #000000; color:#FFFFFF; padding: 0 20px; font-size: 16px;',
        debugCss4 = 'background: #FFA500; color:#FFFFFF; padding: 0 20px; font-size: 16px;';


    /*************************************
     / ** GENERAL DOM ADA SANITATION
     **************************************/
    /**
     * Helper method to only retrieve text ele and not the children
     **/
    jQuery.fn.eleText = function () {
        return $(this).clone()
            .children()
            .remove()
            .end()
            .text();
    };

    /**
     * "b" and "i" tags are replaced with "strong" and "em."
     * all "a" tags are underlined
     **/
    $.adaSanitize = function () {
        if ($('b').length || $('i').length) {
            var widgetHTML = $('body').html();
            widgetHTML = widgetHTML
                .replace(/<b/g, '<b>').replace(/<\/strong>/g, '</strong>')
                .replace(/<i/g, '<i>').replace(/<\/em>/g, '</em>');
            $('body').html(widgetHTML);
        }

        $('a').each(function (index, el) {
            $(this).css('text-decoration', 'underline');
        });
    };

    /**
     * add ARIA tagging to all labels and buttons
     **/
    $.adaAria = function () {
        var text;

        // A timeout is employed to ensure any DOM manipulation occurring can safely do so before DOM traversing
        setTimeout(function () {
            // Buttons
            if ($('button').length) {
                $('button').each(function (index, el) {
                    if ($(this).attr('aria-label') === undefined) {
                        if ($(this).eleText() !== "") {
                            text = $(this).eleText();
                            $(this).attr('aria-label', text);
                        }
                        // Use the buttons title attribute
                        else if ($(this).attr('title') !== undefined) {
                            text = $(this).attr('title');
                            $(this).attr('aria-label', text);
                        }
                        // Search for span tag
                        else if ($(this).children('span').length && $(this).children('span').eq(0).eleText() !== "") {
                            text = $(this).children('span').eq(0).eleText();
                            $(this).attr('aria-label', text);
                        }
                        // Search for title element within button
                        else if ($(this).find('title').length && $(this).find('title').eq(0).eleText() !== "") {
                            text = $(this).find('title').eq(0).text();
                            $(this).attr('aria-label', text);
                        }
                    }
                });
            }

            // Labels
            if ($('label').length) {
                $('label').each(function (index, el) {
                    if ($(this).attr('aria-label') === undefined) {
                        $(this).attr('aria-label', $(this).eleText());
                    }
                });
            }

            // A tags hover/focus events
            $('a').on({
                mouseenter: function () {
                    if ($(this).css('text-decoration') !== "underline") {
                        $(this).css('text-decoration', 'underline !important').addClass('ada-a-tag');
                    }
                },
                focus: function () {
                    if ($(this).css('text-decoration') !== "underline") {
                        $(this).css('text-decoration', 'underline !important').addClass('ada-a-tag');
                    }
                },
                mouseleave: function () {
                    if ($(this).hasClass('ada-a-tag')) $(this).removeClass('ada-a-tag');
                },
                blur: function () {
                    if ($(this).hasClass('ada-a-tag')) $(this).removeClass('ada-a-tag');
                }
            });


        }, 500);
    };

    /**
     * add ALT tags to all images declared
     **/
    $.adaImages = function (array) {
        var text;
        // A timeout is employed to ensure any DOM manipulation occurring can safely do so before DOM traversing
        setTimeout(function () {
            for (var i = 0; i < array.length; i++) {
                $(array[i][0]).each(function (index, el) {
                    if ($(this).attr('alt') === "" || $(this).attr('alt') === undefined) {
                        if (array[i][1] === "parent") {
                            text = $(this).parents(array[i][2]).text();
                        } else if (array[i][1] === "sibling") {
                            text = $(this).siblings(array[i][2]).text();
                        } else if (array[i][1] === "combo") {
                            text = $(this).parents(array[i][2]).find(array[i][3]).text();
                        } else if (array[i][1] === "custom") {
                            text = array[i][2];
                        }
                        $(this).attr('alt', text);
                    }
                });
            }
        }, 500);
    };


    /*************************************
     / ** ADA Menu Navigator System
     **************************************/


    /**
     * Builds out the array so there is no need to touch the DOM for manipulation
     **/
    $.adaBuilder = function (array, screenVal) {
        // Apply screen breakpoint to system
        screenSize = screenVal;

        // Stop ada builder if no array is passed
        if (array === undefined) {
            console.log('%cYou have not defined an array of valid selectors.', debugCss);
            return false;
        }

        for (var i = 0; i < array.length; i++) {
            // Check to see if parent has been declared first
            if (array[i].length === 2) {
                adaLinks[i] = array[i][0];

                // Stop ada builder if parent element is not found
                if (array[i][1].length === 0) {
                    console.log(array[i][1] + '%c is not a valid parent element. Please fix before continuing.', debugCss);
                    return false;
                }

                adaParents[i] = array[i][1];
            } else {
                adaLinks[i] = array[i];
                adaParents[i] = null;
            }
        }

        // Initiate the key character events for the system
        keyCharEvents();
    };

    /**
     * Allows notification alerts for the system
     **/
    $.adaBuilder.notify = function (option) {
        var domEle, domEle2, bypass;

        // Add DOM ele to beginning of body as placeholder for notifications
        if (option === "content") {
            $('body').prepend('<div id="adaContent"></div>');
            domEle = $('#adaContent');
        } else if (option === "status") {
            $('body').append('<div id="adaStatus"></div>');
            domEle2 = $('#adaStatus');
        } else {
            $('body').prepend('<div id="adaContent"></div>');
            $('body').append('<div id="adaStatus"></div>');
            domEle = $('#adaContent');
            domEle2 = $('#adaStatus');
        }

        if (domEle.length) {
            domEle.html('Press "C" if you need to contrast colors further</br>Press SPACEBAR to skip to main content');
        }


        doc.on('keydown', function (event) {
            if (window.innerWidth > screenSize) {
                // SPACEBAR key
                if (event.which === 32) {
                    domEle.hasClass('start') ? domEle.removeClass('start') : domEle.addClass('start');
                }
                // Event for all key events except Esc or SPACEBAR
                else if (
                    (!event.shiftKey && event.which === 9) || // tab
                    event.which === 37 || // left
                    event.which === 38 || // up
                    event.which === 39 || // right
                    event.which === 40 || // down
                    (event.shiftKey && event.which === 9) // shift+tab
                ) {
                    if (viewingMain === "start") {
                        domEle.addClass('start');
                        domEle.css('height', "80px");
                        domEle2.text('Menu navigation turned on. Press \'Esc\' to turn off.');
                        domEle2.addClass('start').css('opacity', 1);
                        bypass = true;
                    } else if (bypass) {
                        domEle.removeClass('start');
                        domEle2.removeClass('start');
                        bypass = false;
                    }
                }
            }
        });
    };


    /**
     * Allows quick skipping to a defined section of the page
     **/
    $.adaMainContent = function (section, scrollSpeed) {

        body.on('keydown', function (event) {
            if (window.innerWidth > screenSize) {
                // Space Bar usage
                if (menuOn === true && event.which === 32 && viewingMain === "start") {
                    event.preventDefault();

                    $('html, body').animate({
                        scrollTop: $(section).offset().top
                    }, scrollSpeed === undefined ? 500 : scrollSpeed);
                    viewingMain = true;

                } else if (menuOn === true && event.which === 32 && viewingMain === true) {
                    event.preventDefault();

                    $('html, body').animate({
                        scrollTop: 0
                    }, scrollSpeed === undefined ? 500 : scrollSpeed);
                    viewingMain = "start";
                    $('#adaMainContent').addClass('show');
                } else {
                    $('#adaMainContent').removeClass('show');
                }
            }
        });
    };

    /**
     * Auto Contrast system
     **/
    $.adaContrast = function (array) {
        // Auto determine contrast and apply color
        if (array == "override") {

        }
        // Pass an array
        else if (array.length > 0) {
            for (var i = 0; i < array.length; i++) {
                array[i].addClass('ada-contrast');
            }
        } else {
            $('*').each(function () {
                $(this).addClass('ada-contrast');
            });
        }
    };

    /**
     * Debug options for the system
     **/
    $.adaDebug = function (option1) {
        if (adaLinks.length === 0) {
            console.log('%cADA Builder has not been ran yet. Run $.adaBuilder first with a valid array of elements', debugCss);
            return false;
        } else if (option1 === undefined) {
            console.log('%cNo argument has been passed. Please enter a valid argument.', debugCss);
            return false;
        }

        // Pass debug information if only 1 arg has been passed
        if (option1 === "adaLinks") {
            for (var i = 0; i < adaLinks.length; i++) {
                if (adaParents[i] === null || (adaParents[i] !== null && $(adaLinks[i][0]).parents(adaParents[i]).length === 0)) {
                    $(adaLinks[i][0]).parent().prepend("<div style=\"position: absolute; text-align: center; line-height: initial; padding: 5px 0; width: 30px; background:#009900; color: #FFFFFF; z-index: 9999;\">" + i + "</div>");
                } else {
                    $(adaParents[i]).prepend("<div style=\"position: absolute; text-align: center; line-height: initial; padding: 5px 0; width: 30px; background:#009900; color: #FFFFFF; z-index: 9999;\">" + i + "</div>");
                }

                console.log('%cMENU ARRAY ' + i, debugCss2);
                for (var j = 0; j < adaLinks[i].length; j++) {
                    console.log(adaLinks[i][j].href);
                }
            }
        } else if (option1 === "parentLinks") {
            console.log('%cPARENTS ARRAY', debugCss4);
            for (var k = 0; k < adaParents.length; k++) {
                if (adaParents[k] !== null) {
                    console.log('Menu ' + k + ': ' + adaParents[k]);
                } else {
                    console.log('Menu ' + k + ': ' + "null");
                }
            }
        } else if (option1 === "index") {
            doc.on('keydown', function (event) {
                if (window.innerWidth > screenSize) {
                    if (
                        (!event.shiftKey && event.which === 9) || // tab
                        event.which === 37 || // left
                        event.which === 38 || // up
                        event.which === 39 || // right
                        event.which === 40 || // down
                        (event.shiftKey && event.which === 9) // shift+tab
                    ) {
                        console.log('%cMenu: ' + outerIndex + ' Menu Item: ' + innerIndex, debugCss3);
                    }
                }
            });
        } else if (option1 === "event") {
            doc.on('keydown', function (event) {
                if (window.innerWidth > screenSize) {
                    // Tab
                    if (!event.shiftKey && event.which === 9) {
                        console.log('Event: Tab');
                    }
                    // Shift+tab
                    else if (event.shiftKey && event.which === 9) {
                        console.log('Event: Shift+Tab');
                    }
                    // ESC key - Reset entire system and remove all classes/attributes
                    else if (event.which === 27) {
                        console.log('Event: Esc');
                    }
                    // Left Arrow or shift+tab
                    else if (event.which === 37 || (event.shiftKey && event.which === 9)) {
                        console.log('Event: Left arrow');
                    }
                    // Right arrow key
                    else if (event.which === 39) {
                        console.log('Event: Right arrow');
                    }
                    // Up arrow key
                    else if (event.which === 38) {
                        console.log('Event: Up arrow');
                    }
                    // Down arrow key
                    else if (event.which === 40) {
                        console.log('Event: Down arrow');
                    }
                }
            });
        } else if (option1 === "allMenu") {
            for (var ii = 0; ii < adaLinks.length; ii++) {
                if (adaParents[ii] === null || (adaParents[ii] !== null && $(adaLinks[ii][0]).parents(adaParents[ii]).length === 0)) {
                    $(adaLinks[ii][0]).parent().prepend("<div style=\"position: absolute; text-align: center; line-height: initial; padding: 5px 0; width: 30px; background:#009900; color: #FFFFFF; z-index: 9999;\">" + ii + "</div>");
                } else {
                    $(adaParents[ii]).prepend("<div style=\"position: absolute; text-align: center; line-height: initial; padding: 5px 0; width: 30px; background:#009900; color: #FFFFFF; z-index: 9999;\">" + ii + "</div>");
                }

                console.log('%cMENU ARRAY ' + ii, debugCss2);
                for (var jj = 0; jj < adaLinks[ii].length; jj++) {
                    console.log(adaLinks[ii][jj].href);
                }
            }
            console.log('%cEND MENU ARRAYS', debugCss2);

            doc.on('keydown', function (event) {
                if (window.innerWidth > screenSize) {
                    if (
                        (!event.shiftKey && event.which === 9) || // tab
                        event.which === 37 || // left
                        event.which === 38 || // up
                        event.which === 39 || // right
                        event.which === 40 || // down
                        (event.shiftKey && event.which === 9) // shift+tab
                    ) {
                        console.log('%cMenu: ' + outerIndex + ' Menu Item: ' + innerIndex, debugCss3);
                    }

                    // Tab
                    if (!event.shiftKey && event.which === 9) {
                        console.log('Event: Tab');
                    }
                    // Shift+tab
                    else if (event.shiftKey && event.which === 9) {
                        console.log('Event: Shift+Tab');
                    }
                    // ESC key - Reset entire system and remove all classes/attributes
                    else if (event.which === 27) {
                        console.log('Event: Esc');
                    }
                    // Left Arrow or shift+tab
                    else if (event.which === 37 || (event.shiftKey && event.which === 9)) {
                        console.log('Event: Left arrow');
                    }
                    // Right arrow key
                    else if (event.which === 39) {
                        console.log('Event: Right arrow');
                    }
                    // Up arrow key
                    else if (event.which === 38) {
                        console.log('Event: Up arrow');
                    }
                    // Down arrow key
                    else if (event.which === 40) {
                        console.log('Event: Down arrow');
                    }
                }
            });

            console.log('%cPARENTS ARRAY', debugCss4);
            for (var kk = 0; kk < adaParents.length; kk++) {
                if (adaParents[kk] !== null) {
                    console.log('Menu ' + kk + ': ' + adaParents[kk]);
                } else {
                    console.log('Menu ' + kk + ': ' + "null");
                }
            }
            console.log('%cEND PARENTS ARRAY', debugCss4);
        }
    };

    function keyCharEvents() {
        doc.on('keydown', function (event) {
            if (window.innerWidth > screenSize) {
                // Tab
                if (!event.shiftKey && event.which === 9) {
                    arrayIncrementer();
                    // Initiate menu
                    menuOn = true;

                    // Remove any content viewing attributes
                    if (!viewingMain) {
                        viewingMain = "start";
                    }

                }
                // ESC key - Reset entire system and remove all classes/attributes
                else if (event.which === 27) {
                    systemExit();
                }
                // Left Arrow or shift+tab
                else if (event.which === 37 || (event.shiftKey && event.which === 9)) {
                    if (menuOn) arrayDecrementer();
                }
                // Right arrow key
                else if (event.which === 39) {
                    if (menuOn) arrayIncrementer();
                }
                // Up arrow key
                else if (event.which === 38) {
                    if (menuOn) arrayDecrementer();
                }
                // Down arrow key
                else if (event.which === 40) {
                    if (parentStatus === "skipper") {
                        innerIndex = 0;
                        $('.working').addClass('ada-parent').removeClass('working');
                        $(adaLinks[outerIndex][innerIndex]).addClass('working').focus();
                        parentStatus = "opened";
                        arraySwitch = false;
                        return;
                    } else if (menuOn) {
                        arrayIncrementer();
                    }
                }


                // Parent watcher event for all key events except escape
                if (
                    (!event.shiftKey && event.which === 9) || // tab
                    event.which === 37 || // left
                    event.which === 38 || // up
                    event.which === 39 || // right
                    event.which === 40 || // down
                    (event.shiftKey && event.which === 9) // shift+tab
                ) {
                    if (menuOn) event.preventDefault();
                    parentWatcher(event);
                }
            }
        });

        // Reset system on DOCUMENT RESIZE
        $(window).resize(function () {
            var curWidth;
            curWidth = window.innerWidth;
            if (winWidth > 760 && curWidth <= 760) {
                systemExit();
                winWidth = curWidth;
            } else if (winWidth <= 760 && curWidth > 760) {
                systemExit();
                winWidth = curWidth;
            }
        });
    }

    /*************************************
     / ** HELPER METHODS OF THE SYSTEM
     **************************************/
    /**
     * This totally exits the system
     **/
    function systemExit() {
        var domEle = $('#adaContent'),
            domEle2 = $('#adaStatus');

        innerIndex = 0;
        outerIndex = 0;
        menuOn = false;
        arraySwitch = false;
        parentStatus = false;

        $('.working, .ada-parent').removeClass('working ada-parent');

        domEle2.text('Menu navigation turned off');
        domEle2.removeClass('start').addClass('exit');
        domEle.css('height', 0);

        setTimeout(function () {
            domEle2.css('opacity', 0);
        }, 400);
        setTimeout(function () {
            domEle.removeClass('start');
            domEle2.removeClass('exit');
        }, 1000);
    }

    function maxInnerEval() {
        innerLength = adaLinks[outerIndex].length - 1;
    }

    /**
     * Responsible for index increment procedures
     **/
    function arrayIncrementer() {
        if (parentStatus === "skipper") {
            innerIndex = nextParentHolder;
            parentStatus = false;
        }
        // Very beginning of adaLinks
        if (menuOn === false) {
            maxInnerEval();
            $(adaLinks[outerIndex][innerIndex]).addClass('working').focus();
            if ($('body, html').scrollTop() > 100) {
                $('html, body').animate({
                    scrollTop: 0
                }, 500);
            }
        }
        // End of the inner array but not the absolute end of the outer array
        else if (innerIndex === innerLength && outerIndex !== adaLinks.length - 1) {
            arraySwitch = adaLinks[outerIndex][innerIndex];
            $('.working').removeClass('working');
            outerIndex++;
            innerIndex = 0;
            $(adaLinks[outerIndex][innerIndex]).addClass('working').focus();

            // Evaluate next inner array's length
            maxInnerEval();
        }
        // Absolute end of the outer array
        else if (innerIndex === innerLength && outerIndex === adaLinks.length - 1) {
            return;
        }
        // default behavior
        else if (menuOn === true) {
            if (viewingMain === "start" || viewingMain === true) {
                viewingMain = false;
            }

            $(adaLinks[outerIndex][innerIndex]).removeClass('working');
            innerIndex++;
            $(adaLinks[outerIndex][innerIndex]).addClass('working').focus();
        }
    }

    /**
     * Responsible for index decrement procedures
     **/
    function arrayDecrementer() {
        if (parentStatus === "skipper") {
            innerIndex = prevParentHolder;
            parentStatus = false;
        }
        // Very beginning of adaLinks
        if (outerIndex === 0 && innerIndex === 0) {
            return;
        }
        // Beginning of the inner array but not the absolute beginning of the outer array
        else if (innerIndex === 0 && outerIndex !== 0) {
            arraySwitch = adaLinks[outerIndex][innerIndex];
            $('.working').removeClass('working');
            outerIndex--;

            // Evaluate the previous inner array's length and assign the val to the innerIndex
            maxInnerEval();
            innerIndex = innerLength;

            $(adaLinks[outerIndex][innerIndex]).addClass('working').focus();
        }
        // default behavior
        else {
            $(adaLinks[outerIndex][innerIndex]).removeClass('working');
            innerIndex--;
            $(adaLinks[outerIndex][innerIndex]).addClass('working').focus();
        }
    }

    /**
     * Monitors index selection to see if a parent ele has been declared and is present
     **/
    function parentWatcher(event) {
        //--------------------------------------------------------------------------
        // If parent status anything but false to allow for multiple status attr
        //--------------------------------------------------------------------------

        if (parentEsc) {
            parentEle.removeClass('working');
            parentEsc = false;
        }

        if (parentStatus !== false) {
            // If parent menu is opened
            if (parentStatus === "opened") {
                if (arraySwitch === false) {
                    if ($(adaLinks[outerIndex][innerIndex]).parents(adaParents[outerIndex]).length === 0) {
                        $('.ada-parent').removeClass('ada-parent');
                        $(adaLinks[outerIndex][innerIndex]).removeClass('working');
                        parentEle.addClass('working').focus();

                        parentStatus = true;
                    }
                } else {
                    var parentClass;
                    adaParents[outerIndex] === null ? parentClass = "XXnothingXX" : parentClass = adaParents[outerIndex];
                    if ($(arraySwitch).parents(parentClass).length === 0) {
                        $('.ada-parent').removeClass('ada-parent');
                        $(adaLinks[outerIndex][innerIndex]).removeClass('working');
                        parentEle.addClass('working').focus();
                        nextParentHolder = 0;
                        parentStatus = false;
                        arraySwitch = false;
                    }
                }
            }
            // Enter or down arrow to open menu
            else if (event.which === 13 || event.which === 40) {
                $('.working').addClass('ada-parent').removeClass('working');
                innerIndex = firstParentEle;
                $(adaLinks[outerIndex][innerIndex]).addClass('working').focus();
                parentStatus = "opened";
            }
            // tab or right arrow
            else if ((!event.shiftKey && event.which === 9) || event.which === 39) {
                $('.working').removeClass('working');
                innerIndex = nextParentHolder;
                $(adaLinks[outerIndex][innerIndex]).addClass('working').focus();
                parentStatus = false;
            }
            // left, right or shift+tab
            else if (event.which === 37 || event.which === 38 || (event.shiftKey && event.which === 9)) {
                $('.working').removeClass('working');
                innerIndex = prevParentHolder;
                $(adaLinks[outerIndex][innerIndex]).addClass('working').focus();
                parentStatus = false;
            }
        }
        //----------------------------------------------------------
        // Change parent status if selector has a submenu parent
        //----------------------------------------------------------
        else if ($(adaLinks[outerIndex][innerIndex]).parents(adaParents[outerIndex]).length !== 0 && adaParents[outerIndex] !== null) {
            // Closed status eval first
            $(adaLinks[outerIndex][innerIndex]).removeClass('working');
            parentEle = $(adaLinks[outerIndex][innerIndex]).parents(adaParents[outerIndex]);
            parentEle.addClass('working').focus();


            // Get first ele if down, right or tab was the key event
            if (event.which === 39 || event.which === 40 || (!event.shiftKey && event.which === 9)) firstParentEle = innerIndex;

            // next menu not part of submenu
            for (var i = innerIndex; i < innerLength; i++) {
                if ($(adaLinks[outerIndex][i]).parents(adaParents[outerIndex]).length === 0) {
                    nextParentHolder = i;
                } else if (i === innerLength - 1) {
                    nextParentHolder = adaLinks[outerIndex].length - 1;
                    parentStatus = "skipper";
                }
            }

            // prev menu not part of submenu
            for (var i2 = innerIndex; i2 >= 0; i2--) {

                if ($(adaLinks[outerIndex][i2]).parents(adaParents[outerIndex]).length === 0) {
                    prevParentHolder = i2;
                } else if (i2 === 0) {
                    prevParentHolder = 0;
                    parentStatus = "skipper";
                }

                // Get first ele if up, left or shift+tab was the key event
                if (event.which === 37 || event.which === 38 || (event.shiftKey && event.which === 9)) {
                    if ($(adaLinks[outerIndex][i2]).parents(adaParents[outerIndex]).length !== 0) firstParentEle = i2;
                }
            }
            parentStatus !== "skipper" ? parentStatus = true : parentStatus = "skipper";
        }
    }

    /*************************************
     / ** COLOR CONTRAST ADA COMPLIANCE
     **************************************/
    function getContrastYIQ(color, which) {
        var L,
            vals = [color[0], color[1], color[2]];

        if (which) {
            foreground = color;
            foreSpec = color[0] * color[1] * color[2];
        } else {
            background = color;
            backSpec = color[0] * color[1] * color[2];
        }

        // Changing the RGB vals to a luminance to val
        for (var i = 0; i < vals.length; i++) {
            if (vals[i] <= 10) {
                vals[i] = vals[i] / 3294;
            } else {
                vals[i] = Math.pow((vals[i] / 269 + 0.0513), 2.4);
            }
        }

        L = 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];

        return L;

    }

    function contrastChecker(font, background, fontEle, bgEle) {

        var L1 = getContrastYIQ(font, true),
            L2 = getContrastYIQ(background),
            output,
            ans,
            whichDarker;

        if (L1 >= L2) {
            output = (L1 + 0.05) / (L2 + 0.05);
        } else {
            output = (L2 + 0.05) / (L1 + 0.05);
        }
        ans = output >= 4.5;
        if (foreSpec <= backSpec) {
            whichDarker = "fore";
        } else {
            whichDarker = "back";
        }
        if (!ans) {
            changeColor([foreground, background, whichDarker], fontEle, bgEle);
        }

    }

    function changeColor(arr, fontEle, bgEle) {

        arrayVal = arr;
        arrayHold = [[], []];
        arrayHold.push(arr[2]);
        if (counter < 3000) {
            // User warning to split up color check calls in system
            if (counter === 2999) {
                console.log('%cYou have exceed the recommended selector limit and should scope the selectors more accurately for $.eleColorChecker()', 'background: red; color: white; padding: 0 5px; font-size: -16px;');
            }


            var L1, L2, output, ans;

            // Foreground change
            if (arrayVal[2] === "fore") {
                for (var i = 0; i < 3; i++) {
                    arrayVal[0][i] = arrayVal[0][i] - 2;
                    arrayVal[1][i] = arrayVal[1][i] + 2;

                    if (arrayVal[1][i] > 255) {arrayVal[1][i] = 255;}
                    if (arrayVal[0][i] < 1) {arrayVal[0][i] = 0;}
                    arrayHold[0].push(arrayVal[0][i]);
                    arrayHold[1].push(arrayVal[1][i]);
                }
            } else {
                for (var ii = 0; ii < 3; ii++) {
                    arrayVal[0][ii] = arrayVal[0][ii] + 2;
                    arrayVal[1][ii] = arrayVal[1][ii] - 2;
                    if (arrayVal[0][ii] > 255) arrayVal[0][ii] = 255;
                    if (arrayVal[1][ii] < 0) arrayVal[1][ii] = 0;
                    arrayHold[0].push(arrayVal[0][ii]);
                    arrayHold[1].push(arrayVal[1][ii]);
                }
            }


            // Luminance eval
            for (var k = 0; k < 2; k++) {
                for (var j = 0; j < 3; j++) {
                    if (arrayVal[k][j] <= 10) {
                        arrayVal[k][j] = arrayVal[k][j] / 3294;
                    } else {
                        arrayVal[k][j] = Math.pow((arrayVal[k][j] / 269 + 0.0513), 2.4);
                    }
                }
            }

            L1 = 0.2126 * arrayVal[0][0] + 0.7152 * arrayVal[0][1] + 0.0722 * arrayVal[0][2];
            L2 = 0.2126 * arrayVal[1][0] + 0.7152 * arrayVal[1][1] + 0.0722 * arrayVal[1][2];


            if (L1 >= L2) {
                output = (L1 + 0.05) / (L2 + 0.05);
            } else {
                output = (L2 + 0.05) / (L1 + 0.05);
            }

            ans = output >= 4.5;
            counter++;
            if (!ans) {
                changeColor(arrayHold, fontEle, bgEle);
            } else {
                fontEle.css('color', "rgb(" + arrayHold[0][0] + "," + arrayHold[0][1] + "," + arrayHold[0][2] + ")");
                bgEle.css('background', "rgb(" + arrayHold[1][0] + "," + arrayHold[1][1] + "," + arrayHold[1][2] + ")");
            }
        }
    }

    function colorSanitizer(rgb) {
        var a;
        if (rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)") {
            return "transparent";
        }

        if (rgb.substr(0, 4) === "rgb(") {
            a = rgb.substr(4);
        } else {
            a = rgb.substr(5);
        }

        a = a.substr(0, a.length - 1).split(',');
        for (var i = 0; i < a.length; i++) {
            a[i] = parseInt(a[i]);
        }
        if (a.length === 4) {a.pop();}
        return a;
    }

    $.eleColorChecker = function (selectorArg) {
        jQuery(document).on('keydown', function (event) {
            if (event.which === 67 && menuOn !== false) {
                $.eleColorCheckerSys(selectorArg);
            }
        });
    };

    $.eleColorCheckerSys = function (selectorArg) {
        var argPasser = selectorArg;

        // Reset counter every time it's called
        counter = 0;

        if (selectorArg === undefined) {
            console.log('I AM UNDEF');
            selectorArg = $('*');
        } else {
            console.log(selectorArg[colorSel]);
            selectorArg = $(selectorArg[colorSel]);
        }

        selectorArg.each(function () {
            var thisE = $(this).prop('nodeName');

            // Skip all non-relevant ele
            if ((
                    thisE == "MAIN" ||
                    thisE == "NAV" ||
                    thisE == "HEADER" ||
                    thisE == "DIV" ||
                    thisE == "P" ||
                    thisE == "H1" ||
                    thisE == "H2" ||
                    thisE == "H3" ||
                    thisE == "H4" ||
                    thisE == "H5" ||
                    thisE == "H6" ||
                    thisE == "A" ||
                    thisE == "P" ||
                    thisE == "LI" ||
                    thisE == "SPAN" ||
                    thisE == "LABEL" ||
                    thisE == "PRE"
                ) || selectorArg !== undefined) {
                var fontEle = $(this),
                    bgEle = $(this),
                    fontColor = colorSanitizer($(this).css('color')),
                    bgColor = colorSanitizer($(this).css('background-color')),
                    parentArr,
                    tempParentColor;

                if (bgColor === "transparent") {
                    parentArr = $(this).parents();

                    for (var i = 0; i < parentArr.length; i++) {
                        if ($(parentArr[i]).prop('nodeName') === "BODY") {
                            bgEle = $('body');
                            bgColor = [256, 256, 256];
                            break;
                        } else if ($(parentArr[i]).css('background-color') !== "rgba(0, 0, 0, 0)") {
                            bgEle = $(parentArr[i]);
                            bgColor = colorSanitizer($(parentArr[i]).css('background-color'));
                            break;
                        } else if (i === parentArr.length - 1) {
                            bgEle = $('body');
                            bgColor = [256, 256, 256];
                        }
                    }
                }
                contrastChecker(fontColor, bgColor, fontEle, bgEle);
            }
        });

        if (argPasser.length > 1 && colorSel <= selectorArg.length + 1) {
            colorSel++;
            $.eleColorCheckerSys(argPasser);
        }
    };
}(jQuery));
