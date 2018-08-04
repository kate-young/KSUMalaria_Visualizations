var w = 940,
    h = 300,
    pad = 20,
    left_pad = 100,
    data_url = '/predictions.csv';


var x = d3.scale.linear().domain([0, 23]).range([left_pad, w-pad]);
var y = d3.scale.linear().domain([0, 6]).range([pad, h-pad*2]);

svg = d3.select(document.getElementById('viz'));

var yAxis = d3.svg.axis().scale(y).orient("left")
    .ticks(7)
    .tickFormat(function (d, i) {
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d];
    });

var xAxis = d3.svg.axis().scale(x).orient("bottom")
        .ticks(24)
        .tickFormat(function (d, i) {
            var m = (d > 12) ? "p" : "a";
            return (d%12 == 0) ? 12+m :  d%12+m;
        });
        
svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0, "+(h-pad)+")")
    .call(xAxis);

svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate("+(left_pad-pad)+", 0)")
    .call(yAxis);
