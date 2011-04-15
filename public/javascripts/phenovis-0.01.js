/* traverse (any) json object to find nodes of a particular type */
function nodeFromArray(objects, catchString) {
    for (var i = 0; i < objects.length; i++) {
//	alert(i + " " + objects[i].value + " -> " + eval('objects[i].'+catchString));
	if (eval('objects[i].'+catchString)) { return objects[i];}
    }
}


function traverse(o,func) {
    for (i in o) {
        func.apply(this,[i,o[i]]);      
        if (typeof(o[i])=="object") {
                //going on step down in the object tree!!
                traverse(o[i],func);
        }
    }
}


function jitter(data, space) {
  var d = data;
  var s = space;
  var max = d.length - 1;
  var cfDist = [Math.round(d.length / 20),1].max();

  function push(i, direction) {
    var m = i > d.length / 2 ? d.length - i : i; //distance to nearest end
    var start_i = i;
    var _i = i + direction; //always compare to neighbour first
    var x = 0; // no of iterations
    var cc = false;

    while(x <= m) { //for x iterations

      if(i >= 0 && i <= max && _i >= 0 && _i <= max) { //as long as i/_i in range

	var hyp = dist(d[_i], d[i]);
	var theta = dir(d[_i], d[i]);
	if (hyp < s) { // If the difference is to small
	  var diff = (s - hyp) / 2;
	  var ytrans = 0;
	  var xtrans = diff;
	  
	  /* add vertical jitter if overlaid dots on same x axis */
	  if((d[_i].y == d[i].y) && (d[_i].xpos == d[i].xpos)) {
	    theta = (direction * (Math.PI / 4));
	    //	    theta = Math.random()*(2*Math.PI);
	    ytrans = diff * Math.sin(theta);
	    xtrans = diff * Math.cos(theta);
	  }
	  
	  
	  //	  alert("hyp = "+hyp+" theta = "+theta+"\nxtr = "+xtrans+" ytrans = "+ytrans);
	  d[_i].xpos = d[_i].xpos + (xtrans * direction);
	  d[i].xpos = d[i].xpos + (xtrans * -1 * direction); // Move both points equally away.
	  d[_i].ypos = d[_i].ypos + (ytrans * direction);
	  d[i].ypos = d[i].ypos + (ytrans * -1 * direction); // Move both points equally away.
	  

	  if (diff >= 1) // Prevents infinite loops. if diffs > 1, stop
	    cc = true;
	}
      }
      _i += (direction * Math.round(Math.random()*cfDist)); //compare to random node, no further than cfDist away
      //i += direction;
      //_i += direction;
      x++;
    }
    return cc;
  }
  
  /* calc euclid distance */
  function dist (a, b) {
    return Math.sqrt(Math.pow(Math.abs(a.ypos - b.ypos),2) + 
		     Math.pow(Math.abs(a.xpos - b.xpos),2));
  }

  /* calc tan direction */
  function dir (a, b) {
    return Math.atan2((a.ypos - b.ypos),(a.xpos - b.xpos));
  }
 

  // prevents endless push back-and-forth
  var iterations = 0;
  //  var maxIterations = d.length * d.length;
  var maxIterations = d.length;
  
  do {
    var overlaid = false;
    // For each data point in the array, push, if necessary, that data point
    // and it's surrounding data points away.
    for(var i = 1; i < d.length -1; ++i) {
    
	var o = push(i, -1);
	overlaid = overlaid || o;
	o = push(i, 1);
	overlaid = overlaid || o;
      }
    iterations++;
  } while(overlaid && iterations < maxIterations);
  
  return d;
}




/* dot plot */

