var map = L.map('mapid').setView([10.0, 15.0], 2);

map.options.minZoom = 2;

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2FidW1hZm9vIiwiYSI6ImNqMWE3cnlqcTA5dncyd216YjI0bnY4dGEifQ.fgmXgmkvialdBd3D405_BA', {
attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
id: 'mapbox.streets',
accessToken: 'pk.eyJ1Ijoic2FidW1hZm9vIiwiYSI6ImNqMWE3cnlqcTA5dncyd216YjI0bnY4dGEifQ.fgmXgmkvialdBd3D405_BA'
}).addTo(map);

L.svg().addTo(map);

var svg = d3.select(map.getPanes().overlayPane).append('svg');

var g = svg.append('g').attr('class', 'leaflet-zoom-hide');

var tooltip = d3.select('#tooltip');

const URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&limit=20000'

function getEarthquakeData() {
  fetch(URL)
  .then((results) => {
return results.json();
  })
  .then((result) => {

function projectPoint(x,y) {
  var point = map.latLngToLayerPoint(new L.LatLng(y,x));
  this.stream.point(point.x, point.y);
}


var transform = d3.geoTransform({point: projectPoint});
var path = d3.geoPath().projection(transform);

result.features.forEach(function(d) {
  d.LatLng = new L.LatLng(d.geometry.coordinates[1],
    d.geometry.coordinates[0])
  });

var circle = g.selectAll('circle')
.data(result.features)
.enter().append('circle')
.attr('fill', function(d) {
  if (d.properties.mag<2.0) {
    return '#fdcc8a'
  }
  else if (d.properties.mag>=2.0 && d.properties.mag<4.0) {
    return '#fc8d59'
  }
  else if (d.properties.mag>=4.0 && d.properties.mag<6.0) {
    return '#e34a33'
  }
  else {
    return '#b30000'
  }
})
.attr('r', function(d) {
  if (d.properties.mag<6.0) {
    return '4'
  }
  else {
    return '6'
  }
})
.attr('opacity', 0.85);

circle
  .on('mouseover', function(d) {
    selection = d3.select(this)
                .attr('r', 15);

    tooltip
        d3.select('#longitude')
        .text("Longitude: "+d.geometry.coordinates[0])
        d3.select('#latitude')
        .text("Latitude: "+d.geometry.coordinates[1])
        d3.select('#magnitude')
        .text("Magnitude: "+d.properties.mag)
        d3.select('#location')
        .text("Location: "+d.properties.place)
        d3.select('#time')
        .text("Time: "+new Date(d.properties.time));

    tooltip
      .classed('hidden', false);

    tooltip_position((d3.event.pageX+15)+'px', (d3.event.pageY - 100)+'px')
  });

circle
  .on('mouseout', function(){
    d3.select(this)
    .attr('fill', function(d) {
      if (d.properties.mag<2.0) {
        return '#fdcc8a'
      }
      else if (d.properties.mag>=2.0 && d.properties.mag<4.0) {
        return '#fc8d59'
      }
      else if (d.properties.mag>=4.0 && d.properties.mag<6.0) {
        return '#e34a33'
      }
      else {
        return '#b30000'
      }
    })
     .attr('r', function(d) {
       if (d.properties.mag<6.0) {
         return '4'
       }
       else {
         return '6'
       }
     });
     tooltip.classed('hidden', true)
  })

function update() {

  circle.attr("transform",
  function(d) {
    return "translate("+
    map.latLngToLayerPoint(d.LatLng).x+","+
    map.latLngToLayerPoint(d.LatLng).y+")";
  });

  var bounds = path.bounds(result),
  topLeft = bounds[0],
  bottomRight = bounds[1];

  svg.attr("width", bottomRight[0] - topLeft[0])
    .attr("height", bottomRight[1] - topLeft[1])
    .style("left", topLeft[0] + "px")
    .style("top", topLeft[1] + "px");

  g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

  }

  map.on('moveend', update);
  update();

  })

  function tooltip_position(left, top) {
    tooltip
      .style('left', left)
      .style('top', top);
  }

  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function(map) { var div = L.DomUtil.create('div','info legend'); return div;}

  legend.addTo(map);

  var legendText = '<strong>Recent Earthquakes<br>from the USGS <br>[Strength in Magnitude]</strong><br><i style="background-color:#fdcc8a;"></i>< 2.0<br><i style="background-color:#fc8d59;"></i>2.0 - 3.9<br><i style="background-color:#e34a33;"></i>4.0 - 5.9<br><is style="background-color:#b30000;"></is>>=6.0<br>';

  d3.select(".legend.leaflet-control")
    .html(legendText);

}

getEarthquakeData();
