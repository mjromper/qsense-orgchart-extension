define( [], function ( ) {
	
	return {
		type: "items",
		component: "accordion",
		support: {
			snapshot: true,
			export: true,
			exportData: true
		},
		items: {
			dimensions : {
				uses : "dimensions",
				min : 2,
				max: 2,
				items: {	
					colorExpression: {  
						type: "string",
						label: "Enter color expression",
						ref:"qAttributeExpressions.0.qExpression",
						expression:"always"
					}
				}
			},
			measures : {
				uses : "measures",
				min : 0,
				max : 10
			},
			sorting : {
				uses : "sorting"
			},
			settings : {
				uses : "settings",
				items : {
					initFetchRows : {
						ref : "qHyperCubeDef.qInitialDataFetch.0.qHeight",
						label : "Initial fetch rows",
						type : "number",
						defaultValue : 1000
					}
				}
			}
		}
	};
 
});
