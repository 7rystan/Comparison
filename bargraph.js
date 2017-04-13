        //Margins are set, as well as the height and width.
        var margin = { top: 10, right: 10, bottom: 0, left: 10 },
            width = 1200 - margin.left - margin.right,
            height = 720 - margin.top - margin.bottom;
        
        //The SVG is set, calling back to the margins, height and width to create the dimensions
        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(0, 0)");
        
        //Here 'g' (svg group) and the graph's text are being moved to more appropriate locations
        var g = svg.append('g')
            .attr("transform", "translate(100, 10)");

        g.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0, 155)');
        
        g.append('g')
            .attr('class', 'y axis')
            .append("text")
            .style("text-anchor", "end");

        //Now the data is being parsed so that it can be called to later on in the script
        var parseRow = function(row) {
            return {
                unslicedPage: row.Page,
                Total: parseFloat(row.Total),
                Unique: parseFloat(row.Unique),
                ID: row.ID
            }
            };
        
        //The tooltip div is created via javascript, which will be called ttDiv.
        //ttDiv will start out at an opacity level of 0 so that it can later be faded in.
        var ttDiv = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
        
        //'loadData' loads everything past this point
        //'metric' checks what you choose from the drop menu and parses that option as just text
        //'dataFile' calls back to 'metric' to figure out the name of the csv file to open and display in the graph
        //***Note that the options in the drop down need to be the same names as the csv files for this to work***
        var loadData = function() {
            var metric = document.getElementById('metric').selectedOptions[0].text;
            var dataFile = 'data/' + metric + '.csv'
            d3.csv(dataFile, parseRow, function(data) {
        
                //Set a, b and c variables
                //These variables will be used later on to scroll through the graph ten data sets at a time
                var a = 0,
                    b = 10,
                    c = 1;
  
                //Run the 'update()' function to check the values of the variables a, b and c and update the graph accordingly
                update();
              
                //Create the update function
                function update() {
        
                    //Select the "next 10" (#bt2) button and add 10 to the 'a' and 'b' variables, as well as add 1 to the 'c' variable
                    //Then update a,b,c
                    d3.select("#bt2").on("click", () =>{
                        a += 10;
                        b += 10;
                        c += 1;
                        update(a,b,c);
                        });
                    
                    //Select the "previous 10" (#bt1) button and remove 10 from 'a' and 'b' variables, as well as remove 1 from the 'c' variable
                    //Then update a,b,c
                    d3.select("#bt1").on("click", () => {
                        a -= 10;
                        b -= 10;
                        c -= 1;
                        update(a,b,c);
                        });
                    
                    //'counts' counts the amount of rows are in the Page collumn in the CSV that is currently loaded
                    var counts = {};
                        data.forEach(function(r) {
                            if (!counts[r.Page]) {
                                counts[r.Page] = 0;
                            }
                            counts[r.Page]++;
                        });

                    //Checks if 'c' is equal to 1
                    //If it is equal to 1, it disables the 'previous 10' (#bt1) button so you can't load null data
                    //If it isn't, it removes the disabled attribute from the previous button
                    if (c === 1) { d3.select("#bt1").attr('disabled', 'disabled'); }   
                        else { document.getElementById("bt1").removeAttribute('disabled'); }          

                    //Uses the 'a' and 'b' variables to decide the start and finish of the slice in the data, that way it only loads 10 at a time
                    var pages = data.slice(a,b).map(function(d) {return d.unslicedPage} );

                    //Checks 10 rows ahead of 'pages'
                    var fauxPage = data.slice(a+10,b+10).map(function(d) { return d.unslicedPage} );

                    //If the length of fauxPage is less than or equal to 0, then the "next" button is disabled, this way no null data is loaded
                    //Otherwise, the next button is enabled
                    if ( 0 >= fauxPage.length ) { d3.select("#bt2").attr('disabled', 'disabled'); }
                    else { document.getElementById("bt2").removeAttribute('disabled'); }

                    //Creates the variable 'qc'
                    //Uses the 'a' and 'b' variables to decide the start and finish of the slice in the data for Total
                    //Because 'a' and 'b' are always 10 apart, it only loads 10 at a time
                    var qc = data.slice(a,b).map(function(d) {
                            return d.Total
                        });

                    //Creates the variable 'tpc' for Total People Charged
                    //Uses the 'a' and 'b' variables to decide the start and finish of the slice in the data for Unique
                    //Because 'a' and 'b' are always 10 apart, it only loads 10 at a time
                    var tpc = data.slice(a,b).map(function(d) {
                            return d.Unique
                        });
                    
                    var hcps = function(d) { 
                            return d.ID };
                    
                    //Creates the variable 'swappedData' which by default is set to 'qc' (quantity charged)
                    var swappedData = qc;

                    var d = 20;
                    var e = 498;
                    
                    //Checks if dataSwapCheck is checked (the check box)
                    //If it's checked, it keeps swappedData set to qc
                    //If unchecked, it removes the bars that show the QC data and sets swappedData to tpc
                    //Another purpose of this is to alternate the numbers on the y axis between the max number of tpc and qc
                    if (dataSwapCheck.checked) {
                        var swappedData = qc;
                        showQC();
                        }

                    else {
                        svg.transition();
                        var swappedData = tpc;
                        var d = 42;
                        svg.selectAll(".bar")
                        .remove();
                    }

                    //Sets the number format to "," for ttDiv numbers, that way it's easier to read the numbers (i.e. shows 1000 as 1k instead)
                    var formatComma = d3.format(",");

                    //Create x and y variables
                    var x = d3.scale.ordinal()
                        .rangeRoundBands([-22, 498], .99)
                        .domain(pages);

                    var y = d3.scale.linear()
                        .range([150, 0])
                        .domain([0, d3.max(swappedData) + ((d3.max(swappedData) / 10) + 10)]);

                    //Creates the bars that you see on the graph
                    var rect2 = g.selectAll('.bar2').data(data.slice(a,b));
                    rect2.enter().append('rect');
                    rect2.exit().remove('rect');
                    rect2.attr('class', 'bar2')
                        .attr('width', d)
                    d3.selectAll(".bar2")
                        .transition()
                        .delay(50)
                        .attr('height', function(d) { return 150 - y(d.Unique) + 2})
                        .attr('x', function(d) { return x(d.unslicedPage) })
                        .attr('y', function(d) { return y(d.Unique) })
                        .ease('elastic');
                    
                    //Creates a mouseover function that displays more information about the data you're hovering over
                    rect2.on("mouseover", function(d) {
                        ttDiv.transition()
                            .duration(500)
                            .style("opacity", .9);
                        ttDiv.html("Page name: " + d.unslicedPage + "</br>" + "ID: " + d.ID + "<br/>" + "<p class='tpcp'>Unique Views: " + formatComma(d.Unique) + "</p>")
                            .on("mouseout", function(d) {
                        ttDiv.transition()
                            .duration(500)
                            .style("opacity", 0)});
                    });
                    
                    //Loads and creates the second set of data if you choose to show it with the check box
                    function showQC() {
                        
                        //Created a new x and y variable so it's slightly to the right of the other bars
                        var x = d3.scale.ordinal()
                            .rangeRoundBands([0, 520], .99)
                            .domain(pages);

                        var y = d3.scale.linear()
                            .range([150, 0.6])
                            .domain([0, d3.max(swappedData) + ((d3.max(swappedData) / 10) + 10)]);
                        
                        //Creates the bars
                        var rect = g.selectAll('.bar').data(data.slice(a,b));
                        rect.enter().append('rect');
                        rect.exit().remove('rect');
                        rect.attr('class', 'bar')
                            .attr('width', 20)
                        rect.transition()
                            .attr('height', function(d) { return 150 - y(d.Total) + 2})
                            .attr('x', function(d) { return x(d.unslicedPage) })
                            .attr('y', function(d) { return y(d.Total) })
                            .ease('elastic')
                            .duration(500);
                        
                        //Creates the mouseover function for the new bars
                        rect.on("mouseover", function(d) {
                            ttDiv.transition()
                                .duration(500)
                                .style("opacity", .9);
                            ttDiv.html("Page name: " + d.unslicedPage + "</br>" + "ID: " + d.ID + "<br/>" + "<p class='qcp'>Total Views: " + formatComma(d.Total) + "</p></br>")
                                .on("mouseout", function(d) {
                            ttDiv.transition()
                                .duration(500)
                                .style("opacity", 0)});
                            });
                        }

                    //Create xAxis and yAxis
                    var xAxis = d3.svg.axis()
                                .scale(x)
                                .orient('bottom');

                    var yAxis = d3.svg.axis()
                              .scale(y)
                              .orient('left')
                              .tickFormat(d3.format('s'));
                    
                    //Call xAxis and yAxis, anchor the x axis text to the end
                    d3.select('.x.axis').call(xAxis)
                        .selectAll('text')
                        .style('text-anchor', 'end')
                        .attr('dx', '-.8em')
                        .attr('dy', '.15em')
                        .attr('transform', function(d) {
                            return 'translate(25,0), rotate(-40)'});
                    d3.select('.y.axis').call(yAxis);
                }})};
        
        //Runs the loadData function so that it renews the data after each update()
        loadData()
