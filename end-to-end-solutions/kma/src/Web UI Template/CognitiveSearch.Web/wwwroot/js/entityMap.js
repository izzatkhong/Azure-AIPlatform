// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// Graph Configuration
var nodeRadius = 15;
var nodeSeparationFactor = 1;
var nodeChargeStrength = -950;
var nodeChargeAccuracy = 0.4;
var nodeDistance = 100;

function SearchEntities(facet) {
    if (currentPage > 1) {
        if (q !== $("#q").val()) {
            currentPage = 1;
        }
    }
    q = $("#q").val();

    Unload();
    document.getElementById("entity-loading-indicator").style.display = "block";

    if (facet === null || facet === 'undefined') {
        facet = 'location';
    }

    GetGraph(q, facet);
    GetFacets(facet);
}

// Load Graph with Search data
function GetGraph(q, facet) {
    if (q === null) {
        q = "*";
    }

    if (facet === null) {
        facet = 'keyPhrases';
    }

    //var url = 'https://localhost:44311/api';

    $.ajax({
        type: "GET",
        url: `${apiUrl}/graph/${facet}?query=${q}`,
        success: function (data) {
            // Do something interesting here.
            update(data.links, data.nodes);
        }
    });
}

// Load Graph with Search data
function GetFacets(selectedFacet) {
    //var url = 'https://localhost:44311/api';

    if ($('#facet-picker')[0].options.length === 0) {
        $.ajax({
            type: "GET",
            url: `${apiUrl}/facets`,
            success: function (data) {

                var $select2 = $('#facet-picker');
                var $select = $('#facet-picker-customised .customised-facet-picker-list');

                var $selectedList = $('#facet-picker-customised .customised-facet-picker-list-item')

                if ($selectedList.length == 0) {
                    data.forEach(function (f) {
                        console.log(f.name);
                        var opt = document.createElement('option');
                        opt.innerHTML = f.name;
                        $select.append('<li class="customised-facet-picker-list-item ' + (f.name === selectedFacet ? "active" : "") + '" name="' + f.name + '">' + (f.name === "keyPhrases" ? "Key Phrases" : f.name) + '</li>')
                        if (f.name === selectedFacet) {
                            opt.selected = true;
                            $("#facet-picker-customised .customised-facet-picker-placeholder-text")[0].innerHTML = (f.name === "keyPhrases" ? "Key Phrases" : f.name);
                        }
                        $select2.append(opt);
                    });
                }

                $("#facet-picker-customised .customised-facet-picker-list-item").click(function () {
                    $("#facet-picker-customised .customised-facet-picker-list-item").removeClass("active");
                    $(this).addClass("active");

                /*To do after an item is selected*/
                    var placeholderNameAttr = $(this).attr('name');
                    var placeholderText = placeholderNameAttr === "keyPhrases" ? "Key Phrases" : placeholderNameAttr;


                    $("#facet-picker").val(placeholderNameAttr).trigger('change');
                    $("#facet-picker-customised .customised-facet-picker-placeholder-text")[0].innerHTML = placeholderText;

                    $("#facet-picker-customised.customised-facet-picker-container").removeClass("focused");

                    $("#facet-picker-customised .customised-facet-picker-list-container").hide();

                    $("#facet-picker-customised.customised-facet-picker-container").blur();

                });
            }
        });

    }
}

function LoadEntityMap() {
    document.getElementById("results-list-view").style.display = "none";
    document.getElementById("details-modal").style.display = "none";
    document.getElementById("results-entity-map").style.display = "block";
    document.getElementById("entity-loading-indicator").style.display = "block";
    Unload();
    GetFacets('location');
    GetGraph(q, 'locations');

    document.getElementById("q").value = q;
    q = q;
}

function UnloadEntityMap() {
    document.getElementById("results-entity-map").style.display = "none";
    document.getElementById("results-list-view").style.display = "block";
    Unload();

    document.getElementById("q").value = q;
    document.getElementById("btn-search").click();
}

function EntityMapClick(view) {
    if (view === 'entitymap') {
        LoadEntityMap();
    } else {
        UnloadEntityMap();
    }
}


function Unload() {
    svg.selectAll(".link").remove();
    svg.selectAll(".edgepath").remove();
    svg.selectAll(".node").remove();
    svg.selectAll(".edgelabel").remove();
    //var $select = $('#facet-picker');
    //$select.empty();
}

var colors = d3.scaleOrdinal(d3.schemeCategory10);
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    node,
    link;

