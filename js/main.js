//rates and brackets from http://www.forbes.com/sites/kellyphillipserb/2014/10/30/irs-announces-2015-tax-brackets-standard-deduction-amounts-and-more/ for single filer
var rates = [10,15,25,28,33,35,39.6]
var brackets = [9225,37450,90750,189300,411500,413200,600000]
var HANDLE_WIDTH = 2;
var margins = {top: 10, right: 20, bottom: 20, left: 60}
var leftAdjust = 0;
var percentFormatter = d3.format(".1%")
var bracketFormatter = d3.format(".3s")

for (var i = 0; i < rates.length; i++){
	var resizable = d3.select('#bracket' + i);
	// var bracketHandle = resizable.select('.bracket-handle');
	// var rateHandle = resizable.select(".rate-handle")

	var width = parseInt(d3.select("#bracketContainer").style("width").replace("px","")) - margins.left - margins.right;
	var height = parseInt(d3.select("#bracketContainer").style("height").replace("px","")) - margins.left - margins.right;

	var x = d3.scale.linear()
		.domain([0,600000])
	    .range([0,width])

	var y = d3.scale.linear()
	    .domain([0, 100])
	    .range([0, height])

	var prevBracket = (i==0) ? 0:brackets[i-1]
	var barWidth = (x(brackets[i]) - x(prevBracket))

	resizable.style("width", (x(brackets[i]) - x(prevBracket)) + "px" )
	resizable.style("left", leftAdjust + "px")
		.datum({
			"initWidth":x(brackets[i]) - x(prevBracket),
			"initLeft": leftAdjust
		})
	leftAdjust +=barWidth;

	resizable.style("height", y(rates[i]))
		.append("div")
			.attr("class", "rate label")
			.text(percentFormatter(rates[i]/100))
	resizable
		.append("div")
			.attr("class", "bracket label")
			.text("$" + bracketFormatter(brackets[i]))
	var dragY = d3.behavior.drag()
    	.on("drag", resizeY)
    var dragX = d3.behavior.drag()
    	.on("drag", resizeX)
    	.on("dragstart", function(){
    		d3.select(this.parentNode)
    			.datum({
    				"initWidth": parseFloat(d3.select(this.parentNode).style("width").replace("px","")),
    				"initLeft": parseFloat(d3.select(this.parentNode).style("left").replace("px",""))
    			})
    		})
    	.on("dragend",function(){
    		var index = parseInt(d3.select(this.parentNode).attr("id").replace("bracket",""))
    		d3.select(this.parentNode)
    			.datum({
    				"initWidth": parseFloat(d3.select(this.parentNode).style("width").replace("px","")),
    				"initLeft": parseFloat(d3.select(this.parentNode).style("left").replace("px",""))
    			})
    		d3.select("#bracket" + (index+1))
    			.datum(function(){
    				return {
    					"initWidth": parseFloat(d3.select(this).style("width").replace("px","")),
    					"initLeft": parseFloat(d3.select(this).style("left").replace("px",""))
    				}
    			})
    		})

    function resizeY(){
    	// var origin = d3.select(this).datum()
    	// var diffY = Math.abs(origin.y - d3.event.y)
    	// if(diffY >= 15){
    	var index = parseInt(d3.select(this).attr("id").replace("bracket",""))
		d3.select(this).style("height", height-d3.event.y)
			.select(".rate.label")
			.text(percentFormatter(y.invert(height-d3.event.y)/100))
		rates[index] = y.invert(height-d3.event.y)
		d3.selectAll("#chart svg").remove();
		drawChart();
    }

    function resizeX(){

    	var parent = this.parentNode
    	var mx = d3.mouse(parent)[0]
    	d3.select(this)
    		.text(bracketFormatter(x.invert(mx + d3.select(this).datum().initLeft)))
    	d3.select(parent)
    		.style("width", mx + "px")

    	var initWidth = d3.select(parent).datum().initWidth

    	var index = parseInt(d3.select(parent).attr("id").replace("bracket",""))
    	d3.select("#bracket" +  (index+1))
    		.style("width", function(){
    			var w = d3.select(this).datum().initWidth
    			return w-(mx-initWidth) + "px"
    		})
    		.style("left", function(){
    			var l = d3.select(this).datum().initLeft
    			return l+(mx-initWidth) + "px"
    		})
    	brackets[index] = x.invert(mx + d3.select(this).datum().initLeft)
    	console.log(brackets)
		d3.selectAll("#chart svg").remove();
		drawChart();

    }

    resizable
    	.call(dragY)
    resizable
    	.select(".bracket.label")
    	.call(dragX)


}

function getTax(income){
	var tax = 0;
	for(var i =0; i < rates.length; i++){
		rate = rates[i];
		bracketTop = brackets[i];
		bracketBottom = (i==0) ? 0 : brackets[i-1];
		if(income < bracketTop){
			tax += (rate/100) * (income-bracketBottom)
			return tax
		}
		else{
			tax += (rate/100) * (bracketTop - bracketBottom)
		}

	}
	return tax;
}


function drawChart(){
	var margin = {top: 10, right: 20, bottom: 20, left: 60},
	    width = 960 - margin.left - margin.right,
	    height = 300 - margin.top - margin.bottom;

	var svg = d3.select("#chart")
		.append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scale.linear()
		.domain([0,600000])
	    .range([0,width])

	var y = d3.scale.linear()
	    .domain([1, 0])
	    .range([0, height])

	// var bins  = [
	// {income: 1000, tax: .2},
	// {income: 222000, tax: .1}
	// ]
	var bins = []
	for(var dollar = 0; dollar <= 600000; dollar += 1000){
		var obj = {income: dollar, tax: parseFloat(getTax(dollar)/dollar)}
		bins.push(obj)
	}
	  svg.selectAll(".bin")
	      .data(bins)
	    .enter().append("rect")
	      .attr("class", "bin")
	      .attr("x", function(d) {return x(d.income); })
	      .attr("width", x(1000) )
	      .attr("y", function(d) { return y(d.tax); })
	      .attr("height", function(d) { return height - y(d.tax); });

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.svg.axis()
	      .scale(x)
	      .orient("bottom"));

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(d3.svg.axis()
	      .scale(y)
	      .orient("left"));

}

drawChart()