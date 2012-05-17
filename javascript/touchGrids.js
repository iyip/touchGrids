var tg = {
    gridData: new Array(9),
    ajaxQuotes: [],
    counter: 0,
    currRow: 1,
    currCol: 1,
    currBlock: null,
    stateObj: {},

    activate: ('createTouch' in document) ? 'tap' : 'click',
    /**
     * Outputs info messages to console if it is available.
     * @param msg    the message to write
     */
    log: function(msg) {
        if (window.console) {
            console.log(msg);
        }
    },

    initHistory: function() {
        // Bind to state change
        $(window).bind('statechange',tg.handleStateChg);

        tg.stateObj.place = "overview";
        window.History.replaceState(tg.stateObj, "", "?place=overview");
        //window.History.pushState(tg.stateObj, "", "?place=overview");
        var State = window.History.getState();
        tg.log('Initial state: place =' + State.data.place + ", title=" + State.title + ", url=" + State.url);
    },

    handleStateChg: function() {
        var State = window.History.getState();
        tg.log('statechange: place=' + State.data.place + ", title= " +  State.title + ", url=" + State.url);
        //check stateObj and call displayDetail or displayOverview accordingly
        if (State.data.place == "overview") {
           tg.displayOverview();
        } else if (State.data.place == "detail") {
            tg.displayDetail();
        }
    },

    initData: function() {
        tg.gridData["block1-1"] =
        {
            "css": "background-color:#ffa07a",
            "quote": "Peace comes from within. Do not seek it without."
        };
        tg.gridData["block1-2"] =
        {
            "css": "background-color:#add8e6;",
            "quote": "Our strength grows out of our weaknesses."
        };
        tg.gridData["block1-3"] =
        {
            "css": "background-color:#778899",
            "quote": "The best vitamin to be a happy person is B1."
        };
        tg.gridData["block2-1"] =
        {
            "css": "background-color:#87ceeb",
            "quote": "A sense of humor is a major defense against minor troubles."
        };
        tg.gridData["block2-2"] =
        {
            "css": "background-color:#ee82ee",
            "quote": "Failure defeats losers, failure inspires winners."
        };
        tg.gridData["block2-3"] =
        {
            "css": "background-color:#9acd32",
            "quote": "Growing old is mandatory; growing up is optional."
        };
        tg.gridData["block3-1"] =
        {
            "css": "background-color:#bc8f8f",
            "quote": "Failure is success if we learn from it."
        };
        tg.gridData["block3-2"] =
        {
            "css": "background-color:#eee8aa;",
            "quote": "Well done is better than well said."
        };
        tg.gridData["block3-3"] =
        {
            "css": "background-color:#00ffff",
            "quote": "Without courage, wisdom bears no fruit."
        };
    },

    createBlocks: function() {
        var html = "";
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var rowNo = i + 1;
                var colNo = j + 1;
                var key = "block" + (rowNo) + "-" + (colNo);
                var css = tg.gridData[key].css;
                var quotation = tg.gridData[key].quote;
                html += "<div id=\"" + "block" + (rowNo) + "-" + (colNo) + "\" style=\"" + css + "\" class=\"block row" + (rowNo) +  " col" + (colNo) + "\">";
                html += "<span>" + quotation + "</span></div>";
            }
        }

        //tg.log("html is " + html);
        $(".blockContainer").html(html);
        $(".block").css("height",(parseInt($(window).height()))/3);
    },

    attachBlockData: function() {
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var rowNo = i + 1;
                var colNo = j + 1;
                var key = "block" + (rowNo) + "-" + (colNo);
                $("#" + key).data("blockData", tg.gridData[key]);
            }
        }
    },

    updateDataForRowOrCol: function (currNo, isRow) {
        for (var i = 0; i < 3; i++) {
            var idx = i + 1;
            var key;
            if (isRow) {
                key = "block" + currNo + "-" + idx;
            } else {
                key = "block" + idx + "-" + currNo;
            }
            $("#" + key).data("blockData", tg.gridData[key]);
        }
    },

    logBlockData: function() {
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                var rowNo = i + 1;
                var colNo = j + 1;
                var key = "block" + (rowNo) + "-" + (colNo);
                tg.log(key + " data: css is " + $("#" + key).data("blockData").css +
                        " , quote is " + $("#" + key).data("blockData").quote);
            }
        }
    },

    /* Get 9 quotes from server and save them in tg.ajaxQuotes array for consumption */
    getQuotesFromServer: function() {
        /*$.ajax({
            type: "GET",
            url: "/myurl",
            dataType: "json",
            timeout: 1000,
            success: tg.displayAjaxQuote,
            error: function(xhr, status, error) {
                console.log("Error");
            }
        });*/
        var stubData = new Array();
        for (var i = 0; i < 9; i++) {
            stubData.push("Quote" + ++tg.counter + " retrieved via Ajax call.");
        }
        var stubDataString = JSON.stringify(stubData);
        var parsedData = JSON.parse(stubDataString);
        //tg.log("Data retrived from ajax is " + parsedData);
        $.each(parsedData, function(i, quote) {
            tg.ajaxQuotes.push(quote);
        });
    },

    /**
     *  display ajax quote from ajaxQuotes if it still has quotes, otherwise, invoke getQuotesFromServer, then display
     **/
    displayAjaxQuote: function(direction) {
        if (tg.ajaxQuotes.length <= 0) {
            tg.getQuotesFromServer();
        }
        var rowNo = tg.currRow;
        var colNo = tg.currCol;
        var currId;
        var temp;
        if (direction === "left") {
            //swipe left: old blockrow-1 is gone, blockrow-2 becomes blockrow-1, blockrow-3 becomes blockrow-2,
            //and new blockrow-3 is the same color as old blockrow-1 and text is first element from ajaxQuotes
            temp = tg.gridData["block" + rowNo + "-1"];
            tg.gridData["block" + rowNo + "-1"] = tg.gridData["block" + rowNo + "-2"];
            tg.gridData["block" + rowNo + "-2"]= tg.gridData["block" + rowNo + "-3"];
            currId = "block" + rowNo + "-3";
        } else if (direction === "right") {
            //swipe right: blockrow-1 becomes blockrow-2, blockrow-2 becomes blockrow-3, old blockrow-3 is gone,
            //and new blockrow-1 is the same color as old blockrow-3 and text is first element from ajaxQuotes
            temp = tg.gridData["block" + rowNo + "-3"];
            tg.gridData["block" + rowNo + "-3"] = tg.gridData["block" + rowNo + "-2"];
            tg.gridData["block" + rowNo + "-2"]= tg.gridData["block" + rowNo + "-1"];
            currId = "block" + rowNo + "-1";
        } else if (direction === "up") {
            //swipe up: old block1-col is gone, block2-col becomes block1-col, block3-col becomes block2-col,
            //and new block3-col is the same color as old block1-col and text is first element from ajaxQuotes
            temp = tg.gridData["block1-" + colNo];
            tg.gridData["block1-" + colNo] = tg.gridData["block2-" + colNo];
            tg.gridData["block2-" + colNo]= tg.gridData["block3-" + colNo];
            currId = "block3-" + colNo;
        } else { // (direction === "down")
            //swipe down: old block3-col is gone, block2-col becomes block3-col, block1-col becomes block2-col,
            //and new block1-col is the same color as old block3-col and text is first element from ajaxQuotes
            temp = tg.gridData["block3-" + colNo];
            tg.gridData["block3-" + colNo] = tg.gridData["block2-" + colNo];
            tg.gridData["block2-" + colNo]= tg.gridData["block1-" + colNo];
            currId = "block1-" + colNo;
        }

        tg.gridData[currId] = temp;
        tg.gridData[currId].quote = tg.ajaxQuotes[0];
        //update blockData bound to all the blocks in this particular row according to changed tg.gridData
        if((direction === "left") || (direction === "right")) {
            tg.updateDataForRowOrCol(rowNo, true);
        } else {
            tg.updateDataForRowOrCol(colNo, false);
        }

        //display detail block using the updated data
        var blockData = $("#" + currId).data("blockData");
        var cssToUse = blockData.css;
        $("#blockDetail").css(cssToUse.substring(0, cssToUse.indexOf(":")), cssToUse.substring(cssToUse.indexOf(":") + 1));
        $("#blockDetail").html(blockData.quote);

        //remove last element from array since it is consumed already, array length will reflect new length
        tg.ajaxQuotes.splice(0, 1);
    },

    handleSwipe: function (direction) {
        var rowNo = tg.currRow;
        var colNo = tg.currCol;
        tg.log ("current block is " + "#block" + rowNo + "-" + colNo);
        tg.log("direction is " + direction);

        //In swipeLeft case, we need to make sure column is less than 3, otherwise, we are at the end
        //In swipeRight case, we need to make sure column is greater than 1, otherwise, we are at the end
        //In swipeUp case, we need to make sure row is less than 3, otherwise, we are at the end
        //In swipeDown case, we need to make sure row is greater than 1, otherwise, we are at the end
        if (((direction === "left") && (colNo < 3)) ||
            ((direction === "right") && (colNo > 1)) ||
            ((direction === "up") && (rowNo < 3)) ||
            ((direction === "down") && (rowNo > 1))) {
            //swipe left: display block with the same row number and col+1 number
            //swipe right: display block with the same row number and col-1 number
            //swipe up: display block with the same col number and row+1 number
            //swipe down: display block with the same col number and row-1 number
            var newColNo = (direction === "left") ? (parseInt(colNo) + 1) :
                           (direction === "right") ? (parseInt(colNo) - 1) : colNo;
            var newRowNo = (direction === "up") ? (parseInt(rowNo) + 1) :
                           (direction === "down") ? (parseInt(rowNo) - 1) : rowNo;
            tg.log ("block to display is " + "#block" + newRowNo + "-" + newColNo);

            var newBlockData = $("#block" + newRowNo + "-" + newColNo).data("blockData");
            var cssToUse = newBlockData.css;
            $("#blockDetail").css(cssToUse.substring(0, cssToUse.indexOf(":")), cssToUse.substring(cssToUse.indexOf(":") + 1));
            $("#blockDetail").html(newBlockData.quote);
            tg.currRow = newRowNo;
            tg.currCol = newColNo;
        } else {
            //tg.log("No more quotes, need to call ajax now!");
            tg.displayAjaxQuote(direction);
        }
    },

    displayDetail: function() {
        var id = tg.currBlock.attr("id"); //id is e.g block1-3
        tg.currRow = id.substring(5, id.indexOf("-")); //remove "block-"
        tg.currCol = id.substring(id.indexOf("-") + 1); //get the rest of string after -
        tg.log ("current block is " + "#block" + tg.currRow + "-" + tg.currCol);

        $("#overview").removeClass("showing").addClass("hidden");
        $("#detail").removeClass("hidden").addClass("showing");
        var blockData = tg.currBlock.data("blockData");
        var cssToUse = blockData.css;
        $("#blockDetail").css(cssToUse.substring(0, cssToUse.indexOf(":")), cssToUse.substring(cssToUse.indexOf(":") + 1));
        $("#blockDetail").css("height",parseInt($(window).height())-65);
        $("#blockDetail").html(blockData.quote);
    },

    displayOverview: function() {
        $("#detail").removeClass("showing").addClass("hidden");
        $("#overview").removeClass("hidden").addClass("showing");
        tg.createBlocks();
        tg.attachBlockData();
    },

    init: function () {
        tg.initData();
        tg.createBlocks();
        tg.attachBlockData();

        //this is to prevent the page jumping in swipe
        $('body').bind('touchmove', function(e){e.preventDefault()})

        //click or tap a block to see its detail (adding to history as well so later we can come back to overview)
        $("#overview .block").live(tg.activate, function(event) {
            tg.currBlock = $(this);
            tg.stateObj.place = "detail";
            window.History.pushState(tg.stateObj, "", "?place=detail");
            // pushState will cause statechange event, which calls handleStateChg
            // which will call tg.displayDetail()
        });

        //pinch-in in detail block to go back to blocks overview, only work on iOS, use history back on android
        $("#blockDetail").live('pinchIn', function(event) {
            tg.stateObj.place = "overview";
            window.History.pushState(tg.stateObj, "", "?place=overview");
            // pushState will cause statechange event, which calls handleStateChg
            // which will call tg.displayOverview()
        });

        //swipe left to see the right sibling detail block
        $("#blockDetail").live('swipeLeft', function (event) {
            tg.handleSwipe("left");
        });

        //swipe right to see the left sibling detail block
        $("#blockDetail").live('swipeRight', function(event) {
            tg.handleSwipe("right");
        });

        //swipe up to see the upper sibling detail block
        $("#blockDetail").live('swipeUp', function(event) {
            tg.handleSwipe("up");
        });

        //swipe down to see the lower sibling detail block
        $("#blockDetail").live('swipeDown', function(event) {
            tg.handleSwipe("down");
        });

        //click the go back button on block detail to go back to blocks overview page
        $(".btnDiv .backBtn").live(tg.activate, function(event) {
            tg.stateObj.place = "overview";
            window.History.pushState(tg.stateObj, "", "?place=overview");
        });

        tg.initHistory();

    }
};

Zepto(function($){
  tg.init();
})