svg.append('defs').append('marker')
    .attrs({
        'id': 'arrowhead',
        'viewBox': '-0 -5 10 10',
        'refX': 25,
        'refY': 0,
        'orient': 'auto',
        'markerWidth': 10,
        'markerHeight': 10,
        'xoverflow': 'visible'
    })
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#999')
    .style('stroke', 'none');

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink()
        .id(function (d) { return d.id; })
        .distance(150).strength(.5))
    .force("charge", d3.forceManyBody()
        .strength(nodeChargeStrength)
        .theta(nodeChargeAccuracy))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide(nodeRadius));

function isDirectNeighbor(links, selectedNodeId, node) {
    for (var i = 0; i < links.length; i++) {
        if (links[i].source === selectedNodeId && links[i].target === node.id) {
            return true;
        }
    }
    return false;
}

function update(links, nodes, selectedNodeId) {

    if (typeof selectedNodeId === 'undefined' || selectedNode === null) {
        selectedNodeId = nodes[0].id;
    }

    for (var i = 0; i < nodes.length; i++) {
        nodes[i].isDirectNeighbor = isDirectNeighbor(links, selectedNodeId, nodes[i]);
        nodes[i].nodeRadius = nodeRadius;
        nodes[i].fontweight = "normal";
    }

    nodes[selectedNodeId].isDirectNeighbor = true;
    nodes[selectedNodeId].nodeRadius = nodeRadius * 2;
    nodes[selectedNodeId].fontweight = 'bold';

    // Graph implementation
    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    var svg = d3.select("#graph-svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    svg.append('defs').append('marker')
        .attrs({
            'id': 'arrowhead',
            'viewBox': '-0 -5 10 10',
            'refX': 13,
            'refY': 0,
            'orient': 'auto',
            'markerWidth': 10,
            'markerHeight': 10,
            'xoverflow': 'visible'
        })
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke', 'none');

    simulation = d3.forceSimulation()
        .force("link", d3.forceLink()
            .id(function (d) { return d.id; })
            .distance(150).strength(.5))
        .force("charge", d3.forceManyBody()
            .strength(nodeChargeStrength)
            .theta(nodeChargeAccuracy))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide(nodeRadius));


    link = svg.selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "link"); 

    link.append("title")
        .text(function (d) { return d.type; });

    node = svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .on('dblclick', dblClicked)
        .on('click', clicked);
        //.call(d3.drag()
        //    .on("start", dragstarted)
        //    .on("drag", dragged)
    //);
    node.append("circle")
        .attr("r", d => d.nodeRadius)
        .style("fill", function (d, i) { if (d.isDirectNeighbor) { return colors(i); } return "#DDDDDD" });
    node.append("title")
        .text(d => d.name);

    // Text Attributes for nodes
    node.append("text")
        .attr("dx", d => d.nodeRadius)
        .attr("dy", ".35em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("font-weight", d => d.fontweight)
        //.attr("fill", function (d, i) { if (d.isDirectNeighbor) { return "black"; } return "#DDDDDD" })
        .attr("fill", function (d, i) { if (d.isDirectNeighbor) { return "#fff"; } return "#DDDDDD" })
        .text(d => d.name);

    edgepaths = svg.selectAll(".edgepath")
        .data(links)
        .enter()
        .append('path')
        .attrs({
            'class': 'edgepath',
            'fill-opacity': 0,
            'stroke-opacity': 0,
            'id': function (d, i) { return 'edgepath' + i; },
            'marker-end': 'url(#arrowhead)'
        })
        .style("pointer-events", "none");


    simulation
        .nodes(nodes)
        .on("tick", ticked);
    simulation.force("link")
        .links(links);
    document.getElementById("entity-loading-indicator").style.display = "none";

}

