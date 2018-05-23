// JavaScript
define(function() {
    return {
      get: function(d) {
          var html =  '<h1>'+d.data.dimensions[0].value+'</h1><br/>';
         
         for (var i=0;i<d.data.measures.length;i++){
              html+='<div><label>'+d.data.measures[i].name+'</label>: '+d.data.measures[i].value+'</div>';
         }	
         
         return html;
      }
    };
 });