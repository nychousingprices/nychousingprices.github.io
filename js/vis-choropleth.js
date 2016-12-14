
var neighborhood_dict = {}

var color_domains = {}
color_domains["Apartment - 1 bedrooms"] = [764121, 3271809.257];
color_domains["Apartment - 2 bedrooms"] = [900000, 4000000];
color_domains["Apartment - 3 bedrooms"] = [944961, 4050000];
color_domains["Condominium"] = [909402, 10756323];
color_domains["Cooperative"] = [1626331, 12610379];
color_domains["Townhouse"] = [3196687, 15796572];
color_domains["Duplex"] = [2589716, 18300111];
color_domains["Triplex"] = [2697005, 12017933];
color_domains["Quadruplex"] = [2459669, 10783916];
color_domains["SingleFamily"] = [3196687, 13968582];
color_domains["MultiFamily2To4"] = [1457620, 8071137];
color_domains["MultiFamily5Plus"] = [1279778, 2731026];

var text_for_hometype = {}
text_for_hometype["Apartment - 1 bedrooms"] = "1-Bedroom Apartment";
text_for_hometype["Apartment - 2 bedrooms"] = "2-Bedroom Apartment";
text_for_hometype["Apartment - 3 bedrooms"] = "3-Bedroom Apartment";
text_for_hometype["Condominium"] = "Condominium";
text_for_hometype["Cooperative"] = "Cooperative";
text_for_hometype["Townhouse"] = "Townhouse";
text_for_hometype["Duplex"] = "Duplex";
text_for_hometype["Triplex"] = "Triplex";
text_for_hometype["Quadruplex"] = "Quadruplex";
text_for_hometype["SingleFamily"] = "Single-Family";
text_for_hometype["MultiFamily2To4"] = "Multi-Family (2-4)";
text_for_hometype["MultiFamily5Plus"] = "Multi-Family (5+)";

var home_types_list = Object.keys(text_for_hometype);
console.log(home_types_list)
var neighborhood_selected = false; 

var last_selected = "info-2"
var format = d3.format(",.0f")

// Initialize svg for map
var margin = {top: 150, right: 20, bottom: 20, left: 20};

var width = $("#chloropleth").width() - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var svg = d3.select("#chloropleth").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var projection = d3.geo.mercator()
    .scale(150000)
    .translate([193780, 117350]);

var path = d3.geo.path()
    .projection(projection);


// Initialize legend
var legend_margin = {top: 20, right: 20, bottom: 20, left: 20};

var legend_width = $("#chloropleth-legend").width()/10 ,
    legend_height = 400 - legend_margin.top - legend_margin.bottom;


var key = d3.select("#chloropleth-legend")
    .append("svg")
    .attr("width", width + legend_margin.left + legend_margin.right)
    .attr("height", height + legend_margin.top + legend_margin.bottom)
    .append("g")
    .attr("transform", "translate(" + legend_margin.left + "," + legend_margin.top + ")");

var legend = key.append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "100%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

highcolor = legend.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "white")
    .attr("stop-opacity", .8);

lowcolor = legend.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "black")
    .attr("stop-opacity", .8);


// Define the div for the tooltip
var tooltip = d3.select('#chloropleth').append('div')
    .attr('class', 'hidden tooltip');


// react to changes in selected data
d3.select("#data-type2").on("change", updateChoropleth);


// initialize variable names for the data
var countryDataCSV;
var manhattan;

// specify color ranges for each attribute (from colorbrewer)
var colors = ['#aaaaff', '#ff0000'];


// Helper function -- when called, generate html to populate tooltip box
function showInfo(region, hometype) {
    neighborhood = region["properties"]["NAME"]


    if (!(hometype in neighborhood_dict[neighborhood])) {return neighborhood + "<br/> (Data Unavailable)"}


    else {
        return neighborhood + "<br/> Predicted Home Value: <br/> $" + format(neighborhood_dict[neighborhood][hometype])}
    
}


function extra_info(d) {
    if (last_selected == "info-2") {
        last_selected = "info-1"
        to_select = "#info-1"

    } else {
        to_select = "#info-2"
        last_selected = "info-2"
    }
    
    console.log(neighborhood_dict[d])


    var table_contents = ""

    // Loop through attributes of the data object, adding the name to the left column and value to right column
    
    for (i = 0; i < home_types_list.length; i++) {
        hometype = home_types_list[i]
        if (hometype in neighborhood_dict[d])
            table_contents += "<tr><td class='table-row'></td><td>$" + format(neighborhood_dict[d][hometype]) + "</td></tr>" ;
        else table_contents += "<tr><td class='table-row'></td><td>" + "  -  " + "</td></tr>" ;
    }


    var toPrintTable = "<table class='info-table'> " + table_contents + "</table>"


    $(to_select).html(d + "<br/>" + toPrintTable);

}