function updateTree(search) {

    if (search) {
        search = search.toLowerCase();
    }
    
    var treeData = getTreeData();

    // set the dimensions and margins of the diagram
    var margin = { top: 40, right: 0, bottom: 50, left: 0 },
        width = 2500 - margin.left - margin.right,
        height = 620 - margin.top - margin.bottom;

    // declares a tree layout and assigns the size
    var treemap = d3.tree()
        .size([width, height]);

    //  assigns the data to a hierarchy using parent-child relationships
    var nodes = d3.hierarchy(treeData);

    // maps the node data to the tree layout
    nodes = treemap(nodes);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#graph-svg-tree")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom),
        g = svg.append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    // adds the links between the nodes
    var link = g.selectAll(".link")
        .data(nodes.descendants().slice(1))
        .enter().append("path")
        .attr("class", "link")
        .attr("d", function (d) {
            return "M" + d.x + "," + d.y
                + "C" + d.x + "," + (d.y + d.parent.y) / 2
                + " " + d.parent.x + "," + (d.y + d.parent.y) / 2
                + " " + d.parent.x + "," + d.parent.y;
        });

    // adds each node as a group
    var node = g.selectAll(".node")
        .data(nodes.descendants())
        .enter().append("g")
        .attr("class", function (d) {
            return "node" +
                (d.children ? " node--internal" : " node--leaf");
        })
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    // adds the circle to the node
    node.append("circle")
        .attr("r", 12);

    // add category
    node.append("text")
        .attr("dy", ".35em")
        .attr("y", function (d) { return 0; })
        .attr("class", "tree-category")
        .style("text-anchor", "middle")
        .style("fill", "black")
        .text(function (d) { return d.data.category; });

    // adds the text to the node
    node.append("text")
        .attr("dy", ".35em")
        .attr("y", function (d) { return d.children ? -25 : 25; })
        .style("text-anchor", "middle")
        .text(function (d) { return d.data.name; });

    var paths = searchTree(treeData, search, []);
    console.log('paths', paths);

    if (typeof (paths) !== "undefined") {
        openPaths(paths, search);
    }

}

function searchTree(obj, search, path) {
    if (obj.name.toLowerCase() === search) { //if search is found return, add the object to the path and return it
        path.push(obj);
        return path;
    }
    else if (obj.children || obj._children) { //if children are collapsed d3 object will have them instantiated as _children
        var children = (obj.children) ? obj.children : obj._children;
        for (var i = 0; i < children.length; i++) {
            path.push(obj);// we assume this path is the right one
            var found = searchTree(children[i], search, path);
            if (found) {// we were right, this should return the bubbled-up path from the first if statement
                return found;
            }
            else {//we were wrong, remove this parent from the path and continue iterating
                path.pop();
            }
        }
    }
    else {//not the right object, return false so it will continue to iterate in the loop
        return false;
    }
}

function openPaths(paths, search) {
    for (var i = 0; i < paths.length; i++) {
        if (paths[i].name.toLowerCase() == search) {
            paths[i].class = 'found-search';

            if (paths[i].children !== undefined) {
                for (var x = 0; x < paths[i].children.length; x++) {
                    paths[i].children[x].class = 'found-child';
                    updateHighlight(paths[i].children[x], search);
                }
            }

        } else {
            paths[i].class = 'found-parent';
        }
        updateHighlight(paths[i], search);
    }
}

function updateHighlight(source) {
    var nodes = d3.select("#graph-svg-tree").selectAll(".node");
    console.log('aa', nodes);

    nodes.attr("class", function (d) {
        if (d.data.name.toLowerCase() == source.name.toLowerCase()) {
            return source.class;
        } else {
            return "node";
        }
    });
}

