var worldcountries;
var displayed;
var notdisplayed;
var redLayer;
var greyLayer;
var center = new L.LatLng(30, 60);

var money = 0;
var people = 0;
var supplies = 0;

Number.prototype.formatNumber = function(c, d, t){
var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };


var map = L.map('map',{
	center: center,
	zoom: 2,
	minZoom: 2,
	attributionControl: false,
	zoomControl: false,
	// dragging: false
});

var attrib = new L.Control.Attribution({
	position: 'bottomleft'
});
attrib.addAttribution('Map Data &copy; <a href="http://redcross.org">Red Cross</a>');
map.addControl(attrib);

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
			parseWorld(worldcountries,iroc_response,'1999');
			buildStuff('1999');

		},
		error: function(e) {
			console.log(e);
		}
	});
}

function parseWorld(world,iroc,year) {
	var red = [];
	var borders = [];
	var grey = [];
	displayed = [];
	notdisplayed = [];

	var redStyle = {
		color: "#fff",
		weight: 1,
		fillColor: "red",
		fillOpacity: 0.7
	}
	var greyStyle = {
		color: "#fff",
		weight: 1,
		fillColor: "grey",
	}

	var highlightStyle = {
		fillColor: "red",
		fillOpacity: 0.5		    
	};

	if (year) {
		year = (new Date(year).getFullYear() + 1);
	} else {
		year = new Date().getFullYear();
	}

		$.each(iroc, function(a, b) {
			var pName = b.Country.toUpperCase();
			var pYear = new Date(b.Date).getFullYear();
			if (pYear == year) {
				if ($.inArray(pName, displayed) == -1) {
					displayed.push(pName);
				}
			}
		});

		$.each(world.features, function(a, b) {
			var cName = b.properties.name.toUpperCase();
			if ($.inArray(cName, displayed) == -1) {
				grey.push(b);
			} else {
				red.push(b);
			}
		});

		var highlight = function(feature, layer) {
			(function(layer, properties) {

				layer.on("mouseover", function (e){
					layer.setStyle(highlightStyle);
				});				
				
				var popupContent = "<p class='countryListHeader'>" + properties.name + "</p>";
				// $.each(arcPrograms, function(ai, program) {
				// 	var pName = program.COUNTRY.toUpperCase();
				// 	var selectedCountry = properties.NAME.toUpperCase();
				// 	if (pName == selectedCountry) {
				// 		popupContent += "<li class='programListItem'><img class='imageBullet' src=" + program.SECTOR_PRIMARY.substring(0,2) + ".png>" + program.PROJECT_NAME + "</li>"					
				// 	}					
				// });
				// popupContent += "</ul>"	
				layer.bindPopup(popupContent);

				layer.on("mouseout", function (e){
					layer.setStyle(redStyle);
				});

			})(layer, feature.properties);
		};

	redLayer = L.geoJson(red, {
		style: redStyle,
		onEachFeature: highlight
	});

	redLayer.addTo(map);

	greyLayer = L.geoJson(grey, {
		style: greyStyle
	});

	greyLayer.addTo(map);
}

