/**
 *   Copyright (c) 2011 Seth Redmond (seth.redmond@imperial.ac.uk)
 *   Licensed under the GNU Lesser GPL License
 */


/**
 * A cluster that contains markers.
 *
 * @param {geoplot} the geoplot that this
 *     cluster will be placed on.
 * @constructor
 */
function Cluster(geoplot) {
  this.geoplot_ = geoplot;
  this.map_ = geoplot.getMap();
  this.markerSize_;
  this.center_ = null;
  this.markers_ = [];
  this.bounds_ = null;
  this.projection_ = geoplot.getProjection();;
}

/**
 * add protovis visualisation for this cluster - dependent on size and composition
 * defaults to pie chart
 * @param {panel, z} pv.Panel to which will be added + z-scale for colouring.
 * @return {pv.Mark} the mark class
 */
Cluster.prototype.addPVMark = function(panel, z) {
    var mark;
    var c = this;
    var markers = this.getMarkers();
    var comp = this.getComposition();
    var dotSize = this.markerSize_;

    if(this.getPxSize() < 20) {
	var bgMark = panel.add(pv.Dot)
	    .left(this.getPxX())
	    .top(this.getPxY())
	    .strokeStyle(pv.color("#aaa").alpha(0.4))
	    .fillStyle(pv.color("#aaa").alpha(0.5))
	    .radius(10)
	    .cursor("pointer").event("click", function() {c.popUp()})
    ;

    }

    if(comp.length == 1) {
	mark = panel.add(pv.Dot);

	mark.left(this.getPxX())
	.top(this.getPxY())
	.strokeStyle(z(comp[0].z))
	.fillStyle(z(comp[0].z).alpha(0.8))
	.radius(this.getPxSize()/2)
	.cursor("pointer").event("click", function() {c.popUp()})
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
	.fillStyle(function(d) {return z(d.z).alpha(0.8)})
	.strokeStyle("gray")
	.outerRadius(this.getPxSize()/2)
	.anchor("center").add(pv.Label).textAngle(0)
	.textStyle("white").cursor("pointer")
	.text(function(d) {return d.points.length /*+" "+d.z*/});

    }

    mark.
    cursor("pointer").
    event("click", function() {c.popUp()})
    ;
    

    var sqrt = Math.ceil(Math.sqrt(c.getSize()));
//    console.log(sqrt+" x "+dotSize);

    //add popup panel
    this.popup_ = panel
    .add(pv.Panel);
    this.popup_.left(this.getPxX())
    .top(this.getPxY())
    .width((sqrt+1)*dotSize*3)
    .height((sqrt+1)*dotSize*3)
    .fillStyle(pv.color("#fff").alpha(0.5))
    .strokeStyle("grey")
    .add(pv.Dot)
    .data(markers)
    .radius(dotSize)
    .left(function(d) {return ((this.index % sqrt)+1) * dotSize * 3 })
    .top(function(d) {return Math.floor(((this.index) / sqrt) + 1) * dotSize * 3})
    .fillStyle(function(d) {return z(d.z)})
    .strokeStyle(function(d) {return z(d.z)})
    .cursor("pointer")
    .event("mouseover", function(d) {self.status = "sample  "+d.o.id;})
    .event("mouseout", function() {self.status = "";})
    .event("click", function(d) {self.location = "http://funcgen.vectorbase.org/popgenDev/sample/?id="+d.o.id})
//    event("click",function(d) {console.log("clicked "+Object.toJSON(d.o.id));})
    ; 

   this.popup_
    .def("active", false)
    .visible(function() {return this.active()})
    ;

    return mark;
}

/**
 * spawn popup menu for cluster.
 */
Cluster.prototype.popUp = function() {
    this.geoplot_.closePops();
    this.popup_.active(true).render();
}
/**
 * close popup menu for cluster
 */
Cluster.prototype.popDown = function() {
    this.popup_.active(false).render();
}


