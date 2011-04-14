/*  test 2-value plotting method
 *
 *--------------------------------------------------------------------------*/


function xyPlot(project, v1, v1select, v2, v2select) {	 

  var data = project;
  // var data, dataJson, v1, v1select, v2, v2select;

      /* Sizing and scales. */
      var w = 500,
          h = 500,
//    	  x = pv.Scale.linear(0, 99).range(0, w),
//	  x = pv.Scale.ordinal(data.experiments, function(e) (e.phenotypes.each.cvalue)?e.phenotypes.each.cvalue:-1).splitBanded(0, w, 3/5)
//  	  x = pv.Scale.ordinal(data.experiments).split(0,w)
	  x = pv.Scale.ordinal(["decreased intensity","normal","increased intensity"]).split(0, w)
//	  x = pv.Scale.ordinal(data.experiments, function(e) e.id).splitBanded(0, w, 3/5)
    	  y = pv.Scale.linear(0, 500).range(0, h).nice(),
//    	  y = pv.Scale.log(0.1, 500).range(0, h).nice(),
	  s = x.range().band / 2;
//    	  c = pv.Scale.log(1, 100).range("orange", "brown");
	  c = pv.Colors.category10();

 /* The root panel. */
    var vis = new pv.Panel()
         .width(w)
    	 .height(h)
  	 .bottom(20)
    	 .left(20)
    	 .right(10)
    	 .top(5);

 /* Y-axis and ticks. */
    vis.add(pv.Rule)
	.data(y.ticks())
   	.bottom(y)
     	.strokeStyle(function(d) d ? "#eee" : "#000")
  	.anchor("left").add(pv.Label)
//    	.visible(function(d) d % 0.1 == 0 || d % 10 == 0)
    	.text(y.tickFormat)
	;

/* X-axis and ticks. 
    vis.add(pv.Rule)
	.data(["decreased intensity","normal","increased intensity"])
	.left(x)
	.anchor("bottom").add(pv.Label)
//    	
;

/* The dot plot! */
//     points.add(pv.Dot)
     panel = vis.add(pv.Panel)
       .data(data.experiments.sort(function(d) {nodeFromArray(d.phenotypes, "value >= 0").value}))
       ;

//     var dots = new Array();
     dots = panel.add(pv.Dot)
/*   change zeros to 0.1 for log scale */
//    	    .bottom(function(d) y((nodeFromArray(d.phenotypes, "value >= 0").value == 0)?0.1:nodeFromArray(d.phenotypes, "value >= 0").value) )
    	    .bottom(function(d) y(nodeFromArray(d.phenotypes, "value >= 0").value) )
	    .left(function(d) x(d.phenotypes[1].cvalue.name))
	    .strokeStyle(function(d) c(d.phenotypes[1].cvalue.name))
	;

     //	alert(panel.children.length + " "+ panel.children[0].type);
     //	alert(data.type +" "+ data.map);
//     dots.sort(function(d) {d.bottom});
/*     for(var i = 0; i <= dots.data.experiments.length; i++) {
     	alert(dots.data.type);
	pv.search(dots)
     }
*/
	// vis.render();   
	return vis;
}