function getTreeData() {
    return {
        "name": "Petronas Entity Tree",
        "parent": "null",
        "children": [
            {
                "name": "ANGSI B GAS",
                "parent": "Petronas Entity Tree",
                "children": [
                    {
                        "name": "Malaysia",
                        "category": "C",
                        "parent": "ANGSI B GAS",
                        "children": [
                            {
                                "name": "Peninsular Malaysia",
                                "category": "RE",
                                "parent": "Malaysia",
                                "children": [
                                    {
                                        "name": "Angsi field",
                                        "category": "F",
                                        "parent": "Peninsular Malaysia",
                                        "children": [
                                            {
                                                "name": "D15",
                                                "category": "W",
                                                "parent": "Angsi field"
                                            },
                                            {
                                                "name": "D16",
                                                "category": "W",
                                                "parent": "Angsi field",
                                                "children": [
                                                    {
                                                        "name": "Glen Tanar",
                                                        "category": "RI",
                                                        "parent": "D16",
                                                        "children": [
                                                            {
                                                                "name": "Tender Assisted Drilling Rig",
                                                                "category": "E",
                                                                "parent": "Glen Tanar"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "name": "D17",
                                                "category": "W",
                                                "parent": "Angsi field"
                                            }
                                        ]
                                    },
                                    {
                                        "name": "Bekok",
                                        "category": "F",
                                        "parent": "Peninsular Malaysia"
                                    },
                                    {
                                        "name": "Besar",
                                        "category": "F",
                                        "parent": "Peninsular Malaysia"
                                    },
                                    {
                                        "name": "PM 302",
                                        "category": "F",
                                        "parent": "Peninsular Malaysia"
                                    },
                                    {
                                        "name": "Penara",
                                        "category": "F",
                                        "parent": "Peninsular Malaysia"
                                    },
                                    {
                                        "name": "SEPAT",
                                        "category": "F",
                                        "parent": "Peninsular Malaysia"
                                    }
                                ]
                            },
                            {
                                "name": "Sarawak",
                                "category": "RE",
                                "parent": "Malaysia",
                                "children": [
                                    {
                                        "name": "D21",
                                        "category": "F",
                                        "parent": "Sarawak"
                                    },
                                    {
                                        "name": "D18",
                                        "category": "F",
                                        "parent": "Sarawak"
                                    },
                                    {
                                        "name": "J4",
                                        "category": "F",
                                        "parent": "Sarawak"
                                    },
                                    {
                                        "name": "Kayu Manis South East",
                                        "category": "F",
                                        "parent": "Sarawak"
                                    },
                                    {
                                        "name": "Kumang",
                                        "category": "F",
                                        "parent": "Sarawak"
                                    },
                                    {
                                        "name": "Anjung Kecil",
                                        "category": "F",
                                        "parent": "Sarawak",
                                        "children": [
                                            {
                                                "name": "AJK-A1",
                                                "category": "W",
                                                "parent": "Anjung Kecil",
                                                "children": [
                                                    {
                                                        "name": "Aquamarine",
                                                        "category": "RI",
                                                        "parent": "AJK-A1",
                                                        "children": [
                                                            {
                                                                "name": "Jack-Up Rig",
                                                                "category": "E",
                                                                "parent": "Aquamarine"
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                "name": "AJK-A2",
                                                "category": "W",
                                                "parent": "Anjung Kecil"
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "Sabah",
                                "category": "RE",
                                "parent": "Malaysia",
                                "children": [
                                    {
                                        "name": "East Deep",
                                        "category": "F",
                                        "parent": "Sabah"
                                    },
                                    {
                                        "name": "West Deep",
                                        "category": "F",
                                        "parent": "Sabah"
                                    }
                                ]
                            },
                            {
                                "name": "Labuan",
                                "category": "RE",
                                "parent": "Malaysia",
                                "children": [
                                    {
                                        "name": "Rotan Gas",
                                        "category": "F",
                                        "parent": "Labuan"
                                    }
                                ]
                            },
                            {
                                "name": "Melaka",
                                "category": "RE",
                                "parent": "Malaysia"
                            },
                            {
                                "name": "Pengerang",
                                "category": "RE",
                                "parent": "Malaysia"
                            }
                        ]
                    }
                ]
            },
            {
                "name": "Bekok",
                "parent": "Petronas Entity Tree"
            },
            {
                "name": "Diyarbekir",
                "parent": "Petronas Entity Tree"
            },
            {
                "name": "Kinabalu NAG",
                "parent": "Petronas Entity Tree"
            },
            {
                "name": "Penara Infill",
                "parent": "Petronas Entity Tree"
            }
        ]
    };
}

function ticked() {
    node
        .attr("transform", function (d) { return "translate(" + d.x + ", " + d.y + ")"; });

    link
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

    edgepaths.attr('d', function (d) {
        return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
    });

}

function dblClicked(d) {
    $('#q').val($('#q').val() + " " + d.name);
    $('#btn-search').click();
    Unload();
    document.getElementById("entity-loading-indicator").style.display = "block";
    //SearchEntities();
}

function clicked(d) {
    if (typeof d.clicked === 'undefined' || d.clicked === false) {
        d.clicked = true;
    } else {
        d.clicked = false;
    }
    setTimeout(function () {
        if (d.clicked) {
            d.clicked = false;
            updateOnClick(d);
        }
    }, 300, d);
}

function updateOnClick(d) {
    var facet = $('#facet-picker').val();
    Unload();
    document.getElementById("entity-loading-indicator").style.display = "block";
    GetGraph(d.name, facet);
}

//function dragstarted(d) {
//    if (!d3.event.active) {
//        simulation.alphaTarget(0.3).restart();
//    }
//    d.fx = d.x;
//    d.fy = d.y;
//}
//function dragged(d) {

//    // Check if movement beyond svg width/height and set to node
//    d.fx = Math.max(nodeRadius, Math.min(width - nodeRadius, d3.event.x));
//    d.fy = Math.max(nodeRadius, Math.min(height - nodeRadius, d3.event.y));
//}