/**
 * Determins if a marker is already added to the cluster.
 *
 * @param {dataObject} marker The marker to check.
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
 * @param {dataMarker} marker The marker to add.
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
 * Returns the geoplot that the cluster is associated with.
 *
 * @return {geoplot} The associated marker clusterer.
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
 * @return {array of objects {z: [distinct] z-value; obj: data objects}}'
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
 * Returns all markers.
 *
 * @return {[]} array of data objects.
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
//    console.log(this.markers_.length+" "+Math.sqrt((this.markers_.length / Math.PI)));
    var area = Math.sqrt((this.markers_.length / Math.PI));
    var sizeFactor = this.markerSize_ / (Math.sqrt(1/Math.PI));
//    console.log(this.markers_.length+": "+area+" x "+sizeFactor+" = "+(area*sizeFactor));
    return area * sizeFactor * 2;
    //return this.markers_.length * this.sizeFactor_;

}

Cluster.prototype.getSize = function() {
      return this.markers_.length;
}

Cluster.prototype.setMarkerSize = function(size) {
      this.markerSize_ = size;
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
  this.markerSize_ = 5;

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

  clustersAdded = 0;
  for(var i=0; i< this.clusters_.length; i++) {
	var cluster = this.clusters_[i];
	if(cluster.isPosInClusterBounds(pos)) {
	    cluster.addMarker(marker);
	    clustersAdded++;
	    break;
	}
  }
  if(clustersAdded < 1) {
      var cluster = new Cluster(this.geoplot_);
      cluster.setMarkerSize(this.markerSize_)
      cluster.addMarker(marker);
      this.clusters_.push(cluster);
  }
}
/**
 * passes values through to actual graph calls, based on text 
 * description in DB. Nothing else. (to prevent CSS attacks)
 * @params type - the graph type to call 
 *         dataHash - data hash to call
 *         div - div to put it in
 *         args - additional args for function (optional)
 */
function callPlot(type, dataHash, div, args) {
    var functions = {
	"map":"geoplot",
	"geoplot":"geoplot",
	"dot":"dotplot",
	"bar":"groupedBarChart",
	"groupbar":"groupedBarChart",
	"matrix":"frequencyMatrix"
    };
    eval(functions[type]+"(dataHash, div, args)");

}

/**
 * the core method... traverse json structure to retrieve array of hashes
 * each hash has 4 vals: x/y/z vals and 'o' the json object we iterate over
 * @params json - the json object to be parsed 
 *         est - jsonPath String to the entity we iterate over
 *         x/y/zst - jsonpath String to the x/y/z val
 */
function getDataHash_jsp (json, est, xst, yst, zst) {

  function getVal (json, est, pst, vst) {
      var estHash = est.split('.');
      var pstHash = pst.split('[');
      for (var i = estHash.length; i> 1; i--) {
	  var esst = estHash.slice(0,i).join(".");
//	  console.log(esst+" "+vst.indexOf(esst));
	  if(vst.indexOf(esst) >= 0) {
	      var psst = pstHash.slice(0,i).join("[");
	      
	      var vpth = vst.replace(esst,psst);
	      var vobj = jsonPath(json,vpth);
//	      console.log(vpth+"\t"+vobj);
	      if(vobj.length==1) {return vobj[0];}
	      else {return vobj};
	  }
      }
      return undefined;
  }

  var paths = jsonPath(json, est,{resultType:"PATH"});

  var dataHash = paths.map(function(d,i) {
      var retHash =  {x: getVal(json, est, d,xst),  
		      y: getVal(json, est, d,yst), 
		      z: getVal(json, est, d,zst),
		      o: getVal(json, est, d,est)
      };
      return retHash;});
  
  dataHash.sortBy(function(d) {return Number(d.y)});
  return dataHash;
}



