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
    var _i = i + direction;
    var x = 0; // no of iterations
    var cc = false;
    //    alert("i="+i+" m="+m);
    while(i >= 0 && i <= max && _i >= 0 && _i <= max && x <= m) {

      /* debug stuff */
      var allDec = d.findAll(function(e) {return e.x == "decreased intensity"}).pluck('xpos');
	if(d[i].x == "decreased intensity") {
	  alert("and we're in the loop...  start_i = "+start_i+" m="+m+" i="+i+" s="+s+"\n"
		+allDec+"\n"
		+d[i].x+"."+i+"\t"+d[i].xpos+"\n"
		+d[_i].x+"."+_i+"\t"+d[_i].xpos+"\n"
		+" direction * dist(d[_i], d[i]) < s "+"\n"
		+"("+dist(d[_i], d[i])+") < "+s+") \n"+
		" = "+(dist(d[_i], d[i]) < s));
	}
      

      
      if (dist(d[_i], d[i]) < s) { // If the difference is to small
	var diff = (s - dist(d[_i], d[i])) / 2;
	d[_i].xpos = d[_i].xpos + diff;
	d[i].xpos = d[i].xpos + diff * -1; // Move both points equally away.
	if (diff >= 1) // Prevents infinite loops. Once all the differences are less than 1, we can stop
	  cc = true;
      }
//      i += direction;
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
	//alert(o);
	overlaid = overlaid || o;
	o = push(i, 1);
	//	alert(o);
	overlaid = overlaid || o;
      }
    alert("iterations: " +iterations+" overlaid: "+overlaid);
    iterations++;
  } while(overlaid && iterations < maxIterations);
  
  return d;
}
