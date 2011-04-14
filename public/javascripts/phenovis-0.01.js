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
  //  var cfDist = max(Math.round((d.length / 20)),1); // distance to look back/forth in array
  //  alert([Math.round(d.length / 20),1].max());
  var cfDist = [Math.round(d.length / 20),1].max();
  //  alert(max(5,cfDist)); 

  function push(i, direction) {
    var m = i > d.length / 2 ? d.length - i : i; //distance to nearest end
    var start_i = i;
    var _i = i + direction; //always compare to neighbour first
    //    var x = 0; // no of iterations
    var x = 0;
    var cc = false;

    while(x <= m) { //for x iterations
    //    while(x <= cfDist) { //for x iterations

      /*
    alert("st_i = "+start_i+" dir = "+direction+"\n\t["+i+" cf "+_i+"]   m="+m+"\n"+
	  "(i >= 0 && i <= max && _i >= 0 && _i <= max && x <= m)\n"+
	  (i >= 0)+" && "+(i <= max)+" && "+(_i >= 0)+" && "+(_i <= max)+" && "+(x <= m)+"\n"+
	  ((i+=direction) >= 0)+" && "+((i+=direction) <= max)+" && "+((_i+=direction) >= 0)+" && "+((_i+=direction) <= max)+" && "+((x+1) <= m)
);
      */

      if(i >= 0 && i <= max && _i >= 0 && _i <= max) { //as long as i/_i in range
      /* debug stuff */
      //      var allDec = d.findAll(function(e) {return e.x == "decreased intensity"}).pluck('xpos');
      /*	if(d[i].x == "decreased intensity") {
	  alert("and we're in the loop...  start_i = "+start_i+" m="+m+" i="+i+" s="+s+"\n"
		+allDec+"\n"
		+d[i].x+"."+i+"\t"+d[i].xpos+"\n"
		+d[_i].x+"."+_i+"\t"+d[_i].xpos+"\n"
		+" direction * dist(d[_i], d[i]) < s "+"\n"
		+"("+dist(d[_i], d[i])+") < "+s+") \n"+
		" = "+(dist(d[_i], d[i]) < s));
	}
      */

	var hyp = dist(d[_i], d[i]);
	var theta = dir(d[_i], d[i]);
	if (hyp < s) { // If the difference is to small
	  var diff = (s - hyp) / 2;
	  var ytrans = 0;
	  var xtrans = diff;
	  
	  if((d[_i].y == d[i].y)) {
	    theta = direction * Math.PI / 4;
	    ytrans = diff * Math.sin(theta);
	    xtrans = diff * Math.cos(theta);
	  }
	  
	  
	  //	  alert("hyp = "+hyp+" theta = "+theta+"\nxtr = "+xtrans+" ytrans = "+ytrans);
	  d[_i].xpos = d[_i].xpos + (xtrans * direction);
	  d[i].xpos = d[i].xpos + (xtrans * -1 * direction); // Move both points equally away.
	  d[_i].ypos = d[_i].ypos + (ytrans * direction);
	  d[i].ypos = d[i].ypos + (ytrans * -1 * direction); // Move both points equally away.
	  

	  if (diff >= 1) // Prevents infinite loops. Once all the differences are less than 1, we can stop
	    cc = true;
	}
      }
      //       i += direction;
      _i += (direction * Math.round(Math.random()*cfDist));
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
 

  // iterations - this is a dead-man's switch to avoid locking up the browser
  // in case we enter some form of infinite loop due to the while loop in push() above.
  var iterations = 0;
  //  var maxIterations = d.length * d.length;
  var maxIterations = d.length;
  
  do {
    var overlaid = false;
    // For each data point in the array, push, if necessary, that data point
    // and it's surrounding data points away.
    /*    for(var i = 1; i < d.length - cfDist; ++i) {
      for(var j = 1; j<= cfDist; j++){
	var o = push(i, -1 * j);
	overlaid = overlaid || o;
	o = push(i, j);
	overlaid = overlaid || o;
	}
      }
    */
    for(var i = 1; i < d.length -1; ++i) {
	var o = push(i, -1);
	//	alert(o);
	overlaid = overlaid || o;
	o = push(i, 1);
	//alert(o);
	overlaid = overlaid || o;
      }
    //    alert("iterations: " +iterations+" overlaid: "+overlaid);
    iterations++;
  } while(overlaid && iterations < maxIterations);
  
  return d;
}