/* traverse (any) json object to find nodes of a particular type */
function nodeFromArray(objects, catchString) {
    for (var i = 0; i < objects.length; i++) {
	if (eval('objects[i].'+catchString)) { return objects[i];}
    }
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

/*
function getDataHash_jsp (json, est, xst, yst, zst) {

  function getVal (json, est, ost, vst) {
      var estHash = est.split('.');
      var ostHash = ost.split('[');
      for (var i = estHash.length; i> 1; i--) {
	  var esst = estHash.slice(0,i).join(".");
//	  console.log(esst+" "+vst.indexOf(esst));
	  if(vst.indexOf(esst) >= 0) {
	      var osst = ostHash.slice(0,i).join("[");
	      
	      var vpth = vst.replace(esst,osst);
	      var vobj = jsonPath(json,vpth);
//	      console.log(vpth+"\t"+vobj);
	      if(vobj.length==1) {return vobj[0];}
	      else {return vobj};
	  }
      }
      return undefined;
  }

  var paths = jsonPath(json, est,{resultType:"PATH"});
  console.log(est+" "+paths.length);

  var dataHash = paths.map(function(d,i) {
      var retHash =  {x: getVal(json, est, d,xst),  
		      y: getVal(json, est, d,yst), 
		      z: getVal(json, est, d,zst),
		      o: getVal(json, est, d,est)
      };
      return retHash;});
  
  dataHash.sortBy(function(d) {return Number(d.y)});
  return dataHash;
}
*/
/*
function getDataHash_map (data,xstring, ystring, zstring) {
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
	      }},valHash);
  
  dataHash.sortBy(function(d) {return Number(d.y)});
  return dataHash;
}
*/

function geoplot(posHash, mapDiv) {


    function Canvas(mapPoints, map){
	this.mapPoints = mapPoints;
	this.map = map;

	var bounds = this.getBounds(mapPoints, 0.05);
	map.fitBounds(bounds);
//	google.maps.event.addListener(map, 'click', this.closePops());
	this.setMap(map);
	this.panel_ = new pv.Panel().overflow("visible");
	this.clusters_ = [];
	this.z = pv.Colors.category10();
	return this;
    }
    
    Canvas.prototype = pv.extend(google.maps.OverlayView);
    
    Canvas.prototype.onAdd = function(){
	this.canvas = document.createElement("div");
	this.canvas.setAttribute("class", "canvas");
	this.canvas.style.position="absolute";
	var c = this;
	google.maps.event.addListener(this.getMap(), 'click', function(){c.closePops()});
	
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
	var z = this.z;
	
	var projection = this.getProjection();
	
	var cSet = new ClusterSet(this, this.mapPoints);
	this.clusters_ = cSet.getClusters();

	var pixels = this.mapPoints.map(function(d) {
		var ll = new google.maps.LatLng(d.x, d.y);
		return projection.fromLatLngToDivPixel(ll);
	    });	    
	
	function x(p) {return p.x}; function y(p) {return p.y};
	
	var x = { min: pv.min(pixels, x) - r, max: pv.max(pixels, x) + r };
	var y = { min: pv.min(pixels, y) - r, max: pv.max(pixels, y) + r };

	c.style.width = (x.max - x.min) + "px";
	c.style.height = (y.max - y.min) + "px";
	c.style.left = x.min + "px";
	c.style.top = y.min + "px";

	var mapPanel = new pv.Panel();

	var subPanel = mapPanel
	.canvas(c)
	.left(-x.min)
	.top(-y.min)
	.add(pv.Panel)
	;
	for (var i=0; i< this.clusters_.length; i++) {
	    this.clusters_[i].addPVMark(mapPanel, z); 
	}
	
	mapPanel.root.render();
    }

    Canvas.prototype.closePops = function() {
// console.log(this.clusters_);
	if(this.clusters_) {
	    for (var i=0; i< this.clusters_.length; i++) {
		this.clusters_[i].popDown(); 
	    }
	}
    }

    //add the map
    var myOptions = {
    mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    var map = new google.maps.Map(mapDiv,
				  myOptions);
    //add the overlay canvas
    var geoverlay = new Canvas(posHash, map);


    
    return geoverlay;
    
}
    /**
 * cartesian matrix with block intensities controlled by z val
 * @param dataHash / div
 */
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


/**
 * A dotplot, able to be jittered & split by cats.
 *
 * @param dataHash / div
 */
function dotplot(data, div, args) {
//    var w = 500; var h=400;
    var w = div.style.width.replace("px","") || 500;
    var h = div.style.height.replace("px","") || 500;

/*
    function getScale(scaleVals, sz) {
	var numreg=/(^\d+$)|(^\d+\.\d+$)/;
	if(scaleVals.uniq().any(function(d) {return (!numreg.test(d))}))
	    s = pv.Scale.ordinal(scaleVals.uniq()).split(0, sz);
	else
	    s = pv.Scale.linear(0, scaleVals.collect(function(d) {return Number(d)}).max()).range(0, sz).nice();
	return s;
    }
*/    
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
/*
  var xvals = findVals(xstring, data);
  var yvals = findVals(ystring, data);
  var zvals = findVals(zstring, data);

  var x = getScale(xvals, w);
  var y = getScale(yvals, h);
  var z = pv.Colors.category10(); //, s = x.range().band / 2;

  var dataMap = getDataHash(x, xvals, y, yvals, z, zvals);

*/
  var xvals = data.collect(function(d) {return d.x});
  var yvals = data.collect(function(d) {return d.y});
  var zvals = data.collect(function(d) {return d.z});
  var xType; var yType;
  if(args) { xType = args.xscale; yType = args.yscale;}
  var x = getScale(xvals, w, xType);
  var y = getScale(yvals, h, yType);
  var z = pv.Colors.category10(); //, s = x.range().band / 2;
  data = addPosnsToHash(data,x,y);


  /* Make root panel. */
  var vis = new pv.Panel().canvas(div.id)
    .width(w)
    .height(h)
    .bottom(30)
    .left(30)
    .right(10)
    .top(5);

  setXAxis(xvals, x, vis);
  setYAxis(yvals, y, vis);

  
  if(args && args.jitter=="true") {
      data = jitter(data, 10);
  }

  /* The dot plot! */
  panel = vis.add(pv.Panel)
    .data(data)
    ;
  
  dots = panel.add(pv.Dot)
    .bottom(function(d) {return d.ypos})
    .left(function(d) {return d.xpos})
    .strokeStyle(function(d) {return z(d.z)})
    ;
  vis.render();
  return vis;   
}

/**
 * add xy posns to hash (for jittering, or similar)
 *
 * @param dataHash / x,y scales
 */

function addPosnsToHash(data, x,y) {
  
  var dataHash = data.map(function(d,i) {
      return {x: this[i].x, xpos: x(this[i].x), 
	  y: this[i].y, ypos: y(this[i].y),
	      z: this[i].z,
	  o: this[i].o}},data);

//  console.log(Object.toJSON(dataHash[0]));
  return dataHash;
}

/**
 * jitter function for dotplot
 *
 * @param dataHash / div
 */

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


/**
 * grouped bar chart
 *
 * @param dataHash / div
 */
function groupedBarChart(data, div,args) {
    var w = div.style.width.replace("px","") || 500;
    var h = div.style.height.replace("px","") || 500;
//    var args = args.evalJSON();

//    console.log(Object.toJSON(args));

/*
  function guessScale(scaleVals, sz) {
    var numreg=/(^\d+$)|(^\d+\.\d+$)/;
    if(scaleVals.uniq().any(function(d) {return (!numreg.test(d))}))
      s = pv.Scale.ordinal(scaleVals.uniq()).split(0, sz);
    else
      s = pv.Scale.linear(0, scaleVals.collect(function(d) {return Number(d)}).max()).range(0, sz).nice();    
    return s;
  }
*/  


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
/*  var xvals = findVals(xstring, data);
  var yvals = findVals(ystring, data);
  var zvals = findVals(zstring, data);

  var n = xvals.length;

  var x = pv.Scale.ordinal(pv.range(n)).splitBanded(0, w, 9/10);
  var y = getScale(yvals, h);
  var z = pv.Colors.category19(); //, s = x.range().band / 2;

  var dataMap = getDataHash(x, xvals, y, yvals, z, zvals);
*/

  var xvals = data.collect(function(d) {return d.x});
  var yvals = data.collect(function(d) {return d.y});
  var zvals = data.collect(function(d) {return d.z});
  var n = xvals.length;
 
  var xType; var yType="linear";

 if(args) { xType = args.xscale; yType = args.yscale || yType;}
  var x = pv.Scale.ordinal(pv.range(n)).splitBanded(0, w, 9/10);
  var y = getScale(yvals, h, yType);
  var z = pv.Colors.category10(); //, s = x.range().band / 2;


  /* Make root panel. */
  var vis = new pv.Panel().canvas(div.id)
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
    
    dataMapSub = data.findAll(function (d) {return d.x == uxvals[i];});

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
  vis.render();  
  return vis;   
}

function getScale(scaleVals, sz, type) {
    var s;
    var min = scaleVals.collect(function(d) {return Number(d)}).min();
    if(min > 0) {min=0;}
    var max = scaleVals.collect(function(d) {return Number(d)}).max();
    if(max <=0) {max = 0;}

    if(type=="ordinal") {
	s = pv.Scale.ordinal(scaleVals.uniq()).split(0, sz);}
    else if (type=="linear") {
	s = pv.Scale.linear(min, max).range(0, sz).nice();}
    else if (type=="log" || type=="logarythmic") {
	s = pv.Scale.log(min, max).range(0, sz).nice();}
    else {
	s = guessScale(scaleVals,sz);
    }
    return s;
}


/**
 * if no scale is given, guess based on presence / absence of numbers
 */
function guessScale(scaleVals, sz) {
    var numreg=/(^\d+$)|(^\d+\.\d+$)/;
    var min = scaleVals.collect(function(d) {return Number(d)}).min();
    if(min > 0) {min=0;}
    var max = scaleVals.collect(function(d) {return Number(d)}).max();
    if(max <=0) {max = 0;}

    if(scaleVals.uniq().any(function(d) {return (!numreg.test(d))}))
	s = pv.Scale.ordinal(scaleVals.uniq()).split(0, sz);
    else
	s = pv.Scale.linear(min, max).range(0, sz).nice();    
    return s;
}



/**
 *   
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Lesser General Public License as 
 *   published by the Free Software Foundation, either version 3 of the 
 *   License, or (at your option) any later version.
 *   
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Lesser General Public License for more details.
 *   
 *   You should have received a copy of the GNU Lesser General Public 
 *   License along with this program.  If not, see 
 *   <http://www.gnu.org/licenses/>.
 *   
 */
/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */
function jsonPath(obj, expr, arg) {
   var P = {
      resultType: arg && arg.resultType || "VALUE",
      result: [],
      normalize: function(expr) {
         var subx = [];
         return expr.replace(/[\['](\??\(.*?\))[\]']/g, function($0,$1){return "[#"+(subx.push($1)-1)+"]";})
                    .replace(/'?\.'?|\['?/g, ";")
                    .replace(/;;;|;;/g, ";..;")
                    .replace(/;$|'?\]|'$/g, "")
                    .replace(/#([0-9]+)/g, function($0,$1){return subx[$1];});
      },
      asPath: function(path) {
         var x = path.split(";"), p = "$";
         for (var i=1,n=x.length; i<n; i++)
            p += /^[0-9*]+$/.test(x[i]) ? ("["+x[i]+"]") : ("['"+x[i]+"']");
         return p;
      },
      store: function(p, v) {
         if (p) P.result[P.result.length] = P.resultType == "PATH" ? P.asPath(p) : v;
         return !!p;
      },
      trace: function(expr, val, path) {
         if (expr) {
            var x = expr.split(";"), loc = x.shift();
            x = x.join(";");
            if (val && val.hasOwnProperty(loc))
               P.trace(x, val[loc], path + ";" + loc);
            else if (loc === "*")
               P.walk(loc, x, val, path, function(m,l,x,v,p) { P.trace(m+";"+x,v,p); });
            else if (loc === "..") {
               P.trace(x, val, path);
               P.walk(loc, x, val, path, function(m,l,x,v,p) { typeof v[m] === "object" && P.trace("..;"+x,v[m],p+";"+m); });
            }
            else if (/,/.test(loc)) { // [name1,name2,...]
               for (var s=loc.split(/'?,'?/),i=0,n=s.length; i<n; i++)
                  P.trace(s[i]+";"+x, val, path);
            }
            else if (/^\(.*?\)$/.test(loc)) // [(expr)]
               P.trace(P.eval(loc, val, path.substr(path.lastIndexOf(";")+1))+";"+x, val, path);
            else if (/^\?\(.*?\)$/.test(loc)) // [?(expr)]
               P.walk(loc, x, val, path, function(m,l,x,v,p) { if (P.eval(l.replace(/^\?\((.*?)\)$/,"$1"),v[m],m)) P.trace(m+";"+x,v,p); });
            else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) // [start:end:step]  phyton slice syntax
               P.slice(loc, x, val, path);
         }
         else
            P.store(path, val);
      },
      walk: function(loc, expr, val, path, f) {
         if (val instanceof Array) {
            for (var i=0,n=val.length; i<n; i++)
               if (i in val)
                  f(i,loc,expr,val,path);
         }
         else if (typeof val === "object") {
            for (var m in val)
               if (val.hasOwnProperty(m))
                  f(m,loc,expr,val,path);
         }
      },
      slice: function(loc, expr, val, path) {
         if (val instanceof Array) {
            var len=val.length, start=0, end=len, step=1;
            loc.replace(/^(-?[0-9]*):(-?[0-9]*):?(-?[0-9]*)$/g, function($0,$1,$2,$3){start=parseInt($1||start);end=parseInt($2||end);step=parseInt($3||step);});
            start = (start < 0) ? Math.max(0,start+len) : Math.min(len,start);
            end   = (end < 0)   ? Math.max(0,end+len)   : Math.min(len,end);
            for (var i=start; i<end; i+=step)
               P.trace(i+";"+expr, val, path);
         }
      },
      eval: function(x, _v, _vname) {
         try { return $ && _v && eval(x.replace(/@/g, "_v")); }
         catch(e) { throw new SyntaxError("jsonPath: " + e.message + ": " + x.replace(/@/g, "_v").replace(/\^/g, "_a")); }
      }
   };

   var $ = obj;
   if (expr && obj && (P.resultType == "VALUE" || P.resultType == "PATH")) {
      P.trace(P.normalize(expr).replace(/^\$;/,""), obj, "$");
      return P.result.length ? P.result : false;
   }
} 