function buildStuff(year) {
	money = 0;
	people = 0;
	supplies = 0;
	var disasters = [];
	$.each(iroc_response, function(a,b) {
		var pYear = new Date(b.Date).getFullYear();
		if (pYear == year) {

			if (b.Money == '') {
				b.Money = 0;
			}
			if (b.PeopleDeployed == '') {
				b.PeopleDeployed = 0;
			}
			if (b.TotalSupplies == '') {
				b.TotalSupplies = 0;
			}
			var pMoney = parseInt(b.Money);
			var pPeople = parseInt(b.PeopleDeployed);
			var pSupplies = parseInt(b.TotalSupplies);

			money = money + pMoney;
			people = people + pPeople;
			supplies = supplies + pSupplies;

			disasters.push(b);
		}
	});

	moneyFormated = money.formatNumber(0, '.', ',');
	moneyPeople = people.formatNumber(0, '.', ',');
	moneySupplies = supplies.formatNumber(0, '.', ',');

	$('#moneyTotal').html('$' + moneyFormated);
	$('#peopleTotal').html(moneyPeople);
	$('#suppliesTotal').html(moneySupplies);

	var moneyCount = Math.floor(money/10000000);
	if (moneyCount<1) {
		moneyCount = 1;
	}
	$("#moneyStack").empty();
	var moneyStacks = Math.floor(moneyCount/10);
	var moneyRemain = Math.round(moneyCount % 10);
	if (moneyStacks > 1) {
		for (i=0;i<moneyStacks;i++) {
			$("#moneyStack").append('<img src="images/moneybag.png" alt="moneybag" name="$10 million" class="iconStack moneybag" />');
		}
		for (i=0;i<moneyRemain;i++) {
			$("#moneyStack").append('<img src="images/money.png" alt="moneybag" name="$1 million" class="iconStack money" />');
		}
	} else {
		for (i=0;i<moneyCount;i++) {
			$("#moneyStack").append('<img src="images/money.png" alt="moneybag" name="$1 million"  class="iconStack money" />');
		}
	}

	$("#peopleStack").empty();
	var peopleStacks = Math.floor(people/10);
	var peopleRemain = Math.round(people % 10);
	if (peopleStacks > 1) {
		for (i=0;i<peopleStacks;i++) {
			$("#peopleStack").append('<img src="images/people.png" alt="people" name="10" class="iconStack people" />');
		}
		for (i=0;i<peopleRemain;i++) {
			$("#peopleStack").append('<img src="images/male.png" alt="person" name="1" class="iconStack person" />');
		}
	} else {
		for (i=0;i<people;i++) {
			$("#peopleStack").append('<img src="images/male.png" alt="person" name="1" class="iconStack person" />');
		}
	}

	var suppliesCount = Math.floor(supplies/10000);
	if (suppliesCount<1) {
		suppliesCount = 1;
	}
	$("#suppliesStack").empty();
	var suppliesStacks = Math.floor(suppliesCount/10);
	var suppliesRemain = Math.round(suppliesCount % 10);
	if (peopleStacks > 1) {
		for (i=0;i<suppliesStacks;i++) {
			$("#suppliesStack").append('<img src="images/mattress.png" alt="supplies" name="100000" class="iconStack mattress" />');
		}
		for (i=0;i<suppliesRemain;i++) {
			$("#suppliesStack").append('<img src="images/supplies.png" alt="supplies" name="10000" class="iconStack supplies" />');
		}
	} else {
		for (i=0;i<suppliesCount;i++) {
			$("#suppliesStack").append('<img src="images/supplies.png" alt="moneybag" name="10000" class="iconStack supplies" />');
		}
	}

	$('#disastersStack').empty();
	$('#disastersTotal').empty();
	$('#disastersTotal').html(disasters.length);
	$.each(disasters, function(a,b){
		var dType = b.DisasterType.toLowerCase().replace(/\s+/g, '');
		$('#disastersStack').append('<a title="'+ b.DisasterName +'"><img src="images/'+ dType + '.png" alt="'+ dType +'" class="disaster" /></a>')
	});
}

function annotate(year) {
	switch (year) {
		case "1999":
			$("#majorEvent").html('Turkey Earthquake');
		break;
		case "2000":
			//$("#majorEvent").html('Cambodian Floods');
			$("#majorEvent").html('');
		break;
		case "2001":
			$("#majorEvent").html('Indian Earthquake');
		break;
		case "2002":
			$("#majorEvent").html('');
		break;
		case "2003":
			$("#majorEvent").html('');
		break;
		case "2004":
			$("#majorEvent").html('Asian Tsunami');
		break;
		case "2005":
			$("#majorEvent").html('Pakistan Earthquake');
		break;
		case "2006":
			$("#majorEvent").html('');
		break;
		case "2007":
			$("#majorEvent").html('');
		break;
		case "2008":
			$("#majorEvent").html('China Sichuan Earthquake');
		break;
		case "2009":
			$("#majorEvent").html('');
		break;
		case "2010":
			$("#majorEvent").html('Haiti Earthquake <br />Pakistan Floods');
		break;
		case "2011":
			$("#majorEvent").html('Japan Earthquake & Tsunami');
		break;
		case "2012":
			$("#majorEvent").html('');
		break;
		case "2013":
			$("#majorEvent").html('');
		break;
	}
}

//fire function to for initial page load
getWorld();

//slider control
$('#slider').change(function(){
	var selectedYear = this.value;
	$('#controls').css({'background-image': 'url(images/'+selectedYear+'.png)',
		'background-repeat': 'no-repeat'});
	map.removeLayer(redLayer);
	map.removeLayer(greyLayer);
	parseWorld(worldcountries,iroc_response,selectedYear);
	buildStuff(selectedYear);
	annotate(selectedYear);
});

$('#slider').change();
