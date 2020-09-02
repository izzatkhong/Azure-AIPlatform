// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

var apiUrl = '';
var mrcApiUrl = '';
var docEntitiesApiUrl = '';
var widgetApiUrl = '';
var colorScheme = ["#00a19c", "#cfa8f7", "#94bee5", "#9ad8d2", "#ffebeb", "#ffd896", "#999A9C", "#9B151D", "#abbaff", "#8B0000", "#FFA500",
    "#FF0000", "#BDB76B", "#FFE4B5", "#00FF00", "#6B8E23", "#808000", "#1E90FF", "#CD853F", "#BC8F8F", "#D2B48C", "#008B8B", "#ADD8E6", "#800080",
    "#40E0D0", "#00FFFF", "#FFE4E1"];
var darkColorScheme = [
    "#00A19C", "#58478D", "#FFBE4F", "#9B151D", "#E75552", "#8B0000", "#FF0000", "#000000", "#214559", "#014600", "#7f4300", "#d5b60a", "#800000", "#35063e", "#490206", "#937a62", "#25342b", "#d90166", "#c14a09", "#3e6257", "#34414e"
];

//Initialize Fabric elements
var SpinnerElements = document.querySelectorAll(".ms-Spinner");
for (var i = 0; i < SpinnerElements.length; i++) {
    new fabric['Spinner'](SpinnerElements[i]);
}

var SearchBoxElements = document.querySelectorAll(".ms-SearchBox");
for (var j = 0; j < SearchBoxElements.length; j++) {
    new fabric['SearchBox'](SearchBoxElements[j]);
}

var isGridInitialized = false;
var $grid = $('#doc-details-div1');

$(document).ready(function () {
    if (q) {
        document.getElementById('q').value = q;
    }
    if (q !== null && q !== 'undefined') {
        console.log(window.location.href.toLowerCase())
        if (window.location.href.toLowerCase().indexOf('qna') > -1) {
            QnaSearch();
        } else {
            Search();
        }
    }
});

function InitLayout() {

    if (isGridInitialized === true) {
        $grid.masonry('destroy'); // destroy
    }

    $grid.masonry({
        itemSelector: '.results-div',
        columnWidth: '.results-sizer'
    });

    $grid.imagesLoaded().progress(function () {
        $grid.masonry('layout');
    });

    isGridInitialized = true;
}

function FabricInit() {
    var CheckBoxElements = document.querySelectorAll(".ms-CheckBox");
    for (var i = 0; i < CheckBoxElements.length; i++) {
        new fabric['CheckBox'](CheckBoxElements[i]);
    }
}

function htmlEncode(value) {
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

function highlight(text, term) {
    var terms = term.split(' ');
    var highlightedText = text;
    terms.forEach(function (t) {
        var regex = new RegExp(t, 'gi');
        highlightedText = highlightedText.replace(regex, function (str) {
            return "<span class='highlight'><b>" + str + "</b></span>";
        });
    });
    
    return highlightedText;
}

function highlightEntities(data) {
    var highlightedText = data.paragraph;
    var legends = [];
    var rData = [];
    var projectData = [];

    // rearrange object position
    Object.keys(data).forEach((key, i) => {
        if (key !== "paragraph") {

            var objData = {
                key: key,
                value: data[key]
            };

            if (key.toLowerCase().startsWith("project")) {
                projectData.push(objData);
            } else {
                rData.push(objData);
            }

        }
    });

    rData = projectData.concat(rData);
    console.log('rData', rData)


    rData.forEach((r, i) => {

        legends.push({
            title: r.key.replace(/_/g, " "),
            //color: colorScheme[i]
            color: darkColorScheme[i]
        });

        if (r.value != "") {
            var entities = r.value.replace("[", "").replace("]", "").split(",");

            entities.forEach(function (t) {
                var invalid = /[°"§%()\[\]{}=\\?´`'#<>|,;.:+_-]+/g;
                t = t.replace(invalid, "");
                t = t.replace(/\'/gi, '')

                var regex = new RegExp(t, 'gi');
                highlightedText = highlightedText.replace(regex, function (str) {
                    //return `<span class='tooltip-custom' style='background-color:${colorScheme[i]}'>
                    //            <b>${str}</b>
                    //            <span class="tooltiptext">${key.replace(/_/g, " ")}</span>
                    //        </span>`;

                    //return "<span style='background-color:" + colorScheme[i] + "'><b>" + str + "</b></span>";
                    return "<span style='background-color:" + darkColorScheme[i] + "'><b>" + str + "</b></span>";
                });
            });
        }
    });

    return {
        highlightedText: highlightedText,
        legends: legends
    };
}

function generateSummary(text, term) {
    if (text.length <= 500) {
        return text;
    }
    var termLower = term.toLowerCase();
    var textLower = text.toLowerCase().replace(/\\n/g, ' ');

    var textToSummarize = text.replace(/\\n/g, ' ').trim();

    var firstTermInstancePos = textLower.indexOf(termLower);

    if (firstTermInstancePos > 0) {
        var sub = textToSummarize.substring(0, firstTermInstancePos);
        var lastSentenceEndBeforeTerm = sub.lastIndexOf(". ");
        if (lastSentenceEndBeforeTerm === -1) {
            lastSentenceEndBeforeTerm = 0;
        }
        textToSummarize = textToSummarize.substring(lastSentenceEndBeforeTerm + 2).trim();
    }
    
    var summary = textToSummarize.substring(0, 500).trim() + '...';

    return summary;
}

function formatDate(date) {
    var year = date.getFullYear(),
        month = date.getMonth() + 1, // months are zero indexed
        day = date.getDate(),
        hour = date.getHours(),
        minute = date.getMinutes(),
        second = date.getSeconds(),
        hourFormatted = hour % 12 || 12, // hour returned in 24 hour format
        minuteFormatted = minute < 10 ? "0" + minute : minute,
        morning = hour < 12 ? "am" : "pm";

    return month + "/" + day + "/" + year + " " + hourFormatted + ":" +
        minuteFormatted + morning;
}

function formatLastRunStatus(data) {
    var lastRun = '<div><p>Last index run finished with result "' + data.lastResult.status + '" at ' + formatDate(new Date(data.lastResult.endTime)) + '</p></div>'
    if (data.lastResult.status === 'transientFailure') {
        lastRun += '<div>Error Message: ' + data.lastResult.errorMessage + '</div>';
    }
    lastRun += '<div><a id="histLink" href="javascript:updateDisplayFullHistory()">Show Full Indexing History (last 20 runs)</a></div>'
    return lastRun;
}

function formatRunHistory(data) {
    var status = '<div><table style="width: 100%"><tr><th>End time</th><th>Status</th><th>Docs Status</th></tr>';
    for (var i = 0; i < data.executionHistory.length && i < 20; i++) {
        var item = data.executionHistory[i];
        var succeededItemCount = item.itemsProcessed - item.itemsFailed;
        status += '<tr><th>' + formatDate(new Date(item.endTime)) + '</th><th>' + item.status + '</th><th>' + succeededItemCount + '/' + item.itemsProcessed + '</th></tr>';

    }
    status += '</table></div>'

    return status;
}