/**
 * @owner Erik Wetterberg (ewg)
 */

define( [], function ( ) {
	
	return {
		type: "items",
		component: "accordion",
		items: {
			dimensions : {
				uses : "dimensions",
				min : 2,
				max: 2
			},
			measures : {
				uses : "measures",
				min : 0,
				max : 1
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
					},
				}
			}
		}
	};
 
});
