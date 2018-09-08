var domain = "https://cors.io/?https://kate-young.github.io/KSUMalaria_Visualizations";
//var domain = "http://localhost:8000";
var dataurl = domain + "/data/feature_importance.json";

/***************** Build Scatter Plot *********************/
var margin = { top: 10, right: 200, bottom: 70, left: 200 },
    padding = { top: 10, right: 10, bottom: 10, left: 10 },
    w = 600,
    h = 8000,
    pad = 20,
    lowlight_color = "#B8B8B8",
    highlight_color = "#85B8FF",
    text_color = "#333";

var svg = d3.select("#viz")
        .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + 75) + ")");

var chart1 = svg.append("g")
      .attr("class", "chart1")
      .attr("width", w/2)
      .attr("height", h);

var chart2 = svg.append("g")
      .attr("class", "chart2")
      .attr("width", w/2)
      .attr("height", h)
      .attr("transform", "translate(" + (w/2 + 50) + ", 0)");

d3.json(dataurl).then(function(d) {
  var data = d;

  var yVals = data.map(function(d) { return d["feature"]; });

  var x1_min = 0, x1_max = 1;
  var x2_min = -0.4, x2_max = 0.4;

    /* Scale data to w/h ranges */
  var x1 = d3.scaleLinear().domain([x1_min, x1_max]).range([0, w/2]);
  var x2 = d3.scaleLinear().domain([x2_min, x2_max]).range([0, w/2])
  var y = d3.scaleBand().domain(yVals).range([0, h]);

  /* Define Y-Axis */
  var yAxis = d3.axisLeft().scale(y);
  var x1Axis = d3.axisTop().scale(x1);
  var x2Axis = d3.axisTop().scale(x2);

  /* Define Tooltip Div */
  var div = d3.select("body")
    	.append("div")  // declare the tooltip div
    	.attr("class", "tooltip")              // apply the 'tooltip' class
    	.style("opacity", 0);



  chart1.append("g")
      .attr("class", "axis")
      .style("fill", text_color)
      .call(yAxis);

  chart1.append("g")
      .attr("class", "axis")
      .style("fill", text_color)
      .attr("transform", "translate(0, -10)")
      .call(x1Axis);

  chart2.append("g")
      .attr("class", "axis")
      .style("fill", text_color)
      .attr("transform", "translate(0, -10)")
      .call(x2Axis);

  chart2.append("line")
      .attr("class", "ref")
      .attr("x1", function() { return x2(0); })
      .attr("x2", function() { return x2(0); })
      .attr("y1", 0)
      .attr("y2", h)
      .style("stroke-dasharray", ("3, 3"))
      .attr("stroke-width", 1)
      .attr("stroke", "#666")
      .attr("opacity", 1);;

  var lines = chart2.selectAll(".line").data(data);
  lines.enter()
      .append("line")
      .attr("class", "line")
      .attr("x1", function(d) { return x2(d["min_99_coef"]); })
      .attr("x2", function(d) { return x2(d["max_99_coef"]); })
      .attr("y1", function(d) { return y(d.feature); })
      .attr("y2", function(d) { return y(d.feature); })
      .attr("stroke-width", 1)
      .attr("stroke", "#666")
      .attr("opacity", 1);

  var n_h = 6;
  var mins = chart2.selectAll(".min_line").data(data);
  mins.enter()
     .append("line")
     .attr("class", "line min_line")
     .attr("x1", function(d) { return x2(d["min_99_coef"]); })
     .attr("x2", function(d) { return x2(d["min_99_coef"]); })
     .attr("y1", function(d) { return y(d.feature)-n_h/2; })
     .attr("y2", function(d) { return y(d.feature)+n_h/2; })
     .attr("stroke-width", 1)
     .attr("stroke", "#666")
     .attr("opacity", 1);

  var maxes = chart2.selectAll(".max_line").data(data);
  maxes.enter()
     .append("line")
     .attr("class", "line max_line")
     .attr("x1", function(d) { return x2(d["max_99_coef"]); })
     .attr("x2", function(d) { return x2(d["max_99_coef"]); })
     .attr("y1", function(d) { return y(d.feature)-n_h/2; })
     .attr("y2", function(d) { return y(d.feature)+n_h/2; })
     .attr("stroke-width", 1)
     .attr("stroke", "#666")
     .attr("opacity", 1);

   var circles = chart2.selectAll("circle").data(data);

   circles.enter().append('circle')
         .attr("class", "circle mean")
         .attr('cx', function(d)  { return x2(d["coef_mean"]); })
         .attr('cy', function(d)  { return y(d["feature"]); })
         .attr('r', 3)
         .on("mouseover", function(d) {
            div.transition()
       				.duration(500)
       				.style("opacity", 0);
       			div.transition()
       				.duration(200)
       				.style("opacity", .9);
       			div.html(d3.format(".3f")(d.coef_mean)
                      + "</br>(" + d3.format(".3f")(d.min_99_coef) +", "+d3.format(".3f")(d.max_99_coef) +")")
       				.style("left", (d3.event.pageX) + "px")
       				.style("top", (d3.event.pageY - 28) + "px");
       			})
          .on("mouseout", function(d) {
               div.transition()
                 .duration(500)
                 .style("opacity", 0);
             });

  var bars = chart1.selectAll("rect").data(data);
  bars.enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", function(d) { return y(d["feature"]); })
    .attr("width", function(d) {return x1(d["selected_percent"]); })
    .attr("height", function(d) { return y.bandwidth()*0.8; })
    .on("mouseover", function(d) {
       div.transition()
         .duration(500)
         .style("opacity", 0);
       div.transition()
         .duration(200)
         .style("opacity", .9);
       div.html(d3.format(".0%")(d.selected_percent))
         .style("left", (d3.event.pageX) + "px")
         .style("top", (d3.event.pageY - 28) + "px");
       })
     .on("mouseout", function(d) {
          div.transition()
            .duration(500)
            .style("opacity", 0);
      });

  svg.append("text")
        .attr("transform",
              "translate(" + (w/4) + " ," +
                             (-50) + ")")
        .style("text-anchor", "middle")
        .style("fill", text_color)
        .text("% of Models Selected");

  svg.append("text")
        .attr("transform",
              "translate(" + (w*0.75 + 50) + " ," +
                             (-50) + ")")
        .style("text-anchor", "middle")
        .style("fill", text_color)
        .text("Estimated Coefficient");
});