function show_table_titles () {
    if (!neighborhood_selected) {
        var table_contents = ""
        
        for (i = 0; i < home_types_list.length; i++) {
            var hometype = home_types_list[i];
            table_contents += "<tr><td class='table-row'>" + text_for_hometype[hometype] +  "</td><td></td></tr>" ;
        }

        var toPrintTable = "<table class='info-table info-table-titles'> " + table_contents + "</table>"

        $("#table-titles").html( "<br/>" + toPrintTable);

        neighborhood_selected = true
    }
    
}



function loadData() {
    queue()
        .defer(d3.json, "data/manhattan.geojson")
        .defer(d3.csv, "data/results_df.csv")
        .await(function (error, mn_json, results) {


            for (var i = 0; i < results.length; i++) {
                nhood = results[i]["neighborhood"]
                hometype = results[i]["home_type"]
                price = results[i]["predicted_price"]


                if (!(nhood in neighborhood_dict))  { neighborhood_dict[nhood] = {}}
                neighborhood_dict[nhood][hometype] = +price
            }
            console.log(neighborhood_dict);


            manhattan = mn_json['features'];
            console.log(manhattan);
     

            updateChoropleth();
        });
};


loadData();




function updateChoropleth() {
    // identify which data attribute is selected

    selectBox_area2 = document.getElementById("data-type2");
    selected2 = selectBox_area2.options[selectBox_area2.selectedIndex].value;
    console.log(selected2);



    var color_scale2 = d3.scale.linear().domain(color_domains[selected2]).range(colors).nice();

    // Render the  Map
    var map = svg.selectAll("path")
        .data(manhattan);

    map.enter().append("path")
        .attr("class", "country-shape")
        .attr("d", path)

    map
        .attr("stroke", "#000")
        .style("fill", function (d) {
            name = d["properties"]["NAME"];
            if (!(selected2 in neighborhood_dict[name])) { return "#eeeeee"}
          
            else {return color_scale2(neighborhood_dict[name][selected2])};
            
        })
        .attr("opacity", .8)
        //  On mouseover, change the opacity to 1 to highlight the country our mouse is over
        .on('mouseover', function (d) {
            d3.select(this).transition().duration(100).style("opacity", 1);
            var mouse = d3.mouse(svg.node()).map(function(d) {
                        return parseInt(d);
                    });
            tooltip.classed('hidden', false)
                .attr('style', 'left:' + (mouse[0] + 5) +
                    'px; top:' + (mouse[1]+70) + 'px')
                .html(showInfo(d, selected2));
        })
        .on("mouseout", function (d) {
            d3.select(this).transition().duration(100).style("opacity", .8);
            tooltip.classed('hidden', true);
        })
        .on("click", function(d) {
            show_table_titles();
            return extra_info(d["properties"]["NAME"]);
        });



    //LEGEND:  modeled code from http://bl.ocks.org/nbremer/5cd07f2cb4ad202a9facfbd5d2bc842e
    highcolor.attr("stop-color", colors[1]);

    lowcolor.attr("stop-color", colors[0]);

    // add legend rectangle and fill with gradient
    key.append("rect")
        .transition()
        .attr("x", legend_margin.left)
        .attr("y", legend_margin.top)
        .attr("width", legend_width)
        .attr("height", legend_height)
        .style("stroke", "#000")
        .style("fill", "url(#gradient)");

    // create a scale to map from data values to legend in order to
    var y = d3.scale.linear().range([legend_height, 0])
       // .domain([min_val, max_val]);
       .domain(color_domains[selected2]);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right")
        .tickSize(5)

    //remove outdated axis values
    d3.select("#legend-axis").remove()

    // add axis
    key.append("g")
        .attr("id", "legend-axis")
        .attr("class", "y axis")
        .attr("transform", "translate(" + (legend_margin.left + legend_width) + "," + legend_margin.top + ")")
        .transition()
        .call(yAxis);


    // add a legend title based on selected values
    $(".legend-title").html("");
    var labels =  key
        .append("text")
        .attr("class", "legend-title")
        .attr("x", -legend_height)
        .attr("y", -legend_margin.top)
        .attr("dy", ".71em")
        .style("text-anchor", "start")
        .attr("transform", "rotate(-90)")
        .text("Predicted Home Value ($)");
}



