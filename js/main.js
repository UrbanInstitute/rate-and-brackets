//rates and brackets from https://www.taxact.com/tools/tax-bracket-calculator.asp for single filer
var rates = [10,15,25,28,33,35,39.6]
var brackets = [9075,36900,89350,186350,405100,406750]

var resizable = d3.select('#bracket0');
var bracketHandle = resizable.select('.bracket-handle');
var rateHandle = resizable.select(".rate-handle")

var bracketResize = d3.behavior.drag()
    .on('drag', function() {
        // Determine resizer position relative to resizable (parent)
        x = d3.mouse(this.parentNode)[0];
        
        // Avoid negative or really small widths
        x = Math.max(50, x);
        
        resizable.style('width', x + 'px');
        resizable.select(".rate-handle").style("width", x+"px")
    })
var rateResize = d3.behavior.drag()
    .on('drag', function() {
        // Determine resizer position relative to resizable (parent)
        var h = parseInt(resizable.style('height').replace("px",""))
        
        y = d3.mouse(this.parentNode)[1];
        
        // Avoid negative or really small widths
        // y = Math.max(50, y);
        // console.log(h-y)
        resizable.style('height', (h-y) + 'px');
        // resizable.select(".rate-handle").style("width", y+"px")
    })
bracketHandle.call(bracketResize);
rateHandle.call(rateResize)

