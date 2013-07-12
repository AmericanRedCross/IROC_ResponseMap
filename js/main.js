var worldcountries;
var displayed;
var notdisplayed;
var redLayer;
var greyLayer;
var center = new L.LatLng(30, 0);

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
    color: '#fff',
    weight: 1,
    fillColor: 'red',
    fillOpacity: 0.7
}
var greyStyle = {
    color: '#fff',
    weight: 1,
    fillColor: 'grey',
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

var bounds = new L.LatLngBounds([90, 200], [-80, -200]);


var map = L.map('map', {
    center: center,
    zoom: 1,
    attributionControl: false,
    zoomControl: false,
    maxBounds: bounds
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
        url: 'data/worldcountries2.json',
        contentType: 'application/json',
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
        url: 'data/iroc_response.json',
        contentType: 'application/json',
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
            layer.on("mouseover", function(e) {})
            layer.on("click", function(e) {
                redLayer.setStyle(redStyle);
                layer.setStyle(highlightStyle);
                $('#majorEvent').empty();
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
    $('#majorEvent').empty();
    redLayer.setStyle(redStyle);
}

function buildStuff(year, dName) {
    money = 0;
    people = 0;
    supplies = 0;
    var disasters = [];
    $.each(iroc_response, function(a, b) {
        var pYear = new Date(b.Date).getFullYear();
        if (b.Money == '') {
            b.Money = 0;
        }
        if (b.PeopleDeployed == '') {
            b.PeopleDeployed = 0;
        }
        if (b.TotalSupplies == '') {
            b.TotalSupplies = 0;
        }
        if (b.Money == '') {
            b.Money = 0;
        }
        if (b.HygieneKits == '') {
            b.HygieneKits = 0;
        }
        if (b.Blankets == '') {
            b.Blankets = 0;
        }
        if (b.JerryCans == '') {
            b.JerryCans = 0;
        }
        if (b.Buckets == '') {
            b.Buckets = 0;
        }
        if (b.Tents == '') {
            b.Tents = 0;
        }
        if (b.KitchenSets == '') {
            b.KitchenSets = 0;
        }
        if (b.SleepingMats == '') {
            b.SleepingMats = 0;
        }
        if (b.FoodParcels == '') {
            b.FoodParcels = 0;
        }
        if (b.Tarps == '') {
            b.Tarps = 0;
        }
        if (b.Vehicles == '') {
            b.Vehicles = 0;
        }
        if (b.OtherItems == '') {
            b.OtherItems = 0;
        }
        if (b.RiceBags == '') {
            b.RiceBags = 0;
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

        if ((dName) && (year)){
            if ((pYear == year) && (dName == b.Country)) {
                money = money + pMoney;
                people = people + pPeople;
                supplies = supplies + pSupplies;
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
                var dType = b.DisasterType.toLowerCase().replace(/\s+/g, '');
                $('#disastersStack').empty();
                $('#majorEvent').append('<a title="'+dType+'"><img src="images/' + dType + '.png" alt="' + dType + '" class="disasterHeading" />' + b.DisasterName + '</a><br />');
            }
        } else if (year) {
            $('#majorEvent').empty();
            if (pYear == year) {
                money = money + pMoney;
                people = people + pPeople;
                supplies = supplies + pSupplies;
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
                $('#disastersStack').append('<a title="' + b.DisasterName + '"><img src="images/' + dType + '.png" alt="' + dType + '" class="iconStack" name="' + b.DisasterName + '"/></a>');
            });
        } else {
            $('#majorEvent').empty();
                money = money + pMoney;
                people = people + pPeople;
                supplies = supplies + pSupplies;
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

            $('#disastersStack').empty();
            $.each(disasters, function(a, b) {
                var dType = b.DisasterType.toLowerCase().replace(/\s+/g, '');
                $('#disastersStack').append('<a title="' + b.DisasterName + '"><img src="images/' + dType + '.png" alt="' + dType + '" class="iconStack" name="' + b.DisasterName + '"/></a>');
            });
        }

    });
    moneyFormated = money.formatNumber(0, '.', ',');
    peopleFormated = people.formatNumber(0, '.', ',');
    suppliesFormated = supplies.formatNumber(0, '.', ',');
    hygieneKitsFormated = hygieneKits.formatNumber(0, '.', ',');
    blanketsFormated = blankets.formatNumber(0, '.', ',');
    jerryCansFormated = jerryCans.formatNumber(0, '.', ',');
    bucketsFormated = buckets.formatNumber(0, '.', ',');
    tentsFormated = tents.formatNumber(0, '.', ',');
    kitchenSetsFormated = kitchenSets.formatNumber(0, '.', ',');
    sleepingMatsFormated = sleepingMats.formatNumber(0, '.', ',');
    mosquitoNetsFormated = mosquitoNets.formatNumber(0, '.', ',');
    foodParcelsFormated = foodParcels.formatNumber(0, '.', ',');
    tarpsFormated = tarps.formatNumber(0, '.', ',');
    vehiclesFormated = vehicles.formatNumber(0, '.', ',');
    otherItemsFormated = otherItems.formatNumber(0, '.', ',');
    riceBagsFormated = riceBags.formatNumber(0, '.', ',');

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
    $('#moneyStack').empty();
    var moneyStacks = Math.floor(moneyCount / 10);
    var moneyRemain = Math.ceil(moneyCount % 10);
    if (moneyStacks > 1) {
        for (i = 0; i < moneyStacks; i++) {
            $('#moneyStack').append('<a title="$10 million"><img src="images/moneybag.png" alt="moneybag" name="$10 million" class="iconStack moneybag" /></a>');
        }
        for (i = 0; i < moneyRemain; i++) {
            $('#moneyStack').append('<a title="$1 million"><img src="images/money.png" alt="moneybag" name="$1 million" class="iconStack money" /></a>');
        }
    } else if (money == 0) {
        $('#moneyStack').append('No donations made.');
    } else {
        for (i = 0; i < moneyCount; i++) {
            $('#moneyStack').append('<a title="$1 million"><img src="images/money.png" alt="moneybag" name="$1 million"  class="iconStack money" /></a>');
        }
    }

    $('#peopleStack').empty();
    var peopleStacks = Math.floor(people / 10);
    var peopleRemain = Math.ceil(people % 10);
    if (peopleStacks > 1) {
        for (i = 0; i < peopleStacks; i++) {
            $('#peopleStack').append('<a title="10 Staff"><img src="images/people.png" alt="people" name="10" class="iconStack people" /></a>');
        }
        for (i = 0; i < peopleRemain; i++) {
            $('#peopleStack').append('<a title="1 Staff"><img src="images/male.png" alt="person" name="1" class="iconStack person" /></a>');
        }
    } else if (people == 0) {
        $('#peopleStack').append('No staff responded.');
    } else {
        for (i = 0; i < people; i++) {
            $('#peopleStack').append('<a title="1 Staff"><img src="images/male.png" alt="person" name="1" class="iconStack person" /></a>');
        }
    }

    $('#suppliesStack').empty();
    if (hygieneKits > 0) {
        $('#suppliesStack').append('<li><a title="Hygiene Kits"><img src="images/hygienekits.png" class="iconStack supplyIcon" alt="hygiene kits" />' + hygieneKitsFormated + '</a></li>')
    }
    if (blankets > 0) {
        $('#suppliesStack').append('<li><a title="Blankets"><img src="images/blankets.png" class="iconStack supplyIcon" alt="blankets" />' + blanketsFormated + '</a></li>')
    }
    if (jerryCans > 0) {
        $('#suppliesStack').append('<li><a title="Jerry Cans"><img src="images/jerrycans.png" class="iconStack supplyIcon" alt="jerryCans" />' + jerryCansFormated + '</a></li>')
    }
    if (buckets > 0) {
        $('#suppliesStack').append('<li><a title="Buckets"><img src="images/buckets.png" class="iconStack supplyIcon" alt="buckets" />' + bucketsFormated + '</a></li>')
    }
    if (tents > 0) {
        $('#suppliesStack').append('<li><a title="Tents"><img src="images/tents.png" class="iconStack supplyIcon" alt="tents" />' + tentsFormated + '</a></li>')
    }
    if (kitchenSets > 0) {
        $('#suppliesStack').append('<li><a title="Kitchen Sets"><img src="images/kitchensets.png" class="iconStack supplyIcon" alt="kitchen sets" />' + kitchenSetsFormated + '</a></li>')
    }
    if (sleepingMats > 0) {
        $('#suppliesStack').append('<li><a title="Sleeping Mats"><img src="images/sleepingmats.png" class="iconStack supplyIcon" alt="sleeping mats" />' + sleepingMatsFormated + '</a></li>')
    }
    if (mosquitoNets > 0) {
        $('#suppliesStack').append('<li><a title="Mosquito Nets"><img src="images/mosquitonets.png" class="iconStack supplyIcon" alt="mosquito Nets" />' + mosquitoNetsFormated + '</a></li>')
    }
    if (foodParcels > 0) {
        $('#suppliesStack').append('<li><a title="Food Parcels"><img src="images/foodparcels.png" class="iconStack supplyIcon" alt="Food Parcels" />' + foodParcelsFormated + '</a></li>')
    }
    if (riceBags > 0) {
        $('#suppliesStack').append('<li><a title="Rice Bags"><img src="images/ricebags.png" class="iconStack supplyIcon" alt="rice Bags" />' + riceBagsFormated + '</a></li>')
    }
    if (tarps > 0) {
        $('#suppliesStack').append('<li><a title="Tarps"><img src="images/tarps.png" class="iconStack supplyIcon" alt="tarps" />' + tarpsFormated + '</a></li>')
    }
    if (vehicles > 0) {
        $('#suppliesStack').append('<li><a title="Vehicles"><img src="images/vehicles.png" class="iconStack supplyIcon" alt="vehicles" />' + vehiclesFormated + '</a></li>')
    }
    if (otherItems > 0) {
        $('#suppliesStack').append('<li><a title="Other Items"><img src="images/otheritems.png" class="iconStack supplyIcon" alt="other Items" />' + otherItemsFormated + '</a></li>')
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

//disclaimer text

function showDisclaimer() {
    $('#disclaimerText').show();
}

function closeDisclaimer() {
    $('#disclaimerText').hide();
}

// $('#year').click(function (){
//     reloadYear();
//     alert('test');
// });
// $('#total').click(function(){
//     map.removeLayer(redLayer);
//     map.removeLayer(greyLayer);
//     parseWorld(worldcountries, iroc_response);
//     buildStuff();
// });
$(function(){
    $('#year').click(function () {
      console.log('event fired');
    });
    console.log('doc ready');
});

$( window ).load(function() {
        console.log( "window loaded" );
});

