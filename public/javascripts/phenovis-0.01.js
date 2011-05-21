/**
 * A cluster that contains markers.
 *
 * @param {MarkerClusterer} markerClusterer The markerclusterer that this
 *     cluster is associated with.
 * @constructor
 * @ignore
 */
function Cluster(geoplot) {
  this.geoplot_ = geoplot;
  this.map_ = geoplot.getMap();
  this.sizeFactor_ = 3;
  this.center_ = null;
  this.markers_ = [];
  this.bounds_ = null;
  this.projection_ = geoplot.getProjection();;
}

/**
 * Determins if a marker is already added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker is already added.
 */
Cluster.prototype.addPVMark = function(panel, z) {
    var mark;
    var c = this;
    var markers = this.getMarkers();
    var comp = this.getComposition();
    if(this.getPxSize() < 20) {
//	alert(markers.length+" "+this.getPxSize());
	var bgMark = panel.add(pv.Dot)
	    .left(this.getPxX())
	    .top(this.getPxY())
	    .strokeStyle(pv.color("#aaa").alpha(0.4))
	    .fillStyle(pv.color("#aaa").alpha(0.5))
	    .radius(10)
	    .cursor("pointer")
	    .def("active",false)
	    .event("click", function() {c.clustPop()})
    ;

    }

    if(comp.length == 1) {
	mark = panel.add(pv.Dot);

	mark.left(this.getPxX())
	.top(this.getPxY())
	.strokeStyle(z(comp[0].z))
	.fillStyle(z(comp[0].z).alpha(0.8))
	.radius(this.getPxSize() / 2)
	.cursor("pointer").event("click", function() {c.clustPop()})
	.anchor("center")
	.add(pv.Label)
	.textStyle("white")
	.text(this.getSize()+" "+comp[0].z);
    }
    else {
	mark = panel.add(pv.Panel);
	mark
	.left(this.getPxX())
	.top(this.getPxY())
	.add(pv.Wedge)
	.cursor("pointer")
	.data(comp)
	.angle(function(d) {return (d.points.length / markers.length * 2 * Math.PI)})
	.left(0)
	.fillStyle(function(d) {return z(d.z).alpha(0.8)})
	.strokeStyle("gray")
	.top(0)
	.outerRadius(this.getPxSize()/2)
	.anchor("center").add(pv.Label).textAngle(0)
	.textStyle("white").cursor("pointer")
	.text(function(d) {return d.points.length+" "+d.z});

    }

    mark
    .def("active",false)
    .cursor("pointer")
    .event("click", function() {c.clustPop()})
    ;
    

    //add popup panel
    popM = mark
    .add(pv.Panel)
    .left(this.getPxX())
    .top(this.getPxY())
    .width(100).height(100)
    .fillStyle(pv.color("#fff").alpha(0.5))
    .strokeStyle("grey")
//    .visible(function() {return this.parent.active()})
    .visible(true)
    ;

    //add dots
    popM.add(pv.Dot)
    .data(markers)
    .radius(5)
//    .visible(function() this.parent.active())
    .left(function(d) {/*console.log(this.parent.index+" "+this.index);*/ return ((this.index % 10)+1) * 15})
    .top(function(d) {return Math.floor(((this.index) / 10) + 1) * 15})
    .fillStyle(function(d) {return z(d.z)})
    .strokeStyle(function(d) {return z(d.z)})
    .cursor("pointer").event("click",function(d) {console.log("clicked "+d.z);})
    ; 
//    console.log("popM="+popM.data.length+"\tmark="+mark.data.length);

//    console.log(mark+" "+mark.type+"\t"+popM+" "+popM.type);    
    return mark;
}

/**
 * spawn popup menu for cluster.
 *
 * @return {boolean} True if the marker is already added.
 */
Cluster.prototype.clustPop = function() {
    console.log("clusterPop");
}


/**
 * Determins if a marker is already added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker is already added.
 */
Cluster.prototype.isMarkerAlreadyAdded = function(marker) {
  if (this.markers_.indexOf) {
    return this.markers_.indexOf(marker) != -1;
  } else {
    for (var i = 0, m; m = this.markers_[i]; i++) {
      if (m == marker) {
        return true;
      }
    }
  }
  return false;
};



/**
 * Add a marker to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @return {boolean} True if the marker was added.
 */
