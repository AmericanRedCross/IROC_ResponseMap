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
				$("#majorEvent").empty();
				buildStuff(year,properties.name);
			});				
			layer.on("mouseout", function (e){
				layer.setStyle(redStyle);
				buildStuff(year);
				$("#majorEvent").empty();
				annotate(year);
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

	function buildStuff(year,dName) {
		money = 0;
		people = 0;
		supplies = 0;
		var disasters = [];
		$.each(iroc_response, function(a,b) {
			var pYear = new Date(b.Date).getFullYear();
			if (dName) {
				if ((pYear == year) && (dName == b.Country)) {

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
					var dType = b.DisasterType.toLowerCase().replace(/\s+/g, '');
					$("#majorEvent").append('<img src="images/'+ dType + '.png" alt="'+ dType +'" class="disasterHeading" />' + b.DisasterName + '<br />');
				}
			} else {
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
			}

		});
moneyFormated = money.formatNumber(0, '.', ',');
peopleFormated = people.formatNumber(0, '.', ',');
suppliesFormated = supplies.formatNumber(0, '.', ',');

if (moneyFormated < 1) {
	moneyFormated = '';
}
if (peopleFormated < 1) {
	peopleFormated = '';
}
if (suppliesFormated < 1) {
	suppliesFormated ='';
}
$('#moneyTotal').html('$' + moneyFormated);
$('#peopleTotal').html(peopleFormated);
$('#suppliesTotal').html(suppliesFormated);

var moneyCount = Math.floor(money/1000000);
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
if (suppliesStacks > 1) {
	for (i=0;i<suppliesStacks;i++) {
		$("#suppliesStack").append('<img src="images/boxes.png" alt="supplies" name="100000" class="iconStack mattress" />');
	}
	for (i=0;i<suppliesRemain;i++) {
		$("#suppliesStack").append('<img src="images/supplies.png" alt="supplies" name="10000" class="iconStack supplies" />');
	}
} else {
	for (i=0;i<suppliesCount;i++) {
		$("#suppliesStack").append('<img src="images/boxes.png" alt="moneybag" name="10000" class="iconStack supplies" />');
	}
}

$('#disastersStack').empty();
$('#disastersTotal').empty();
$('#disastersTotal').html(disasters.length);
$.each(disasters, function(a,b){
	var dType = b.DisasterType.toLowerCase().replace(/\s+/g, '');
	$('#disastersStack').append('<a title="'+ b.DisasterName +'"><img src="images/'+ dType + '.png" alt="'+ dType +'" class="disaster" /></a>');
});
}

function annotate(year) {
	var html;
	$('#majorEvent').empty();
	switch (year) {
		case "1999":
			html = '<img src="images/earthquake.png" alt="earthquake" class="disasterHeading" />Turkey Earthquake';
			break;
		case "2000":
			html = '';
			break;
		case "2001":
			html = '<img src="images/earthquake.png" alt="earthquake" class="disasterHeading" />Indian Earthquake';
			break;
		case "2002":
			html = '';
			break;
		case "2003":
			html = '';
			break;
		case "2004":
			html = '<img src="images/tsunami.png" alt="tsunami" class="disasterHeading" />Asian Tsunami';
			break;
		case "2005":
			html = '<img src="images/earthquake.png" alt="earthquake" class="disasterHeading" />Pakistan Earthquake';
			break;
		case "2006":
			html = '';
			break;
		case "2007":
			html = '';
			break;
		case "2008":
			html = '<img src="images/earthquake.png" alt="earthquake" class="disasterHeading" />China Sichuan Earthquake';
			break;
		case "2009":
			html = '';
			break;
		case "2010":
			html = '<img src="images/earthquake.png" alt="earthquake" class="disasterHeading" />Haiti Earthquake <br /><img src="images/floods.png" alt="floods" class="disasterHeading" />Pakistan Floods';
			break;
		case "2011":
			html = '<img src="images/earthquake.png" alt="earthquake" class="disasterHeading" />Japan Earthquake & Tsunami';
			break;
		case "2012":
			html = '';
			break;
		case "2013":
			html = '';
			break;
		}

		$('#majorEvent').append(html).show(700);
	}

//fire function to for initial page load
getWorld();

//slider control
$('#slider').change(function(){
	var selectedYear = this.value;
	$('#controls').css({'background-image': 'url(images/'+selectedYear+'.png)',
		'background-repeat': 'no-repeat',
		'background-position': '80px 0'});
	map.removeLayer(redLayer);
	map.removeLayer(greyLayer);
	parseWorld(worldcountries,iroc_response,selectedYear);
	buildStuff(selectedYear);
	annotate(selectedYear);
});

$('#slider').change();
