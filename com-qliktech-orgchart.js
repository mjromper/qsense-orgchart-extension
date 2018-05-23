/*globals define, console*/
requirejs.config({
	shim : {
		"extensions/com-qliktech-orgchart/libs/qs-orgchart" : {
			"deps" : ["extensions/com-qliktech-orgchart/libs/d3.min"]
		}
	}
});

define([
	"jquery", 
	"./orgchart-properties", 
	"./tooltip-template",
	"text!./orgchart.css", 	 
	"./libs/qs-orgchart"
], 
function($, properties, tooltipFn, cssContent, QlikSearchOrgChart) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");

	var orgchart = new QlikSearchOrgChart();
	
    
	return {
		initialProperties : {
			version: 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 10,
					qHeight : 1000
				}]
			}
		},
		definition : properties,
		snapshot : {
			canTakeSnapshot : true
		},
		paint : function($element, layout) {
			$element.empty();
			
			//if ( !orgchart.isInit() ) {
				var orgChartptions = {
					'tooltipTpl': function(d){
						return tooltipFn.get(d);
					},
					'image_default': '/extensions/com-qliktech-orgchart/person.png',
					'width': $element.width(),
					'height': $element.height(),
					'url_pathname': window.location.pathname
				};
				orgchart.initialize($element[0], orgChartptions);
			//} else {
			//	console.log("is init!!!");
			//}

			var dimensions = [];
			var measures = [];

			var self = this;

			//render titles
			$.each(this.backendApi.getDimensionInfos(), function(key, value) {
				//console.log('dimesions', key, value);
				dimensions.push(value.qFallbackTitle);
			});
			$.each(this.backendApi.getMeasureInfos(), function(key, value) {
				//console.log('measures', key, value);
				measures.push(value.qFallbackTitle);
			});

			var values = { nodes: [], links: [] };
			var ids = [];

			this.backendApi.eachDataRow( function (rownum, row){				
				var origen = row[0];
				var target = row[1];
				var color = row[0].qAttrExps.qValues[0].qText;
				
				if (origen.qText && ids.indexOf(origen.qText) === -1){
					var data = {"dimensions": [], "measures": []};
					for (var i=0; i<dimensions.length; i++){
						data.dimensions.push({"name": dimensions[i], "value": row[i].qText});
					}
					for (var i=0; i<measures.length; i++){
						data.measures.push({"name": measures[i], "value": row[i+dimensions.length].qText});
					}
					ids.push(origen.qText);
					values.nodes.push({'fieldSourceID': origen.qText, 'color': color? color:null, 'data': data});
				}	

			});
			
			this.backendApi.eachDataRow( function (rownum, row){
				
				var origen = row[0];
				var target = row[1];
				if (target.qText && ids.indexOf(target.qText) === -1){
					ids.push(target.qText);
					values.nodes.push({'fieldSourceID': target.qText});
				}
				
				if (origen.qText && target.qText){
					values.links.push({
						source: ids.indexOf(origen.qText), 
						target: ids.indexOf(target.qText)
					});
				}
			});


			//console.log("VALUES", values);	
			//console.log(layout)
            
			orgchart.setValues(values, '');
			
		}
	};
});
