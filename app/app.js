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
    sidebar.height(getDesiredHeight(sidebar));
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
//Application entry point
$(function(){
    Parse.initialize("cfqmL781rPz7xlixkDxIirwPS6zfV6VT3rHP8Qms" /* app ID */,
                     "AmORKMDyEW0IesQGRr1CSYPcCF0lhhGYKFFvqDtq" /* JS */);

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
        center: [144, -37],
        zoom: 4
      })
    });
    applyInitialUIState();
    applyMargins();
});
