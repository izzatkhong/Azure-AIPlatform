// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.


function ShowHideTags(i) {
    var node = document.getElementById("tagdiv" + i);
    if (node.style.display === "none") {
        node.style.display = "block";
    }
    else {
        node.style.display = "none";
    }


    for (var j = 0; j < 10; j++) {
        var id = "resultdiv" + j;
        if (document.getElementById(id) === null) {
            break;
        }
        document.getElementById(id).style.top = (j > 1 ? 15 : 0) + 'px';
        document.getElementById(id).style.position = 'relative';
    }

}

function UpdateResults(data, q) {
    var resultsHtml = '';

    if (data.count !== 0) {
        startDocCount = 1;
    }
    var currentDocCount = currentPage * 10;

    if (currentPage > 1) {
        startDocCount = ((currentPage - 1) * 10) + 1;
    }
    if (currentDocCount > data.count) {
        currentDocCount = data.count;
    }

    //$("#doc-count").html(` Available Results: ${data.count}`);
    $("#doc-count").html(`${data.count} Result${data.count > 1 ? "s" : ""} Found.`);

    for (var i = 0; i < data.results.length; i++) {

        var result = data.results[i].document;
        result.idx = i;
        if (typeof result.tagDisplay === 'undefined') {
            result.tagDisplay = 'none';
        }
        console.log('result', result);

        var id = result.id;
        var name = result.metadata_storage_name.split(".")[0];
        var path = result.metadata_storage_path + token;
        var summary = generateSummary(result.content, q);
        var highlightedSummary = highlight(summary, q);
        var tags = GetTagsHTML(result);

        if (path !== null) {
            var classList = "results-div ";
            if (i === 0) classList += "results-sizer";

            var pathLower = path.toLowerCase();

            var buttonIcon = "expand.png";
            if (result.tagDisplay === "block") {
                buttonIcon = "collapse.png"
            }

            if (pathLower.includes(".jpg") || pathLower.includes(".png")) {
                resultsHtml += `<div id="resultdiv${i}" class="${classList}">
                                    <div class="search-result">
                                        <img class="img-result" style='max-width:100%;' src="${path}"  onclick="ShowDocument('${id}');"/>
                                        <div class="results-header">
                                            <h4>${name}
                                                <img src="/images/${buttonIcon}" height="30px" onclick="ShowHideTags(${i});">
                                            </h4>
                                            <div id="tagdiv${i}" class="tag-container" style="margin-top:10px;display:${result.tagDisplay}">${tags}</div>
                                        </div>
                                    </div>
                                </div>`;
            }
            else if (pathLower.includes(".mp3") || result.audiourl != null) {

                var audioType = "mp3";
                var audioPath = path;

                if (result.audiourl != null) {
                    audioPath = result.audiourl;

                    if (result.audiourl.toLowerCase().includes(".wav")) {
                        audioType = "wav";
                    } else if (result.audiourl.toLowerCase().includes(".ogg")) {
                        audioType = "ogg";
                    }
                }

                resultsHtml += `<div id="resultdiv${i}" class="${classList}" style="width: 100%; padding-right: 40px;">
                                    <div class="search-result">
                                        <div class="audio-result-div" onclick="ShowDocument('${id}');">
                                            <audio controls>
                                                <source src="${audioPath}" type="audio/${audioType}">
                                                Your browser does not support the audio tag.
                                            </audio>
                                        </div>
                                        <div class="results-header">
                                            <h4>${name}
                                                <img src="/images/${buttonIcon}" height="30px" onclick="ShowHideTags(${i});">
                                            </h4>
                                            <div id="tagdiv${i}" class="tag-container" style="margin-top:10px;display:${result.tagDisplay}">${tags}</div>
                                        </div>                               
                                    </div>
                                </div>`;
            }
            else if (pathLower.includes(".mp4") || result.videourl != null) {
                var videoPath = path;

                if (result.videourl != null) {
                    videoPath = result.videourl;
                }

                resultsHtml += `<div id="resultdiv${i}" class="${classList}" style="width: 100%; padding-right: 40px;">
                                    <div class="search-result">
                                        <div class="video-result-div" onclick="ShowDocument('${id}');">
                                            <video controls class="video-result">
                                                <source src="${videoPath}" type="video/mp4">
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                        <hr />
                                        <div class="results-header">
                                            <h4>${name}
                                                <img src="/images/${buttonIcon}" height="30px" onclick="ShowHideTags(${i});">
                                            </h4>
                                            <div id="tagdiv${i}" class="tag-container" style="margin-top:10px;display:${result.tagDisplay}">${tags}</div>
                                        </div>  
                                    </div>
                                </div>`;
            }
            else {
                var icon = " ms-Icon--Page";

                if (pathLower.includes(".pdf")) {
                    icon = "ms-Icon--PDF";
                }
                else if (pathLower.includes(".htm")) {
                    icon = "ms-Icon--FileHTML";
                }
                else if (pathLower.includes(".xml")) {
                    icon = "ms-Icon--FileCode";
                }
                else if (pathLower.includes(".doc")) {
                    icon = "ms-Icon--WordDocument";
                }
                else if (pathLower.includes(".ppt")) {
                    icon = "ms-Icon--PowerPointDocument";
                }
                else if (pathLower.includes(".xls")) {
                    icon = "ms-Icon--ExcelDocument";
                }

                //var buttonIcon = "expand.png";
                //if (result.tagDisplay === "block") {
                //    buttonIcon = "collapse.png"
                //}

                resultsHtml += `<div id="resultdiv${i}" class="${classList}">
                                    <div class="search-result">
                                        <div class="card mt-3 documentSearchCard">
                                            <span class="card-header documentSearchCardHeader" onclick="ShowDocument('${id}');">
                                                <div class="documentSearchDocName">
                                                    <i class="html-icon ms-Icon ${icon}"></i>${name}
                                                </div>
                                                <div class="documentSearchDocDownloadBtn">
                                                    <a href="${path}"><div class="documentSearchDocDownloadBtnFiller">Download</div></a>
                                                </div>
                                            </span>
                                            <div class="card-body documentSearchCardBody">
                                                <p>${highlightedSummary}</p>
                                            </div>
                                            <div class="card-footer documentSearchCardFooter">
                                                <img src="/images/${buttonIcon}" height="30px" onclick="ShowHideTags(${i});" class="documentSearchCardFooterExpandBtn">
                                                <div id="tagdiv${i}" class="tag-container" style="margin-top:10px;display:${result.tagDisplay}">${tags}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
            }
        }
        else {
            // TODO: Handle errors showing result.
        }
    }

    $("#doc-details-div").html(resultsHtml);
}


function UpdateQnaResults(data, q) {
    var resultsHtml = '';

    //answer: "4"
    //paragraph: "The PCP Project had 16 recordable injuries, 4 of which were DART incidents, in 17,611,598 field hours. The PCP Project’s recordable incident rate is therefore 0.18 per 200,000 field hours, which is better than Industry for large projects but higher than the PETRONAS average."
    //query: "petro"
    //title: "F2_PET2804CLO PCP.pdf"
    
    var name = data.title.split(".")[0];
    var summary = data.paragraph;
    var highlightedSummary = highlight(summary, data.answer);
    var path = "/files/DocumentEntities/" + data.title;
    var pathLower = data.title.toLowerCase();
    var classList = "results-div results-sizer";

    var icon = " ms-Icon--Page";

    if (pathLower.includes(".pdf")) {
        icon = "ms-Icon--PDF";
    }
    else if (pathLower.includes(".htm")) {
        icon = "ms-Icon--FileHTML";
    }
    else if (pathLower.includes(".xml")) {
        icon = "ms-Icon--FileCode";
    }
    else if (pathLower.includes(".doc")) {
        icon = "ms-Icon--WordDocument";
    }
    else if (pathLower.includes(".ppt")) {
        icon = "ms-Icon--PowerPointDocument";
    }
    else if (pathLower.includes(".xls")) {
        icon = "ms-Icon--ExcelDocument";
    }
    
    resultsHtml += `<div id="resultdiv" class="${classList}">
                                    <div class="search-result">
                                        <div class="card mt-3 documentSearchCard">
                                            <span class="card-header documentSearchCardHeader" onclick="ShowLocalDocument('/files/DocumentEntities/','${data.title}');">
                                                    <div class="documentSearchDocName">
                                                    <i class="html-icon ms-Icon ${icon}"></i>${name}
                                                </div>
                                                <div class="documentSearchDocDownloadBtn">
                                                    <a href="${path}"><div class="documentSearchDocDownloadBtnFiller">Download</div></a>
                                                </div>     
                                                <div class="search-answer">
                                                    Answer: ${data.answer}
                                                </div>
                                            </span>
                                            <div class="card-body documentSearchCardBody">
                                                <p>${highlightedSummary}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;

    $("#doc-details-div").addClass("doc-details-div-fadeup");

    $("#doc-details-div").html(resultsHtml);
}

function UpdateDocEntitiesResults(data, document) {
    var resultsHtml = '';
    
    var paragraphs = data;
    var name = document.split(".")[0];
    var path = "/files/DocumentEntities/" + document;
    var pathLower = document.toLowerCase();
    var highlightedSummaryList = [];
    var legends = [];

    if (!Array.isArray(paragraphs)) {
        $('.empty-data').css("display", "block");
        return;
    }

    paragraphs.forEach(p => {
        var highlightedSummary = highlightEntities(p);

        highlightedSummaryList.push(highlightedSummary.highlightedText);
        legends = highlightedSummary.legends;
    });
    console.log('legends', legends)
    
    var classList = "results-div results-sizer";

    var icon = " ms-Icon--Page";

    if (pathLower.includes(".pdf")) {
        icon = "ms-Icon--PDF";
    }
    else if (pathLower.includes(".htm")) {
        icon = "ms-Icon--FileHTML";
    }
    else if (pathLower.includes(".xml")) {
        icon = "ms-Icon--FileCode";
    }
    else if (pathLower.includes(".doc")) {
        icon = "ms-Icon--WordDocument";
    }
    else if (pathLower.includes(".ppt")) {
        icon = "ms-Icon--PowerPointDocument";
    }
    else if (pathLower.includes(".xls")) {
        icon = "ms-Icon--ExcelDocument";
    }

    resultsHtml += `<div id="resultdiv" class="${classList}">
                                    <div class="search-result">
                                        <div class="card mt-3 documentSearchCard">
                                            <span class="card-header documentSearchCardHeader" onclick="ShowLocalDocument('/files/DocumentEntities/','${document}');">
                                                    <div class="documentSearchDocName">
                                                    <i class="html-icon ms-Icon ${icon}"></i>${name}
                                                </div>
                                                <div class="documentSearchDocDownloadBtn">
                                                    <a href="${path}"><div class="documentSearchDocDownloadBtnFiller">Download</div></a>
                                                </div>  
                                            </span>`;

    highlightedSummaryList.forEach(p => {
        resultsHtml += `<div class="card-body documentSearchCardBody">
                            <p>${p}</p>
                        </div>`;
    })
    
    resultsHtml += `</div>
                </div>
            </div>`;

    $("#doc-details-div").addClass("doc-details-div-fadeup");


    $("#doc-details-div").html(resultsHtml);

    // Generate Legends HTML
    var lengendsHtml = '';


    if (legends.length > 0) {
        legends.forEach(l => {
            lengendsHtml += `<div class="legends">
                                <span class="legends-color" style="background:${l.color}"></span>
                                <div class="legends-title">
                                    ${l.title}
                                </div>
                            </div>`;
        });

        $("#doc-legends").css("display", "block");
        $("#doc-legends-list").html(lengendsHtml);
    } else {
        $("#doc-legends").css("display", "none");
    }
}

function UpdateWidgetResults(data, q) {
    var resultsHtml = '';
    var legends = [];
    var videosResult = $(".video-result-div");
    var audioResult = $(".audio-result-div");
    var searchResult = $(".search-result");

    console.log('widget', data);
    console.log("videosResult", videosResult)

    if (typeof data === "object") {

        resultsHtml += `<div class="widget-info">
                                <div class="widget-info-title">${(data.query_type !== undefined) ? data.query_type : ""}</div >
                                <div class="widget-project-title">${q}</div>
                            </div>`;

        if (data.picture !== undefined) {
            resultsHtml += `<div class="widget-picture-container">
                                <a href="${data.picture}" target="_blank">
                                    <img src="${data.picture}" alt="Image">
                                    <span class="see-photo ms-Icon ms-Icon--Search ms-Icon--Search-mirrored"></span>
                                </a>
                            </div>`;
        }

        if (data.Project_Objective !== undefined) {
            resultsHtml += `<div class="widget-project-objective">
                                <div class="widget-info-title">Project Objective</div>
                                <p class="widget-info-value">${data.Project_Objective}</p>
                            </div>`;
        }
        
        Object.keys(data).forEach((key) => {
            if (key !== "Project_Objective" && key !== "query_type" && key !== "picture"
                && key !== "General entities" && key !== "Petronas entities" && key !== "Oil and Gas entities") {

                var entities = "";
                if (data["General entities"] && data["General entities"].indexOf(key) != -1) {
                    entities = "general-entities";

                    if (legends.indexOf("General Entities") == -1)
                        legends.push("General Entities")

                } else if (data["Petronas entities"] && data["Petronas entities"].indexOf(key) != -1) {
                    entities = "petronas-entities";

                    if (legends.indexOf("Petronas Entities") == -1)
                        legends.push("Petronas Entities")

                } else if (data["Oil and Gas entities"] && data["Oil and Gas entities"].indexOf(key) != -1) {
                    entities = "oilgas-entities";

                    if (legends.indexOf("Oil And Gas Entities") == -1)
                        legends.push("Oil And Gas Entities")

                }

                resultsHtml += `<div class="widget-info ${entities}">
                                    <span class="widget-info-title">${key.replace(/_/g, " ")}:</span>
                                    <span class="widget-info-value">${data[key]}</span>
                            </div>`;
            }
        });

        if (legends.length > 0) {

            resultsHtml += `<div class="legend-border"></div>`;

            legends.forEach(l => {

                var legendColor;

                switch (l) {
                    case "General Entities":
                        legendColor = "#FFBE4F";
                        break;
                    case "Petronas Entities":
                        legendColor = "#00A19C";
                        break;
                    case "Oil And Gas Entities":
                        legendColor = "#E75552";
                        break;
                }

                resultsHtml += `<div class="legends">
                                    <span class="legends-color" style="background:${legendColor}"></span>
                                    <div class="legends-title">
                                        ${l}
                                    </div>
                                </div>`;
            });
        }

        $("#searchResults #doc-details-div").attr('class', 'col-7');
        $("#doc-widgets").css("display", "block");
        $("#doc-widgets").attr('class', 'col-4 doc-widgets-fadeIn');
        $("#doc-widgets").html(resultsHtml);
    } else {
        $("#searchResults #doc-details-div").attr('class', 'col-12');
        $("#doc-widgets").css("display", "none");
        $("#doc-widgets").attr('class', 'col-4');
        $("#doc-widgets").html("");
    }

    var widgetVisible = $("#doc-widgets").css('display') !== 'none';
    console.log("widgetVisible", widgetVisible)
   
    if (widgetVisible) {
        $("#graph-svg-tree").css('display', 'block');
        $("#graph-svg").css('display', 'none');
        $("#facet-picker-customised").css('display', 'none');
        $(".graph-svg-tree-legends").css('display', 'block');
        updateTree(q);
    } else {
        $("#graph-svg-tree").css('display', 'none');
        $("#graph-svg").css('display', 'block');
        $("#facet-picker-customised").css('display', 'block');
        $(".graph-svg-tree-legends").css('display', 'none');
    }
    
   
}
