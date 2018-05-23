define([], function () {

    var defaultConfig = {
        image_path: '/site/employees/photos/smaller/',
        image_default: 'person_default.jpg',
        image_extension: 'jpg',
        keyField: 'Trigram',
        tooltipTpl: null,
        width: 960,
        height: 480,
        url_pathname: ''
    }

    function QlikSearchOrgChart(){
        this.data;
        this.config = {};
        this.init = false;
        this.container;
        this.me;
    }

    QlikSearchOrgChart.prototype = Object.create(Object.prototype, {
		isInit: {
			value: function(){
				return this.init;
			}
		},
        initialize: {
            value: function(id, options){

            	if (!options){ options = {}; }
            	
            	this.config = merge({}, defaultConfig, options);

            	this.colors = d3.scale.category10();
            
                var width = this.config.width,
				    height = this.config.height;

				this.zoom = d3.behavior.zoom()
				    .scaleExtent([0.1, 5])
				    .translate([0,0])
				    .on("zoom", zoomed );

				this.main = d3.select(id)
					.attr("class", "qs-orgchart")
					.append("svg")
				    .attr("width", width)
				    .attr("height", height);

				

				var svg = this.main.append("g")
				    .attr("transform", "translate(0,0)");

				// Per-type markers, as they don't inherit styles.
				svg.append("defs").selectAll("marker")
				    .data(["suit", "licensing", "resolved"])
				  	.enter().append("marker")
				    .attr("id", function(d) { return d; })
				    .attr("viewBox", "0 -5 10 10")
				    .attr("refX", 33)
				    .attr("refY", 0)
				    .attr("markerWidth", 6)
				    .attr("markerHeight", 6)
				    .attr("orient", "auto")
				  	.append("path")
				    .attr("d", "M0,-5L10,0L0,5");			

				this.svg = svg;
				this.svg.call(this.zoom);

				this.tooltip = d3.select(id).append("div")   
			    .attr("class", "tooltip")               
			    .style("display", 'none');

			    var rect = svg.append("rect")
			    	.attr('class', 'zoomRect')
				    .attr("width", width)
				    .attr("height", height)
				    .style("fill", "none")
				    .style("pointer-events", "all");			


				this.container = svg.append("g");
			    
				this.force = d3.layout.force()
				    .gravity(.06)
				    .distance(100)
				    //.linkDistance(120)
				    //.charge(-200)
				    .charge(-350)
    				//.linkDistance(120)
				    .size([width, height]);
				var self = this;
				function zoomed() {
    				self.container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
				}			

                this.init = true;
            }
        },
        clear: {
            value: function(){
                this.values =  { nodes: [], links: [] };
                this.render();
            }
        },
        render: {
            value: function(){

                this.force.nodes(this.values.nodes)
				.links(this.values.links)
				.start();

				//window.setTimeout(function(){

					var config = this.config,
						tooltip = this.tooltip,
						me = this.me,
						colors = this.colors;

					this.container.selectAll(".link").remove();
					this.container.selectAll(".node").remove();

					var link = this.container.selectAll(".link")
					  .data(this.values.links);

					link.enter().insert("svg:line", ".node")
					  .attr("class", function(d) {
					  	if (d[config.keyField] === me){ 
					  		return "link me" ; 
					  	}else{
					  		return "link" ;
					  	}
					  })
					  .attr("marker-end", function(d) { return "url("+config.url_pathname+"#suit)"; });

					// Exit any old links.
  					link.exit().remove();

					var node = this.container.selectAll(".node")
					  .data(this.values.nodes);

					var gNode = node.enter().append("g")
					  .attr("class", "node")
					  .style('cursor', 'pointer')
					  .on('click', function(d){
					  		console.log('node click', d);
					  })
					  .on("mouseover", function(d) { 
					  		if (!config.tooltipTpl || !d.data) return;
	        
						    tooltip.html(config.tooltipTpl(d))  
						        .style("left", ( d3.event.pageX ) + "px")     
						        .style("top", ( d3.event.pageY - 100 ) + "px");    
								
							tooltip.style("display", 'block'); 	
					  })                  
					  .on("mouseout", function(d) {  
					  		if (!config.tooltipTpl || !d.data) return;
					  		     
						    tooltip.style("display", "none");   
					  })
					  .call(this.force.drag);			

					gNode.append("circle")
					.attr('r', function(d){
					  		if (d[config.keyField] === me){
					  			return 30;
					  		}else{
					  			return 15;
					  		}
					  })
					.attr('stroke', function(d){
						if (d[config.keyField]=== me ){
							return 'red';
						}
						else if(d.subnet === true){
							return 'orange';
						}
						else if (typeof d['color'] !== undefined){
							return colors(d['color']);
						}else{
							return '#509B1F';
							
						}
					})
					.attr('stroke-width', function(d){
						if (d[config.keyField] === me){
							return '2px';
						}else{
							return '1px';
						} 
					})
					.attr("cx", 0)
					.attr("cy",0)
					.attr('fill', 'white');

					var xy = function(d){
						if (d[config.keyField] === me){
							return -20;
						}
						return -10;	
					};
					var wh = function(d){
						if (d[config.keyField] === me){
							return 40;
						}
						return 20;		
					};

					gNode.append("image")
					  .attr('id', function(d){
					  		return d[config.keyField];
					  })
					  .attr("xlink:href", function(d){
					  		return config.image_default;
					  })
					  .attr("x", xy)
					  .attr("y", xy)
					  .attr("width", wh)
					  .attr("height", wh);

					gNode.append("text")
					  .text(function(d) { return d["fieldSourceID"]; })
					  //.attr("width", 'auto')
					  .attr("height", '50px')
					  .attr('x', 20) 
					  .attr('y', 10);
					  
					node.exit().remove();

					this.force.on("tick", function() {  	
						link.attr("x1", function(d) { return d.source.x; })
						    .attr("y1", function(d) { return d.source.y; })
						    .attr("x2", function(d) { return d.target.x; })
						    .attr("y2", function(d) { return d.target.y; });

						node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
					});

					/*this.force.on("end", function(){
						console.log('END ANIMATION!!');
					});*/

				//}.bind(this), 800);

            }
        },
        setData: {
            value: function(items, me){             
                
                if (!items){ return; }
                
                this.clear();

                this.me = me.toUpperCase();
                this.values = perpareData(items, this.config); 

                d3.transition().duration(500).tween("zoom", function(){
                	this.zoom.translate([0,0]).scale(1);
                	return function(t){
                		this.container.attr("transform", "translate(0,0) scale(1)");
                	}.bind(this);
                }.bind(this));
               
                //render network
                this.render(); 

            }
        },
        setMore: {
        	value: function(items, me){

        		if (!items){ return; }

        		this.clear();

        		this.me = me.toUpperCase();   		
        		this.values = perpareData(items, this.config);
                this.render();
 
        	}
        },
        setValues:{
        	value: function(values, me){
        		if (!values){ return; }
				
				this.clear();
        		this.me = me.toUpperCase(); 
        		this.values = values;
                this.render();
        	}
        }
    });

	function getImage(tri, id, config, fn){
        var xhr;
        if(window.XMLHttpRequest){
            xhr = new XMLHttpRequest();
        }else{
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.onreadystatechange = function(){
            if(xhr.readyState == 4 && xhr.status == 404){
                fn(null);
            }else if(xhr.readyState == 4 && xhr.status == 200){
            	fn({
                	id: id,
                	url: config.image_path+tri+'.'+config.image_extension
                });
            }
        }
        xhr.open("GET", config.image_path+tri+'.'+config.image_extension, true);
        xhr.send();
    }

    function perpareData(json, config){
        var res = { nodes: [], links: [] };
        var ids = [];
        for (var i=0; i<json.length; i++){
            if (ids.indexOf(json[i].data["fieldSourceID"]) === -1){
                ids.push(json[i].data["fieldSourceID"]);
                res.nodes.push(json[i].data);
            }     
        }
        for (var i=0; i<json.length; i++){
        	var targetID = ids.indexOf(json[i].data["fieldTargetID"]);
        	var sourceID = ids.indexOf(json[i].data["fieldSourceID"]);
            if (targetID !== -1){
                res.links.push({
                    source: sourceID, 
                    target: targetID,
                    tri: json[i].data[config.keyField]
                });
            }
        }

        return res;

    }

    function merge(){
	    var obj = {},
	        i = 0,
	        il = arguments.length,
	        key;
	    for (; i < il; i++) {
	        for (key in arguments[i]) {
	            if (arguments[i].hasOwnProperty(key)) {
	                obj[key] = arguments[i][key];
	            }
	        }
	    }
	    return obj;
	}

    return QlikSearchOrgChart;

});