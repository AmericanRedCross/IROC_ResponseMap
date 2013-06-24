var iroc_response;

var map = L.map('map',{
	center: new L.LatLng(0, 20),
	zoom: 2,
	minZoom: 2,
	attributionControl: false,
	zoomControl: false,
	layers: new L.TileLayer('http://a.tiles.mapbox.com/v3/americanredcross.map-abla31wf/{z}/{x}/{y}.png')
});

var attrib = new L.Control.Attribution({
	position: 'bottomleft'
});
attrib.addAttribution('Map Data &copy; <a href="http://redcross.org">Red Cross</a>');
map.addControl(attrib);

var year = $("#yearinput").value();

function getWorld() {
	$.ajax({
	type: 'GET',
	url: "data/worldcountries.json",
	contentType: "application/json",
	dataType: 'json',
	timeout: 10000,
	success: function(json) {
		worldcountries = json;
		getIROC();
	},
	error: function(e) {
		console.log(e);
	}
});
}

function getIROC() {
	$.ajax({
		type: 'GET',
		url: "data/iroc_response.json",
		contentType: "application/json",
		dataType: 'json',
		timeout: 10000,
		success: function(json) {
			iroc_response = json;
			parseWorld(worldcountries,iroc_response,year);

		},
		error: function(e) {
			console.log(e);
		}
	});
}

function parseWorld(world,iroc) {
	var red = [];
	var borders = [];
	var grey = [];
	var irocResponse = [];

	$.each(iroc, function(a, b) {
		var pName = b.Country.toUpperCase();
		if ($.inArray(pName, irocResponse) == -1) {
			irocResponse.push(pName);
		}
	});

	$.each(world.features, function(a, b) {
		var cName = b.properties.name.toUpperCase();
		if ($.inArray(cName, irocResponse) == -1) {
			grey.push(b);
		} else {
			red.push(b);
		}
	});

	L.geoJson(red, {
		style: {
			"color": "red",
			"weight": 1,
			"opacity": 0.65
		}
	}).addTo(map);
}

getWorld();
