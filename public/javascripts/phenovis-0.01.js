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
  alert([Math.round(d.length / 20),1].max());
  var cfDist = [Math.round(d.length / 20),1].max();
  //  alert(max(5,cfDist)); 

  function push(i, direction) {
    var m = i > d.length / 2 ? d.length - i : i;
    var _i = i + direction;
    var x = 0;
    var cc = false;
    //    alert("i="+i+" m="+m);
    while(i >= 0 && i <= max && _i >= 0 && _i <= max && x < m) {
      /*          alert("and we're in the loop... i="+i+" m="+m+" s="+s+"\n\n"
		  +" direction * dist(d[_i], d[i]) < s "+"\n"
	    +"("+dist(d[_i], d[i])+") < "+s+") \n"+
		 " = "+(dist(d[_i], d[i]) < s));
      */

      //      if (direction * (d[_i].ypos - d[i].ypos) < s) { // If the difference is to small
      if (dist(d[_i], d[i]) < s) { // If the difference is to small
	//var diff = (s - Math.abs(d[_i].xpos - d[i].xpos)) * direction / 2;
	var diff = (s - dist(d[_i], d[i])) / 2;
	//	alert("i " + i + " diff = " +diff);
	d[_i].xpos = d[_i].xpos + diff;
	d[i].xpos = d[i].xpos + diff * -1; // Move both points equally away.
	if (diff >= 1) // This is required to avoid infinite loops. Once all the differences are less than 1, we can stop
	  cc = true;
      }
      i += direction;
      _i += direction;
      x++;
    }
    return cc;
  }
  
  /* calc euclid distance */
  function dist (a, b) {
    //    alert(a.x + a.y +" - "+b.x + b.y +" " +Math.sqrt(Math.pow(Math.abs(a.ypos - b.ypos),2) + 
    //						     Math.pow(Math.abs(a.xpos - b.xpos),2)));

    return Math.sqrt(Math.pow(Math.abs(a.ypos - b.ypos),2) + 
		     Math.pow(Math.abs(a.xpos - b.xpos),2));
  }

  // iterations - this is a dead-man's switch to avoid locking up the browser
  // in case we enter some form of infinite loop due to the while loop in push() above.
  var iterations = 0;
  var maxIterations = d.length * d.length;
  
  do {
    var overlaid = false;
    // For each data point in the array, push, if necessary, that data point
    // and it's surrounding data points away.
    for(var i = 1; i < d.length - cfDist; ++i) {
      for(var j = 1; j<= cfDist; j++){
	var o = push(i, -1 * j);
	overlaid = overlaid || o;
	o = push(i, j);
	overlaid = overlaid || o;
      }
    }
    iterations++;
  } while(overlaid && iterations < maxIterations);
  
  return d;
}
