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
.attr('id', function(d) {
  if (d.properties.mag<2.0) {
    return 'small'
  }
  else if (d.properties.mag>=2.0 && d.properties.mag<4.0) {
    return 'medium'
  }
  else if (d.properties.mag>=4.0 && d.properties.mag<6.0) {
    return 'large'
  }
  else {
    return 'scary'
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
.on('click', clicked);

circle
  .on('mouseover', function(d) {
    selection = d3.select(this)
                .style('cursor', 'pointer')
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
         return '7'
       }
     });
     tooltip.classed('hidden', true)
  })

function update() {

  circle.attr("transform",
  function(location) {
    return "translate("+
    map.latLngToLayerPoint(location.LatLng).x+","+
    map.latLngToLayerPoint(location.LatLng).y+")";
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

  function clicked(location) {

    var lng = location.LatLng.lng;
    var lat = location.LatLng.lat;
    map.setView([lat, lng], 9, {'animate': true, 'pan': { 'duration': 1}});
  }

  var legend = L.control({position: 'bottomleft'});

  legend.onAdd = function(map) {
    var div = L.DomUtil.create('div','info legend');
    div.innerHTML += '<b>Recent Earthquakes from the USGS [Strength in Magnitude]</strong</b><br>'
    return div;}

  legend.addTo(map);

  var footNote = '<div class="note">*click legend icon to toggle view, click earthquake to zoom in</div>'

  var smallIcon = '<iq style="background-color:#fdcc8a;"></iq><div class="magnitude" >< 2.0</div>';
  var medIcon = '<i style="background-color:#fc8d59;" ></i><div class="magnitude">2.0 - 3.9</div>';
  var largeIcon = '<i style="background-color:#e34a33;"></i><div class="magnitude">4.0 - 5.9</div>';
  var scaryIcon = '<is style="background-color:#b30000;"></is><div class="magnitude">>= 6.0</div>';

  d3.select(".legend")
    .append('text')
    .attr('class','icon')
    .on('mouseover', function(d) {
      d3.select(this).style('cursor','pointer');
    })
    .on('click', function() {
      var active = small.active ? false : true,
      newOpacity = active ? 0 : 0.95;
      d3.selectAll('#small').attr('opacity', newOpacity);
      small.active = active;
    })
    .html(smallIcon);

d3.select(".legend")
    .append('text')
    .attr('class','icon')
    .on('mouseover', function(d) {
      d3.select(this).style('cursor','pointer');
    })
    .on('click', function() {
      var active = medium.active ? false : true,
      newOpacity = active ? 0 : 0.95;
      d3.selectAll('#medium').attr('opacity', newOpacity);
      medium.active = active;
    })
    .html(medIcon);

d3.select(".legend")
    .append('text')
    .attr('class','icon')
    .on('mouseover', function(d) {
      d3.select(this).style('cursor','pointer');
    })
    .on('click', function() {
      var active = large.active ? false : true,
      newOpacity = active ? 0 : 0.95;
      d3.selectAll('#large').attr('opacity', newOpacity);
      large.active = active;
    })
    .html(largeIcon);

d3.select(".legend")
    .append('text')
    .attr('class','icon')
    .on('mouseover', function(d) {
      d3.select(this).style('cursor','pointer');
    })
    .on('click', function() {
      var active = scary.active ? false : true,
      newOpacity = active ? 0 : 0.95;
      d3.selectAll('#scary').attr('opacity', newOpacity);
      scary.active = active;
    })
    .html(scaryIcon);

d3.select(".legend")
  .append('text')
  .html(footNote)

}

getEarthquakeData();