Cluster.prototype.addMarker = function(marker) {
  if (this.isMarkerAlreadyAdded(marker)) {
    return false;
  }

  if (!this.center_) {
    this.center_ = new google.maps.LatLng(marker.x, marker.y);
  } 
  else {    
    if (this.averageCenter_) {
      var l = this.markers_.length + 1;
      var lat = (this.center_.lat() * (l-1) + marker.x) / l;
      var lng = (this.center_.lng() * (l-1) + marker.y) / l;
      this.center_ = new google.maps.LatLng(lat, lng);
    }
  }

  marker.isAdded = true;
  this.markers_.push(marker);
  this.calculateBounds_();

  return true;
};


/**
 * Returns the marker clusterer that the cluster is associated with.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 */
Cluster.prototype.getGeoplot = function() {
  return this.geoplot_;
};


/**
 * Returns the bounds of the cluster.
 *
 * @return {google.maps.LatLngBounds} the cluster bounds.
 */
Cluster.prototype.getBounds = function() {
    if (!this.bounds_) {
	this.calculateBounds_(); }
    return this.bounds_();
};


/**
 * Removes the cluster
 */
Cluster.prototype.remove = function() {
  this.clusterIcon_.remove();
  this.markers_.length = 0;
  delete this.markers_;
};


/**
 * Returns the composition of the cluster
 *
 * @return {string} single z val, or 'mixed'
 */
Cluster.prototype.getComposition = function() {
    var markers = this.markers_;
    var zs = markers.collect(function(d) {return d.z}).uniq();
    zs = zs.map(function(d) {return {z: d, points: markers.findAll(function(e) {return e.z == d;})}});
    return zs;
//    if(zs.length ==1) {return zs[0];}
//    else {return "mixed";}
};


/**
 * Returns the center of the cluster.
 *
 * @return {Array.<google.maps.Marker>} The cluster center.
 */
Cluster.prototype.getMarkers = function() {
  return this.markers_;
};


/**
 * Returns the center of the cluster.
 *
 * @return {google.maps.LatLng} The cluster center.
 */
Cluster.prototype.getCenter = function() {
  return this.center_;
};

/**
 * return pixel position for center of map
 * @return {real} .
 */
Cluster.prototype.getPxX = function() {
    return this.projection_.fromLatLngToDivPixel(this.center_).x;
}

/**
 * return pixel position for center of map
 * @return {real} .
 */
Cluster.prototype.getPxY = function() {
    return this.projection_.fromLatLngToDivPixel(this.center_).y;
}


/**
 * Calculated the extended bounds of the cluster with the grid.
 *
 * @private
 */
Cluster.prototype.calculateBounds_ = function() {
  var bounds = new google.maps.LatLngBounds(this.center_, this.center_);

//  var projection = this.getGeoplot().getProjection();
  var projection = this.projection_;

  // Turn the bounds into latlng.
  var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
      bounds.getNorthEast().lng());
  var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
      bounds.getSouthWest().lng());

  // Convert the points to pixels and the extend out by the grid size.
  var trPix = projection.fromLatLngToDivPixel(tr);
  var spotSize = this.getPxSize();
  trPix.x += spotSize/2;
  trPix.y -= spotSize/2;

  var blPix = projection.fromLatLngToDivPixel(bl);
  blPix.x -= spotSize/2;
  blPix.y += spotSize/2;

  // Convert the pixel points back to LatLng
  var ne = projection.fromDivPixelToLatLng(trPix);
  var sw = projection.fromDivPixelToLatLng(blPix);

  // Extend the bounds to contain the new bounds.
  bounds.extend(ne);
  bounds.extend(sw);
  this.bounds_ = bounds;
  return bounds;
};

Cluster.prototype.getPxSize = function() {
      return this.markers_.length * this.sizeFactor_;
}

Cluster.prototype.getSize = function() {
      return this.markers_.length;
}

/**
 * Determines if a marker lies in the clusters bounds.
 *
 * @param {google.maps.LatLon} marker The marker to check.
 * @return {boolean} True if the marker lies in the bounds.
 */
Cluster.prototype.isPosInClusterBounds = function(pos) {
  var contains = this.bounds_.contains(pos);
//  alert(this.bounds_+" contains "+pos+" = "+contains);
  return contains;
};


/**
 * Returns the map that the cluster is associated with.
 *
 * @return {google.maps.Map} The map.
 */
Cluster.prototype.getMap = function() {
  return this.map_;
};


/**
 * A ClusteredSet that contains clusters and markers.
 *
 * @param {MarkerClusterer} markerClusterer The markerclusterer that this
 *     cluster is associated with.
 * @constructor
 * @ignore
 */
