/***************** Scatter Plot Tooltips *********************/
var formatTooltip = function(compound, model, prediction) {
  var parts = model.split("_");
  var rmse = parts[2];
  var ftr_count = parts[0];
  return prediction.toFixed(2) +
            "</br>" + rmse + " RMSE, " + ftr_count + " features" + "</br>";

}
/***************** Scatter Plot Filters *********************/
d3.selection.prototype.moveToFront = function() {
  return this.each(function() {
    this.parentNode.appendChild(this);
  });
}

var active = null;

var highlightFiltered = function(selected, ftrs) {
  if (active === selected) {
    selected = null;
  }
  active = selected;
  d3.select("svg").selectAll("circle")
    .select(function(d) { return d[1] === selected? this : null; })
    .moveToFront()
    .transition()
    .style("opacity", 1)
    .style("fill", highlight_color)
    .attr("r", 8);
  d3.select("svg").selectAll("circle")
    .select(function(d) { return d[1] != selected? this : null; })
    .transition()
    .style("opacity", 0.5)
    .style("fill", lowlight_color)
    .attr("r", 4);
    /* Show Model Details */
    if (selected === null) {
      var modelElement = document.getElementById("model");
      modelElement.innerHTML = "<p>Click on individual data points to see model details</p>";
    } else {
      var parts = selected.split("_");
      var rmse = parts[2];
      var ftr_count = parts[0];
      var modelElement = document.getElementById("model");
      modelElement.innerHTML = "<h4>RMSE: " + rmse + "</h4>"
                              + "<h4>Features (" + ftr_count + "): </h4>";
      var ftr_list = document.createElement("ul");
      ftr_list.classList.add("list-group");
      ftr_list.classList.add("list-group-flush");
      ftr_list.classList.add("card");
      ftr_list.innerHTML = "";
      modelElement.appendChild(ftr_list);
      for(var i=0; i < ftrs.length; i++) {
        var li = document.createElement('li');
        li.classList.add("list-group-item");
        li.innerHTML = ftrs[i];
        ftr_list.appendChild(li);
      }
    }
}

/***************** Build Scatter Plot *********************/
var margin = {top: 10, right: 200, bottom: 70, left: 100 },
    w = 600,
    h = 500,
    pad = 20,
    xmin = -100,
    xmax = 200,
    lowlight_color = "#B8B8B8",
    highlight_color = "#85B8FF",
    text_color = "#666";

var svg = d3.select("#viz")
        .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/predictions.json", function(d) {


  var compounds = d["compounds"],
      models = d["models"],
      predictions = d["predictions"]
      features = d["features"];

  var title = document.getElementById("title");
  var sub = document.createElement("small");
  sub.classList.add("text-muted");
  sub.innerHTML = " Using " + models.length + " Support Vector Regression models*";
  title.appendChild(sub);


  /* Scale data to w/h ranges */
  var x = d3.scale.linear().domain([xmin, xmax ]).range([0, w+pad]);
  var y = d3.scale.linear().domain([0,compounds.length-1]).range([h-pad, 0]);

  /* Define X-Axis */
  var xAxis = d3.svg.axis().scale(x).orient("bottom");
  /* Define Y-Axis */
  var yAxis = d3.svg.axis().scale(y).orient("left")
          .ticks(compounds.length)
          .tickFormat(function (d, i) {
              return compounds[d];
          });

  var div = d3.select("#viz").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + h + ")")
      .style("fill", text_color)
      .call(xAxis);

  svg.append("text")
      .attr("transform",
            "translate(" + (w/2) + " ," +
                           (h + margin.top + 30) + ")")
      .style("text-anchor", "middle")
      .style("fill", text_color)
      .text("IC50 Prediction");

  svg.append("g")
      .attr("class", "axis")
      .style("fill", text_color)
      .call(yAxis);

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (h / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", text_color)
      .text("Compound");

  var circles = svg.selectAll("circle").data(predictions);

  circles.enter()
      .append("circle")
      .attr("class", "circle")
      .attr("cx", function (d) { return x(d[2])})
      .attr("cy", function (d) { return y(d[3])})
      .attr("r", 4)
      .on({
        "mouseover": function(d) {
          div.transition()
             .duration(200)
             .style("opacity", 0.95);
          div.html(formatTooltip(d[0], d[1], d[2]))
            .style("left", (d3.event.pageX)+ "px")
            .style("top", (d3.event.pageY - 80) + "px");
        },
        "mouseout": function(d) {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        },
        "click": function(d) {
          highlightFiltered(d[1], features[d[1]]);
        }
      });

});
