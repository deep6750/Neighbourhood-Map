var map;

var myPlaceCorrdinates = {
    lat: 18.5204,
    lng: 73.8567
};

var pointers = [];


var myWin = '';



var myModel = {
    list: ko.observableArray([]),
    searchQuery: ko.observable(),
    wasError: ko.observable(false),
    ErrMessage: ko.observable(''),



    constructor: function () {
        for (var i in pointers) {
            myModel.list.push(pointers[i].title);
        }
    },

    filter: function (query) {
        $(".dropdown-button").trigger("click");
        myModel.list.removeAll();

        for (var j in pointers) {

            if (pointers[j].title.toLowerCase().indexOf(query.toLowerCase()) > -1) {
                myModel.list.push(pointers[j].title);
                pointers[j].setVisible(true);
            } else {
                pointers[j].setVisible(false);
            }
        }


    }

}

function mapError() {
    myModel.wasError(true);
    var $toastContent = $('<span>Map is not loading</span>');
    Materialize.toast($toastContent, 5000);
    myModel.ErrMessage('Map is not loading');
}

function animateMarker(marker) {
    marker.setIcon('http://maps.google.com/mapfiles/kml/pal2/icon55.png');
    marker.setAnimation(google.maps.Animation.BOUNCE);
}

function get_restaurants() {
    $.ajax({
        url: 'https://developers.zomato.com/api/v2.1/geocode',
        headers: {
            'Accept': 'application/json',
            'user-key': '8c84822133520a57c80fe5a6605cab42'
        },
        data: 'lat=18.5204&lon=73.8567',
        async: true
    }).done(function (response) {
        metadata = response.nearby_restaurants;
        console.log(metadata);
        for (var i = 0; i < metadata.length; i++) {
            var marker = new google.maps.Marker({
                title: metadata[i].restaurant.name,
                position: {
                    lat: parseFloat(metadata[i].restaurant.location.latitude),
                    lng: parseFloat(metadata[i].restaurant.location.longitude)
                },
                map: map,
                animation: google.maps.Animation.DROP,
                address: metadata[i].restaurant.location.address
            });
            marker.addListener('click', openInfoWin2);
            pointers.push(marker);
        }
        var MaxBounds = new google.maps.LatLngBounds();
        for (var k in pointers) {
            MaxBounds.extend(pointers[k].position);
        }
        map.fitBounds(MaxBounds);
        myModel.constructor();
    }).fail(function () {
        myModel.wasError(true);
        var $toastContent = $('<span>Restaurants cant be displayed</span>');
        Materialize.toast($toastContent, 5000);
        myModel.ErrMessage('Restaurants cant be displayed');
    });
}

function openInfoWin2() {
    openInfoWin(this);
}



function stopMarker(marker) {
    myWin.marker.setIcon(null);
    myWin.marker.setAnimation(null);
}

function openInfoWin(marker) {
    if (myWin.marker !== marker && myWin.marker !== undefined) {
        stopMarker(myWin.marker);
    }
    animateMarker(marker);
    var content = '<h1>' + ' Name - ' + marker.title + '</h1>';
    content += '<h2>' + ' Address - ' + marker.address + '</h2>';
    myWin.marker = marker;
    myWin.setContent(content);
    myWin.open(map, marker);
    myWin.addListener('closeclick', stopMarker);
}

function open(title) {
    for (var j in pointers) {
        if (pointers[j].title == title) {
            openInfoWin(pointers[j]);
            return;
        }
    }
}



function startMap() {
    myModel.wasError(false);
    myWin = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById('map'), {
        center: myPlaceCorrdinates,
        zoom: 14
    });
    get_restaurants();
}


ko.applyBindings(myModel);
myModel.searchQuery.subscribe(myModel.filter);
//3bcf9f4b92799cec67722ad354259831
