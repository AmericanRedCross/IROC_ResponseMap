var worldcountries;
var displayed;
var notdisplayed;
var redLayer;
var greyLayer;
var center = new L.LatLng(30, 60);

var money = 0;
var people = 0;
var supplies = 0;
var hygieneKits = 0;
var blankets = 0;
var jerryCans = 0;
var buckets = 0;
var tents = 0;
var kitchenSets = 0;
var sleepingMats = 0;
var mosquitoNets = 0;
var foodParcels = 0;
var tarps = 0;
var vehicles = 0;
var otherItems = 0;
var riceBags = 0;

var highlight;

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

Number.prototype.formatNumber = function(c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "," : d,
        t = t == undefined ? "." : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

var bounds = new L.LatLngBounds([90, 250], [-80, -200]);


var map = L.map('map', {
    center: center,
    zoom: 1,
    attributionControl: false,
    zoomControl: false,
    maxBounds: bounds,
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
        url: "data/worldcountries2.json",
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
            parseWorld(worldcountries, iroc_response, '1999');
            buildStuff('1999');

        },
        error: function(e) {
            console.log(e);
        }
    });
}

function parseWorld(world, iroc, year) {
    var red = [];
    var borders = [];
    var grey = [];
    displayed = [];

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

    highlight = function(feature, layer) {
        (function(layer, properties) {
            layer.on("mouseover", function(e) {
                // layer.setStyle(highlightStyle);
            })
            layer.on("mouseout", function(e) {
                // layer.setStyle(redStyle);
            })

            layer.on("click", function(e) {
                redLayer.setStyle(redStyle);
                layer.setStyle(highlightStyle);
                $("#majorEvent").empty();
                buildStuff(year, properties.name);
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

function reloadYear() {
    var year = $('#slider').val();
    buildStuff(year);
    $("#majorEvent").empty();
    redLayer.setStyle(redStyle);
}

function buildStuff(year, dName) {
    money = 0;
    people = 0;
    supplies = 0;
    var disasters = [];
    $.each(iroc_response, function(a, b) {
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
                $('#disastersStack').empty();
                $("#majorEvent").append('<img src="images/' + dType + '.png" alt="' + dType + '" class="disasterHeading" />' + b.DisasterName + '<br />');
            }
        } else {
            $('#majorEvent').empty();
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

                var pHygieneKits = parseInt(b.HygieneKits);
                var pBlankets = parseInt(b.Blankets);
                var pJerryCans = parseInt(b.JerryCans);
                var pBuckets = parseInt(b.Buckets);
                var pTents = parseInt(b.Tents);
                var pKitchenSets = parseInt(b.KitchenSets);
                var pSleepingMats = parseInt(b.SleepingMats);
                var pMosquitoNets = parseInt(b.MosquitoNets);
                var pFoodParcels = parseInt(b.FoodParcels);
                var pTarps = parseInt(b.Tarps);
                var pVehicles = parseInt(b.Vehicles);
                var pOtherItems = parseInt(b.OtherItems);
                var pRiceBags = parseInt(b.RiceBags);

                money = money + pMoney;
                people = people + pPeople;
                supplies = supplies + pSupplies;
                //create total for each supply type

                hygieneKits = hygieneKits + pHygieneKits;
                blankets = blankets + pBlankets;
                jerryCans = jerryCans + pJerryCans;
                buckets = buckets + pBuckets;
                tents = tents + pTents;
                kitchenSets = kitchenSets + pKitchenSets;
                sleepingMats = sleepingMats + pSleepingMats;
                mosquitoNets = mosquitoNets + pMosquitoNets;
                foodParcels = foodParcels + pFoodParcels;
                tarps = tarps + pTarps;
                vehicles = vehicles + pVehicles;
                otherItems = otherItems + pOtherItems;
                riceBags = riceBags + pRiceBags;

                disasters.push(b);
            }

            $('#disastersStack').empty();
            $.each(disasters, function(a, b) {
                var dType = b.DisasterType.toLowerCase().replace(/\s+/g, '');
                $('#disastersStack').append('<a title="' + b.DisasterName + '"><img src="images/' + dType + '.png" alt="' + dType + '" class="disaster" name="' + b.DisasterName + '"/></a>');
            });
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
        suppliesFormated = '';
    }
    $('#moneyTotal').html('$' + moneyFormated);
    $('#peopleTotal').html(peopleFormated);
    $('#suppliesTotal').html(suppliesFormated);
    $('#disastersTotal').html(disasters.length);

    var moneyCount = Math.floor(money / 1000000);
    if (moneyCount < 1) {
        moneyCount = 1;
    }
    $("#moneyStack").empty();
    var moneyStacks = Math.floor(moneyCount / 10);
    var moneyRemain = Math.ceil(moneyCount % 10);
    if (moneyStacks > 1) {
        for (i = 0; i < moneyStacks; i++) {
            $("#moneyStack").append('<img src="images/moneybag.png" alt="moneybag" name="$10 million" class="iconStack moneybag" />');
        }
        for (i = 0; i < moneyRemain; i++) {
            $("#moneyStack").append('<img src="images/money.png" alt="moneybag" name="$1 million" class="iconStack money" />');
        }
    } else if (money == 0) {
        $("#moneyStack").append('No donations made.');
    } else {
        for (i = 0; i < moneyCount; i++) {
            $("#moneyStack").append('<img src="images/money.png" alt="moneybag" name="$1 million"  class="iconStack money" />');
        }
    }

    $("#peopleStack").empty();
    var peopleStacks = Math.floor(people / 10);
    var peopleRemain = Math.ceil(people % 10);
    if (peopleStacks > 1) {
        for (i = 0; i < peopleStacks; i++) {
            $("#peopleStack").append('<img src="images/people.png" alt="people" name="10" class="iconStack people" />');
        }
        for (i = 0; i < peopleRemain; i++) {
            $("#peopleStack").append('<img src="images/male.png" alt="person" name="1" class="iconStack person" />');
        }
    } else if (people == 0) {
        $("#peopleStack").append('No staff responded.');
    } else {
        for (i = 0; i < people; i++) {
            $("#peopleStack").append('<img src="images/male.png" alt="person" name="1" class="iconStack person" />');
        }
    }





}

//fire function to for initial page load
getWorld();

//slider control
$('#slider').change(function() {
    var selectedYear = this.value;
    $('#controls').css({
        'background-image': 'url(images/' + selectedYear + '.png)',
        'background-repeat': 'no-repeat',
        'background-position': '80px 0'
    });
    map.removeLayer(redLayer);
    map.removeLayer(greyLayer);
    parseWorld(worldcountries, iroc_response, selectedYear);
    buildStuff(selectedYear);
});

$('#slider').change();

// $(document).on('hover', '.disaster', (function() {
//     var cHigh = $(this).name();
//     $.each(red, function(a, b) {
// 		var cName = b.properties.name.toUpperCase();
// 		if (cName == cHigh) {
// 			highlight();
// 		}
// 	});
// }));