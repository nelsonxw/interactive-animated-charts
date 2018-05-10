/*initial load of the chart*/
loadChart();

/*when user change window size, update chart to be responsive*/
d3.select(window).on("resize", handleResize);

function handleResize () {
	var svgArea = d3.select("svg");
	/*check if svg tag exists and replace it with new chart*/
	if (!svgArea.empty()) {
	    svgArea.remove();
	    loadChart();
	  };
}

/*main function to create interactive chart*/
function loadChart() {
	/*capture window width and height and save as svg width and height, when window resize, svg resize accordingly*/
	var svgWidth = window.innerWidth;
	var svgHeight = window.innerHeight;

	/*depending on the size of the device (width), set up different margin values, space between labels, raius of cirlcle and cile text size*/
	if (svgWidth >= 576) {
		var margin = {
			top: 50,
		  	right: 100,
		  	bottom: 150,
		  	left: 100
		};
		var LabelSpace = 20;
		var radius = 10;
		var circleTextSize = 9;
	} else {
		var margin = {
			top: 30,
		  	right: 100,
		  	bottom: 100,
		  	left: 80
		};
		var LabelSpace = 15;
		var radius = 7;
		var circleTextSize = 6;
	};
	
	/*calculate the width and height to be used in the chart*/
	var width = svgWidth - margin.left - margin.right;
	var height = svgHeight - margin.top - margin.bottom;

	/*create svg tag*/
	var svg = d3
		.select("body")
	  	.append("svg")
	  	.attr("width", svgWidth)
	  	.attr("height", svgHeight);

	/*set up the chart coordination starting points*/
	var chartGroup = svg.append("g")
	  	.attr("transform", `translate(${margin.left}, ${margin.top})`);

	/*read in data and plot chart*/
	d3.csv("data/data.csv", function (error, csvData) {
		if (error) throw error;

	  	/*parse the data to integers*/
	  	csvData.forEach(function (data) {
		    data.medianIncome = +data.medianIncome;
		    data.povertyRatio = +data.povertyRatio;
		    data.lessthanHighSchool = +data.lessthanHighSchool;
		    data.healthcareCoverage = +data.healthcareCoverage;
		    data.obeseRatio = +data.obeseRatio;
		    data.smokerRatio = +data.smokerRatio;
		  });

	  	/*define default selected labels for x axis and y axis*/
		var selectedXLabel = "povertyRatio";
		var selectedYLabel = "obeseRatio";

		/*define scales for x axis and y axis*/
		var xLinearScale = xScale(csvData,selectedXLabel);
		var yLinearScale = yScale(csvData,selectedYLabel);

		/*create bottom axis and left axis and make the number of ticks responsive to the size of the window, with minimum of 2 ticks*/
		var bottomAxis = d3.axisBottom(xLinearScale);
		bottomAxis.ticks(Math.max(width/100, 2));
		var leftAxis = d3.axisLeft(yLinearScale);
		leftAxis.ticks(Math.max(height/50, 2));

		/*create a group for x axis and plot it*/
		var xAxis = chartGroup.append("g")
			.attr("transform", `translate(0, ${height})`)
			.attr("class","x-axis")
			.call(bottomAxis);

		/*create a group for y axis and plot it*/
		var yAxis = chartGroup.append("g")
			.attr("class","y-axis")
			.call(leftAxis);

		/*create circle group, bind data to it and plot circles*/
		var circleGroup = chartGroup.selectAll(".circle")
			.data(csvData)
			.enter()
			.append("circle")
			  .attr("class", "circle")
			  .attr("r", radius)
			  .attr("cx", data=>xLinearScale(data[selectedXLabel]))
			  .attr("cy", data=>yLinearScale(data[selectedYLabel]))
			  .attr("opacity",.8)
			  .style("fill", "skyblue")

		/*plot text inside of the circles*/
		var circleTextGroup = chartGroup.selectAll(".circleText")
			.data(csvData)
			.enter()
			.append("text")
			  .attr("class", "circleText")
			  .attr("x", data=>xLinearScale(data[selectedXLabel]))
			  .attr("y", data=>yLinearScale(data[selectedYLabel]))
			  .attr("dx","-.7em")
			  .attr("dy",".3em")
			  .text(data=>data.stateCode)
			  .style("font-size", circleTextSize + "px")

		/*add tool tips to the circles*/
		updateToolTip(circleGroup,selectedXLabel,selectedYLabel);

		/*create label group for x axis and add 3 labels*/
		var selectedXLabelGroup = chartGroup.append("g")
			.attr("transform",`translate(${width / 2}, ${height + margin.top + 5})`);

		selectedXLabelGroup.append("text")
			.attr("x", 0)
			.attr("y", 0)
			.attr("class","active")
			.attr("text-anchor", "middle")
			.attr("value","povertyRatio")
			.text("Poverty (%)");

		selectedXLabelGroup.append("text")
			.attr("x", 0)
			.attr("y", LabelSpace)
			.attr("class","inactive")
			.attr("text-anchor", "middle")
			.attr("value","medianIncome")
			.text("Median Income");

		selectedXLabelGroup.append("text")
			.attr("x", 0)
			.attr("y", LabelSpace * 2)
			.attr("class","inactive")
			.attr("text-anchor", "middle")
			.attr("value","lessthanHighSchool")
			.text("Education less than High School (%)");

		/*create label group for y axis and add 3 labels*/
		var selectedYLabelGroup = chartGroup.append("g")

		selectedYLabelGroup.append("text")
		    .attr("transform", "rotate(-90)")
		    .attr("class","active")
		    .attr("y", 0 - margin.left)
		    .attr("x", 0 - (height / 2))
		    .attr("dy", "1em")
		    .attr("text-anchor", "middle")
		    .attr("value","obeseRatio")
		    .text("Obesity (%)");

		selectedYLabelGroup.append("text")
		    .attr("transform", "rotate(-90)")
		    .attr("class","inactive")
		    .attr("y", 0 - margin.left + LabelSpace)
		    .attr("x", 0 - (height / 2))
		    .attr("dy", "1em")
		    .attr("text-anchor", "middle")
		    .attr("value","smokerRatio")
		    .text("Smoker (%)");

		selectedYLabelGroup.append("text")
		    .attr("transform", "rotate(-90)")
		    .attr("class","inactive")
		    .attr("y", 0 - margin.left + LabelSpace * 2)
		    .attr("x", 0 - (height / 2))
		    .attr("dy", "1em")
		    .attr("text-anchor", "middle")
		    .attr("value","healthcareCoverage")
		    .text("Health Care Coverage (%)");

		/*add click event listener for all labels on x axis*/
		selectedXLabelGroup.selectAll("text")
			.on("click",function(){
				var selection = d3.select(this)
				var value = selection.attr("value");
				/*when user selects new labels, get new data and update the chart*/
				if (value!=selectedXLabel) {
					selectedXLabel = value;
					/*update x scale and bottom axis*/
					xLinearScale = xScale(csvData,selectedXLabel);
					bottomAxis = d3.axisBottom(xLinearScale);
					/*re-plot bottom axis with animation*/
					xAxis.transition()
						.duration(1000)
						.call(bottomAxis);

					/*re-plot circles with animation*/
					circleGroup.transition()
						.duration(1000)
						.attr("cx", data=>xLinearScale(data[selectedXLabel]));
					
					/*re-plot text in the circles with animation*/
					circleTextGroup.transition()
						.duration(1000)
						.attr("x", data=>xLinearScale(data[selectedXLabel]));

					/*update tool tips*/
					updateToolTip(circleGroup,selectedXLabel,selectedYLabel);

					/*make all x axis labels inactive (change color to gray) then make the selected label active (change color to black)*/
					inactivateXLabels(selectedXLabelGroup);
					selection
						.classed("inactive",false)
						.classed("active",true)
				};
			});
		/*add click event listener for all labels on y axis*/
		selectedYLabelGroup.selectAll("text")
			.on("click",function(){
				var selection = d3.select(this)
				var value = selection.attr("value");
				/*when user selects new labels, get new data and update the chart*/
				if (value!=selectedYLabel) {
					selectedYLabel = value;
					/*update y scale and left axis*/
					yLinearScale = yScale(csvData,selectedYLabel);
					leftAxis = d3.axisLeft(yLinearScale);
					/*re-plot left axis with animation*/
					yAxis.transition()
						.duration(1000)
						.call(leftAxis);

					/*re-plot circles with animation*/
					circleGroup.transition()
						.duration(1000)
			  			.attr("cy", data=>yLinearScale(data[selectedYLabel]));
					
					/*re-plot text in the circles with animation*/
					circleTextGroup.transition()
						.duration(1000)
			  			.attr("y", data=>yLinearScale(data[selectedYLabel]));

					/*update tool tips*/
					updateToolTip(circleGroup,selectedXLabel,selectedYLabel);

					/*make all x axis labels inactive (change color to gray) then make the selected label active (change color to black)*/
					inactivateXLabels(selectedYLabelGroup);
					selection
						.classed("inactive",false)
						.classed("active",true)
				};
			});
	});

	/*defined functions
	================================*/
	/*define xLinearScale based on user selected label and retrieved corresponding data*/
	function xScale(data,selectedXLabel) {
		var xLinearScale = d3.scaleLinear()
	  		.domain([d3.min(data, data=>data[selectedXLabel])*.95,d3.max(data, data=>data[selectedXLabel])*1.05])
	  		.range([0,width]);
	  	return xLinearScale
	}

	/*define yLinearScale based on user selected label and retrieved corresponding data*/
	function yScale(data,selectedYLabel) {
		var yLinearScale = d3.scaleLinear()	
	  		.domain([d3.min(data, data=>data[selectedYLabel])*.95,d3.max(data, data=>data[selectedYLabel])*1.05])
	  		.range([height, 0]);
	  	return yLinearScale
	}

	/*update tool tip based on user selected labels*/
	function updateToolTip(circleGroup,selectedXLabel,selectedYLabel) {
		if (selectedXLabel == "povertyRatio") {
			var xLabel = "Poverty %: ";
		} else if (selectedXLabel == "lessthanHighSchool") {
			var xLabel = "Education less than High School %: ";
		} else {
			var xLabel = "Median Income $: ";
		};

		if (selectedYLabel == "obeseRatio") {
			var yLabel = "Obesity %: ";
		} else if (selectedYLabel == "healthcareCoverage") {
			var yLabel = "Health Care Coverage %: ";
		} else {
			var yLabel = "Smoker %: ";
		};

		/*plot tool tips*/
		var toolTip = d3.tip()
			.attr("class","tooltip")
			.offset([-10,-60])
			.html(function (data) {
				return (`${data.stateName}<br>${xLabel} ${data[selectedXLabel]}<br>${yLabel} ${data[selectedYLabel]}`)
			});
		chartGroup.call(toolTip)

		/*add mouse over and out event listeners to the tool tips*/
		circleGroup.on("mouseover",function(data) {
			toolTip.show(data);
		});
		circleGroup.on("mouseout",function(data) {
			toolTip.hide(data);
		});
	}

	/*change the class of all labels on x axis to inactive*/
	function inactivateXLabels(selectedXLabelGroup) {
		selectedXLabelGroup.selectAll("text")
			.classed("active",false)
			.classed("inactive",true)
	}

	/*change the class of all labels on y axis to inactive*/
	function inactivateYLabels(selectedYLabelGroup) {
		selectedYLabelGroup.selectAll("text")
			.classed("active",false)
			.classed("inactive",true)
	}
	/*================================*/
}