function ClusterSet(geoplot, data) {
  this.geoplot_ = geoplot;
  this.data_ = data;
  this.map_ = geoplot.getMap();
  this.sizeFactor_ = 5;

  this.clusters_ = [];
  this.makeClusters_();
}

/**
 * return clusters
 * @private
 */
ClusterSet.prototype.getClusters = function() {
    return this.clusters_;
}

/**
 * cycle through points in data_, add overlaps into clusters
 * datum = {x: lat, y: lon, z: var}
 * @private
 */
ClusterSet.prototype.makeClusters_ = function() {
    this.clusters_ = [];
    for(var i=0; i< this.data_.length; i++) {
	var datum = this.data_[i];
	// alert(datum+", "+this.data_.length);
	this.addMarker(datum);
    }
}


/**
 * Add a marker to a cluster, or creates a new cluster.
 *
 * @param {??} marker The marker to add.
 * @private
 */
ClusterSet.prototype.addMarker = function(marker) {
  var pos = new google.maps.LatLng(marker.x, marker.y);
//  alert(marker.x+" "+marker.y+"\t"+pos);

  clustersAdded = 0;
  for(var i=0; i< this.clusters_.length; i++) {
	var cluster = this.clusters_[i];
	// alert(i+" "+cluster.isPosInClusterBounds(pos));
	if(cluster.isPosInClusterBounds(pos)) {
	    cluster.addMarker(marker);
	    clustersAdded++;
	    break;
	}
  }
  if(clustersAdded < 1) {
      var cluster = new Cluster(this.geoplot_);
      cluster.addMarker(marker);
      this.clusters_.push(cluster);
  }
}/* traverse (any) json object to find nodes of a particular type */
function nodeFromArray(objects, catchString) {
    for (var i = 0; i < objects.length; i++) {
	if (eval('objects[i].'+catchString)) { return objects[i];}
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

/* nd_json utility methods */

/* find values within json object */
/* uses fairly standard string notation "objectOne->objectTwo:methodOfSelection";
   the method of selection should return a single node, if not the first matching node will be returned.
   if no selection method is provided, should be a single value, NOT array
   the array will be built with one value per nd_experiment object (to be changed to sample object when data allows)  */ 
function findVals (valString, data) {
    //   alert(valString)
  var objectPath = valString.split("->");
  catchString = "data.stocks";
  for (var i=0; i<objectPath.length;i++) {
    var gets = objectPath[i].split(':');
    var objectType = gets[0]; var predicate = gets[1];
//    alert("object = "+objectType+" predicate = "+predicate);
    if(predicate != undefined)
      catchString = catchString.concat(".collect(function(d) {return nodeFromArray(d.",objectType,",\"",predicate,"\")})");
    else
      catchString = catchString.concat(".collect(function(d) {return d.",objectType,"})");
  }
//  alert(catchString);
  var myVals = eval(catchString);
//  alert(myVals.length+"\n"+myVals);
  return myVals;
}

/* make 3-dim data structure for plotting */
/* to be replaced with getDataHash_map method (i.e. separate position grid from value grid - only used foor scatter plot jittering */

function getDataHash (x, xvals, y, yvals, z, zvals) {
  var valHash = new Hash();
  valHash.set("X",xvals);
  valHash.set("Y",yvals);
  valHash.set("Z",zvals);
  
  var dataHash = data.stocks.map(function(d,i) {
      var xval = this.get("X")[i];
      var yval = this.get("Y")[i];
      var zval = this.get("Z")[i];
      return {x: xval, xpos: x(xval), 
	  y: yval, ypos: y(yval),
	  z: zval, zpos: z(zval)
	  }},valHash);
  
  dataHash.sortBy(function(d) {return Number(d.y)});
  return dataHash;
}

/* make 3-dim data structure for plotting */
/*
function getDataLinks (xvals, y, data) {
  var valHash = new Hash();
  valHash.set("X",xvals);
  valHash.set("Y",yvals);
  valHash.set("Z",zvals);
 
  //  alert(x+" "+y+" "+z); 

  var dataHash = data.experiments.map(function(d,i) {
      var xval = this.get("X")[i];
      var yval = this.get("Y")[i];
      var zval = this.get("Z")[i];
      return {x: xval, xpos: x(xval), 
	  y: yval, ypos: y(yval),
	  z: zval, zpos: z(zval),
	  }},valHash);
  
  dataHash.sortBy(function(d) {return Number(d.y)});
  return dataHash;
}
*/


/* dot plot */

function dotplot(data, w, h, xstring, ystring, zstring) {
  
  function getScale(scaleVals, sz) {
    var numreg=/(^\d+$)|(^\d+\.\d+$)/;
    if(scaleVals.uniq().any(function(d) {return (!numreg.test(d))}))
      s = pv.Scale.ordinal(scaleVals.uniq()).split(0, sz);
    else
	s = pv.Scale.linear(0, scaleVals.collect(function(d) {return Number(d)}).max()).range(0, sz).nice();
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
      vis.add(pv.Rule).data(scale.ticks())
	.strokeStyle(function(d) {return d ? "#eee" : "#000"})
	.left(scale).anchor("bottom")
	.add(pv.Label).text(scale.tickFormat);
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
      vis.add(pv.Rule).data(scale.ticks())
	.strokeStyle(function(d) {return d ? "#eee" : "#000"})
	.bottom(scale).anchor("left")
	.add(pv.Label).text(y.tickFormat);
    }  
    return vis;
  }



  /* create data */
  var xvals = findVals(xstring, data);
  var yvals = findVals(ystring, data);
  var zvals = findVals(zstring, data);

  var x = getScale(xvals, w);
  var y = getScale(yvals, h);
  var z = pv.Colors.category10(); //, s = x.range().band / 2;

  var dataMap = getDataHash(x, xvals, y, yvals, z, zvals);


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



  /* The dot plot! */
  panel = vis.add(pv.Panel)
    .data(jitter(dataMap, 10))
    ;
  
  dots = panel.add(pv.Dot)
    .bottom(function(d) {return d.ypos})
    .left(function(d) {return d.xpos})
    .strokeStyle(function(d) {return z(d.z)})
    ;
  
  return vis;   
}





/* grouped bar chart */
function groupedBarChart(data, w, h, xstring, ystring, zstring) {
  
  function getScale(scaleVals, sz) {
    var numreg=/(^\d+$)|(^\d+\.\d+$)/;
    if(scaleVals.uniq().any(function(d) {return (!numreg.test(d))}))
      s = pv.Scale.ordinal(scaleVals.uniq()).split(0, sz);
    else
      s = pv.Scale.linear(0, scaleVals.collect(function(d) {return Number(d)}).max()).range(0, sz).nice();    
    return s;
  }
  
  function setXAxis(scaleVals, scale, vis) {
    // nb - find way to check scale type from scale?
    vis.add(pv.Rule).data(scaleVals)
      .strokeStyle(function(d) {return d ? "#eee" : "#000"})
      .left(scale).anchor("bottom").add(pv.Label);
    return vis;
  }

  function setYAxis(scaleVals, scale, vis) {
/*
    var numreg=/(^\d+$)|(^\d+\.\d+$)/;
    if(scaleVals.uniq().any(function(d) {return (!numreg.test(d))})) { // ordinal axis and ticks.
      vis.add(pv.Rule).data(scaleVals.uniq())
	.strokeStyle(function(d) {return d ? "#eee" : "#000"})
	.bottom(scale).anchor("left").add(pv.Label);
    }
*/
//    else { // linear axis and ticks.
      vis.add(pv.Rule).data(scale.ticks())
	.strokeStyle(function(d) {return d ? "#eee" : "#000"})
	.bottom(scale).anchor("left")
	.add(pv.Label).text(y.tickFormat);
//    }  
    return vis;
  }



  /* create data */
  var xvals = findVals(xstring, data);
  var yvals = findVals(ystring, data);
  var zvals = findVals(zstring, data);

  var n = xvals.length;

  var x = pv.Scale.ordinal(pv.range(n)).splitBanded(0, w, 9/10);
  var y = getScale(yvals, h);
  var z = pv.Colors.category19(); //, s = x.range().band / 2;

  var dataMap = getDataHash(x, xvals, y, yvals, z, zvals);

  /* Make root panel. */
  var vis = new pv.Panel()
    .width(w)
    .height(h)
    .bottom(40)
    .left(30)
    .right(10)
    .top(5);


  setYAxis(yvals, y, vis);

  var left = 0;
  var bw = w / xvals.length;
  var uxvals = xvals.uniq().sort();

  for (var i = 0; i<uxvals.length; i++) {
    //add new panel of width (newHash.length * colwidth) 
    
    dataMapSub = dataMap.findAll(function (d) {return d.x == uxvals[i];});

    var catdiv = vis.add(pv.Panel)
	.width(dataMapSub.length * bw)
	.left(left)
	.width(bw * dataMapSub.length)
	;
    catdiv
	.anchor("bottom").add(pv.Label)
	.textMargin(25)
	.textBaseline("top")
	.text(uxvals[i])
	;
    left = left + (bw * dataMapSub.length);

    
    var bar = catdiv.add(pv.Bar)
	.data(dataMapSub)
	.left(function() {return x(this.index)})
	.width(x.range().band)
	.bottom(0)
	.height(function(d) {return y(d.y)})
	.fillStyle(function(d) {return z(d.x)})
	;
 
    bar.anchor("top").add(pv.Label)
	.textStyle("white")
	.text(function(d) {return d.y;});
    
    bar.anchor("bottom").add(pv.Label)
	.textMargin(5)
	.textStyle(function(d) {return d ? "#aaa" : "#000"})
	.textBaseline("top")
	.text(function(d) {return d.z});
 
      }
    
  return vis;   
}


function frequencyMatrix(data, w, h, xstring, ystring, zstring) {
    /* create data */
    var xvals = findVals(xstring, data);
    var yvals = findVals(ystring, data);

    var zmax = 1;

    dataHash = new Array();

    if(zstring == undefined) {
      
	var valHash = new Hash();
	valHash.set("X",xvals);
	valHash.set("Y",yvals);

	var xvalsU = xvals.uniq().sort();
	var yvalsU = yvals.uniq().sort();

	tempHash = data.experiments.map(function(d,i) {
		var xval = this.get("X")[i];
		var yval = this.get("Y")[i];
		return {X: xval, 
			Y: yval
			}},valHash);

	data.experiments.each(function(d,i) {
	    var xval = this[i].X; var xi = xvalsU.indexOf(xval);
	    var yval = this[i].Y; var yi = yvalsU.indexOf(yval);

	    var datum = dataHash.find(function(d) {return (d.sourceName == xval && d.targetName == yval)});
	    (datum != undefined)? datum.value++: 
		
		  dataHash.push({source: xi, 
			target: yi,
			sourceName: xval,
			targetName: yval,
			value: 1});

		/*		alert(dataHash.length+" \n"+
		      dataHash.find(function(d) {return (d.source == xval && d.target == yval)}).source+" "+
		      dataHash.find(function(d) {return (d.source == xval && d.target == yval)}).target+" "+
		      dataHash.find(function(d) {return (d.source == xval && d.target == yval)}).value+" "
		      );
		*/
	  }
	  ,tempHash);
	dataHash.each(function(d) {if(d.value > zmax) {zmax = d.value;}});
    }
    else {
	var zvals = findVals(zstring, data);
	zmax = zvals.max();
	var valHash = new Hash();
	valHash.set("X",xvals);
	valHash.set("Y",yvals);
	valHash.set("Z",zvals);
	dataHash = data.experiments.map(function(d,i) {
		var xval = this.get("X")[i];
		var yval = this.get("Y")[i];
		var zval = this.get("Z")[i];
		return {source: xval, 
			target: yval,
			value: zval
			}},valHash);
    }
    

    var c = pv.Scale.linear(0, zmax).range("white","red");

    var vis = new pv.Panel()
	.width(w)
	.height(h)
	.top(100)
	.left(100);

    var dir = false;

    var layout = vis.add(pv.Layout.Matrix).directed(dir)
//    var layout = vis.add(pv.Layout.Arc)
//    var layout = vis.add(pv.Layout.Force)
      .nodes(xvals.uniq().sort())
	.links(dataHash)
        .sort(function(a, b) {return b.name - a.name})
      ;
    
    layout.link.add(pv.Bar)
	.fillStyle(function(l) {return c(l.linkValue/(dir?1:2));})
	.antialias(false)
	.lineWidth(1);

    layout.label.add(pv.Label)
      //	.textStyle(color)
      ;
    return vis;
}


function getDataHash_map (xstring, ystring, zstring) {
  var valHash = new Hash();
  valHash.set("X",findVals(xstring, data));
  valHash.set("Y",findVals(ystring, data));
  valHash.set("Z",findVals(zstring, data));
  
  var dataHash = data.stocks.map(function(d,i) {
      var xval = this.get("X")[i];
      var yval = this.get("Y")[i];
      var zval = this.get("Z")[i];
      return {x: xval,  
	     y: yval, 
	     z: zval
	      /* obj: jsonobject */
	      }},valHash);
  
  dataHash.sortBy(function(d) {return Number(d.y)});
  return dataHash;
}


function geoplot(posHash, mapDiv) {


    function Canvas(mapPoints, map){
	this.mapPoints = mapPoints;
	this.map = map;

	var bounds = this.getBounds(mapPoints, 0.05);
	map.fitBounds(bounds);

	this.setMap(map);
	this.panel_ = new pv.Panel().overflow("visible");

//	this.z = pv.Colors.category10();
	return this;
    }
    
    Canvas.prototype = pv.extend(google.maps.OverlayView);
    
    Canvas.prototype.onAdd = function(){
	this.canvas = document.createElement("div");
	this.canvas.setAttribute("class", "canvas");
	this.canvas.style.position="absolute";
	
	var pane = this.getPanes().overlayMouseTarget;
	
	pane.appendChild(this.canvas);

    }
    
    Canvas.prototype.getMap = function(){
	return this.map;
    }

    Canvas.prototype.getBounds = function(pointsHash, margin) {
	var b = pv.min(pointsHash, function(d) {return d.y});
	var l = pv.min(pointsHash, function(d) {return d.x});
	var t = pv.max(pointsHash, function(d) {return d.y});
	var r = pv.max(pointsHash, function(d) {return d.x});
	var mar = 0;
	if(margin >= 0) {mar = margin;}
	var wmar = (r-l)*mar;
	var hmar = (t-b)*mar;
	
	var myBounds = new google.maps.LatLngBounds(new google.maps.LatLng(l-wmar,b-hmar),
				      new google.maps.LatLng(r+wmar,t+hmar));
	return myBounds;
    }

    Canvas.prototype.getPanel = function(){
	return this.panel_;
    }
   
    Canvas.prototype.setPanel = function(newPanel){
	this.panel_ = newPanel;
    }
   
    Canvas.prototype.draw = function(){
	
	var m = this.map;
	var c = this.canvas;
	var r = 200;
	var z = pv.Colors.category10();
	
	var projection = this.getProjection();
	
	var cSet = new ClusterSet(this, this.mapPoints);
	var clusters = cSet.getClusters();

//	for(var ci=0; ci<clusters.length && ci < 6; ci++) {
//	    alert(ci+" "+clusters[ci].markers_.length);
//	}
	

	var pixels = this.mapPoints.map(function(d) {
		var ll = new google.maps.LatLng(d.x, d.y);
		return projection.fromLatLngToDivPixel(ll);
	    });	    
	
	function x(p) {return p.x}; function y(p) {return p.y};
	
	// pv.max(pixels, y) + r;
	
	var x = { min: pv.min(pixels, x) - r, max: pv.max(pixels, x) + r };
	var y = { min: pv.min(pixels, y) - r, max: pv.max(pixels, y) + r };

	c.style.width = (x.max - x.min) + "px";
	c.style.height = (y.max - y.min) + "px";
	c.style.left = x.min + "px";
	c.style.top = y.min + "px";

	var mapPanel = new pv.Panel();

/*
	mapPanel
	.canvas(c)
	.left(-x.min)
	.top(-y.min)
	.add(pv.Panel)
	.data(this.mapPoints)	
	.add(pv.Dot)
	.left(function() {return pixels[this.parent.index].x})
	.top(function() {return pixels[this.parent.index].y})
	.strokeStyle(function(d) {return z(d.z)})
	.fillStyle(function(d) {return z(d.z).alpha(.2)})
	.size(140)
	.anchor("center").add(pv.Label)
	.textStyle("white")
	.text(function(x, d) {return d.z});
*/


	var subPanel = mapPanel
	.canvas(c)
	.left(-x.min)
	.top(-y.min)
	.add(pv.Panel)
;

//	mapPanel.strokeStyle("blue");
	for (var i=0; i< clusters.length; i++) {
	    clusters[i].addPVMark(mapPanel, z); 
	}
	
	mapPanel.root.render();
/*
alert(myData.root.children.length+"\n"+
      myData.root.children[0].children.length+"\n"+
      myData.root.children[0].children[0].children+"\n"+
      myData.root.children[0].children[1].children+"\n"

    );
*/	
	
//	return mapPanel;
	mapPanel.root.render();

    }
    //add the map
    var myOptions = {
//    zoom: 7,
//    center: new google.maps.LatLng(12.8, -8.05),
    mapTypeId: google.maps.MapTypeId.TERRAIN
    };
//    var map = new google.maps.Map(document.getElementById("fig"),
    var map = new google.maps.Map(mapDiv,
				  myOptions);
    //add the overlay canvas
    var geoverlay = new Canvas(posHash, map);


    
    return geoverlay;
    
}
    
//geoplot.prototype