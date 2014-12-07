var Issue = Parse.Object.extend("Issue");
var Comment = Parse.Object.extend("Comment");
var Tags = Parse.Object.extend("Tags");

var olMap = null;
function updateOlMapDom() {
    olMap.setTarget($("#map")[0]);
}
function getDesiredHeight(el) {
    var outerHeight = $(window).height() - el.offset().top;
    return outerHeight - (el.outerHeight(true) - el.innerHeight());
}
function applyMargins() {
    var mapCtrl = $("#map");
    var zoomCtrl = $(".ol-zoom", mapCtrl);
    var sidebar = $(".sidebar-left");
	var sidebarBody = $("#sidebar");
    var leftToggler = $(".mini-submenu-left");
    if (leftToggler.is(":visible")) { //Sidebar collapsed
      zoomCtrl
        .css("margin-left", 0)
        .removeClass("zoom-top-opened-sidebar")
        .addClass("zoom-top-collapsed");
      mapCtrl.css("left", "0px");
      updateOlMapDom();
    } else {
      //This is the bootstrap navbar hamburger button that's only visible in mobile displays.
      //Check its visibility to determine if we're on a phone
      var el = $("button.navbar-toggle");

      //Because when we're on a phone, we want the sidebar menu to "slide over" the map to avoid
      //an unnecessary redraw of something the user won't see
      if (el.is(":visible")) {
        mapCtrl.css("left", "0px");
        zoomCtrl
          .removeClass("zoom-top-opened-sidebar")
          .removeClass("zoom-top-collapsed");
      } else { // "Push" the sidebar back into view
        zoomCtrl
          .removeClass("zoom-top-opened-sidebar")
          .removeClass("zoom-top-collapsed");
        mapCtrl.css("left", sidebar.width() + "px");
        updateOlMapDom();
      }
    }
    sidebarBody.height(getDesiredHeight(sidebarBody));
}
function isConstrained() {
    return $(".sidebar").width() == $(window).width();
}
function applyInitialUIState() {
    if (isConstrained()) {
      $(".sidebar-left .sidebar-body").fadeOut('slide');
      $('.mini-submenu-left').fadeIn();
    }
}

function refineIssues(tag){
    
    var tags = [];
    //Set the tags based on the selection
    $( "#qryIssueTags option:selected" ).each(function() {
        tags.push($(this).val());
    });

    var tagQuery = new Parse.Query(Issue);
    tagQuery.containsAll("tags", tags);
    tagQuery.find({
      success: function(results) {
        populateIssues(results);
        alert("Successfully retrieved " + results.length + " objects.");
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
    });
}

function initTags(){
    //Fetch registered tags
    var query = new Parse.Query(Tags);
    query.find({
        success: function(results) {
            updateTags(results);
        },
        error: function(error) {
            alert("Error: " + error.code + " " + error.message);
        }
    });
}

function updateTags(results) {
    $(".issue-tag-list option").remove();
    for (var i = 0; i < results.length; i++) {
        var tag = results[i];
        var value = tag.get("value");
         $(".issue-tag-list").append("<option value='" + value + "'>" + value + "</option>")
    }
}
function populateIssues(issues) {
    var tpl = _.template($("#issue-list").text());
    var html = tpl({issues: issues});
    $("#sidebar").html(html);
    
    var icons = [];
    for(var i=0; i<issues.length; i++){
        var location = issues[i].get("location");
        
        var iconFeature = new ol.Feature({
              geometry: new ol.geom.Point([location._longitude, location._latitude]).transform('EPSG:4326', 'EPSG:3857'),
              name: issues[i].get("title")
        });
//        var iconStyle = new ol.style.Style({
//          image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
//            anchor: [0.5, 46],
//            anchorXUnits: 'fraction',
//            anchorYUnits: 'pixels',
//            opacity: 0.75
//          }))
//        });
//        iconFeature.setStyle(iconStyle);
        icons.push(iconFeature);
    }
    var vectorSource = new ol.source.Vector({
        features: icons
    });
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });
    olMap.addLayer(vectorLayer);
}

$(function(){
    Parse.initialize("cfqmL781rPz7xlixkDxIirwPS6zfV6VT3rHP8Qms" /* app ID */,
                     "AmORKMDyEW0IesQGRr1CSYPcCF0lhhGYKFFvqDtq" /* JS */);
    initTags();
    $("body").on("click", "#btnSearch", refineIssues);
    $('.sidebar-left .slide-submenu').on('click',function() {
      var thisEl = $(this);
      thisEl.closest('.sidebar-body').fadeOut('slide',function(){
        $('.mini-submenu-left').fadeIn();
        applyMargins();
      });
    });
    $('.mini-submenu-left').on('click',function() {
      var thisEl = $(this);
      $('.sidebar-left .sidebar-body').toggle('slide');
      thisEl.hide();
      applyMargins();
    });
    $(window).on("resize", applyMargins);

    olMap = new ol.Map({
      target: "map",
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        })
      ],
      view: new ol.View({
        center: ol.proj.transform([144, -37],'EPSG:4326', 'EPSG:3857') ,
        zoom: 4
      })
    });
    applyInitialUIState();
    applyMargins();
});