function dotplot(data, w, h, xstring, ystring, zstring) {
      /* Sizing and scales. */

  var data, w, h; 
  /*  
    var xselect = 'cvalue != undefined';
    var xval = 'cvalue.name';
    var yselect = 'value >= 0';
    var yval = 'value';
  */
 
  function findVals (valString) {
    var objectPath = valString.split("->");
    catchString = "data.experiments";
    for (var i=0; i<objectPath.length;i++) {
      var gets = objectPath[i].split(':');
      var objectType = gets[0]; var predicate = gets[1];
      if(predicate != undefined)
	catchString = catchString.concat(".collect(function(d) {return nodeFromArray(d.",objectType,",\"",predicate,"\")})");
      else
	catchString = catchString.concat(".collect(function(d) {return d.",objectType,"})");
    }
    //    alert(valString+"\n"+catchString);
    var myVals = eval(catchString);
    return myVals;
  }

  
  
  
  //  var xvals = data.experiments.collect(function(d) {return nodeFromArray(d.phenotypes, xselect).cvalue.name});
  //  alert(xvals+"\n\n"+myXvals);  
  //  var yvals = data.experiments.collect(function(d) {return nodeFromArray(d.phenotypes, yselect).value});
  //  alert(yvals+"\n\n"+myYvals);


  function getScale(scaleVals, sz) {
    var numreg=/(^\d+$)|(^\d+\.\d+$)/;
    if(scaleVals.uniq().any(function(d) {return (!numreg.test(d))}))
      s = pv.Scale.ordinal(scaleVals.uniq()).split(0, sz);
    else
      s = pv.Scale.linear(0, scaleVals.max()).range(0, sz).nice();
	
    // alert((s instanceof pv.Scale.ordinal)+"\n"+s.class);
    return s;
  }
  
  function setXAxis(scaleVals, scale, vis) {
    var numreg=/(^\d+$)|(^\d+\.\d+$)/;
    // nb - find way to check scale type from scale?
    if(scaleVals.uniq().any(function(d) {return (!numreg.test(d))})) { // ordinal axis and ticks.
      vis.add(pv.Rule).data(scaleVals.uniq())
	.strokeStyle(function(d) {return d ? "#eee" : "#000"})
	.left(scale).anchor("bottom").add(pv.Label);
    }
    else {  // linear axis and ticks.
      vis.add(pv.Rule).data(scale.ticks)
	.strokeStyle(function(d) {return d ? "#eee" : "#000"})
	.left(scale).anchor("bottom")
	.add(pv.Label).text(y.tickFormat);
    }  
    return vis;
  }

  function setYAxis(scaleVals, scale, vis) {
    var numreg=/(^\d+$)|(^\d+\.\d+$)/;
    if(scaleVals.uniq().any(function(d) {return (!numreg.test(d))})) { // ordinal axis and ticks.
      vis.add(pv.Rule).data(scaleVals.uniq())
	.strokeStyle(function(d) {return d ? "#eee" : "#000"})
	.bottom(scale).anchor("left").add(pv.Label);
    }
    else { // linear axis and ticks.
      alert("here");
      vis.add(pv.Rule).data(scale.ticks())
	.strokeStyle(function(d) {return d ? "#eee" : "#000"})
	.bottom(scale).anchor("left")
	.add(pv.Label).text(y.tickFormat);
    }  
    return vis;
  }



  /*
  if(xvals.uniq().any(function(d) {return (!numreg.test(d))}))
    x = pv.Scale.ordinal(xvals.uniq()).split(0, w);
  else
    x = pv.Scale.linear(0, xvals.max()).range(0, w).nice()
    
  if(yvals.uniq().any(function(d) {return (!numreg.test(d))}))
    y = pv.Scale.ordinal(yvals.uniq()).split(0, h);
  else
    y = pv.Scale.linear(0, yvals.max()).range(0, h).nice();
  */





  function getDataHash (xvals, yvals, zvals) {
    /* make data structure */
    var valHash = new Hash();
    valHash.set("X",xvals);
    valHash.set("Y",yvals);
    valHash.set("Z",zvals);
      
    var dataHash = data.experiments.map(function(d,i) {
	var xval = this.get("X")[i];
	var yval = this.get("Y")[i];
	var zval = this.get("Z")[i];
	return {x: xval, xpos: x(xval), 
	    y: yval, ypos: y(yval),
	    z: zval, zpos: z(zval),
	    }},valHash);
    dataMap.sortBy(function(d) {return Number(d.y)});
    return dataHash;
  }



  /* create data */
  var xvals = findVals(xstring);
  var yvals = findVals(ystring);
  var zvals = findVals(zstring);

  var x = getScale(xvals, w);
  var y = getScale(yvals, h);
  var z = pv.Colors.category10(), s = x.range().band / 2;

  var dataMap = getDataHash(xvals, yvals, zvals);


  /* Make root panel. */
  var vis = new pv.Panel()
    .width(w)
    .height(h)
    .bottom(30)
    .left(30)
    .right(10)
    .top(5);

  setXAxis(xvals, x, vis);
  setYAxis(yvals, y, vis);


  /*  
  // Y-axis and ticks. 
   vis.add(pv.Rule)
    .data(y.ticks())
    .bottom(y)
    .strokeStyle(function(d) {return d ? "#eee" : "#000"})
    .anchor("left").add(pv.Label)
    .text(y.tickFormat)
    ;
  */
  /*
  // X-axis and ticks. 
  vis.add(pv.Rule)
    .data(xvals.uniq())
    .strokeStyle(function(d) {return d ? "#eee" : "#000"})
    .left(x)
    .anchor("bottom")
    .add(pv.Label)  	
    ;
  */
  
  /* The dot plot! */
  panel = vis.add(pv.Panel)
    .data(jitter(dataMap, 10))
    //	 .data(dataMap)
    ;
  
  dots = panel.add(pv.Dot)
    .bottom(function(d) {return d.ypos})
    .left(function(d) {return d.xpos})
    .strokeStyle(function(d) {return z(d.x)})
    ;
  
  return vis;   
}
