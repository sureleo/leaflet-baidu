/**
 * Projection class for Baidu Spherical Mercator
 *
 * @class BaiduSphericalMercator
 */
L.Projection.BaiduSphericalMercator = {
    /**
     * Project latLng to point coordinate
     *
     * @method project
     * @param {Object} latLng coordinate for a point on earth
     * @return {Object} leafletPoint point coordinate of L.Point
     */
    project: function(latLng) {
        var projection = new BMap.MercatorProjection();
        var point = projection.lngLatToPoint(
            new BMap.Point(latLng.lng, latLng.lat)
        );
        var leafletPoint = new L.Point(point.x, point.y);
        return leafletPoint;
    },

    /**
     * unproject point coordinate to latLng
     *
     * @method unproject
     * @param {Object} bpoint baidu point coordinate
     * @return {Object} latitude and longitude
     */
    unproject: function (bpoint) {
        var projection= new BMap.MercatorProjection();
        var point = projection.pointToLngLat(
            new BMap.Pixel(bpoint.x, bpoint.y)
        );
        var latLng = new L.LatLng(point.lat, point.lng);
        return latLng;
    },

    /**
     * Don't know how it used currently.
     *
     * However, I guess this is the range of coordinate.
     * Range of pixel coordinate is gotten from
     * BMap.MercatorProjection.lngLatToPoint(180, -90) and (180, 90)
     * After getting max min value of pixel coordinate, use
     * pointToLngLat() get the max lat and Lng.
     */
    bounds: (function () {
        var MAX_X= 20037726.37;
        var MIN_Y= -11708041.66;
        var MAX_Y= 12474104.17;
        var bounds = L.bounds(
            [-MAX_X, MIN_Y], //180, -71.988531
            [MAX_X, MAX_Y]  //-180, 74.000022
        );
        return bounds;
    })()
};

/**
 * Transformation class for Baidu Transformation.
 * Basically, it contains the conversion of point coordinate and
 * pixel coordinate.
 *
 * @class BTransformation
 */
L.BTransformation = function () {
};

L.BTransformation.prototype = {
    MAXZOOM: 18,
    /**
     * Don't know how it used currently.
     */
    transform: function (point, zoom) {
        return this._transform(point.clone(), zoom);
    },

    /**
     * transform point coordinate to pixel coordinate
     *
     * @method _transform
     * @param {Object} point point coordinate
     * @param {Number} zoom zoom level of the map
     * @return {Object} point, pixel coordinate
     */
    _transform: function (point, zoom) {
        point.x = point.x >> (this.MAXZOOM - zoom);
        point.y = point.y >> (this.MAXZOOM - zoom);
        return point;
    },

    /**
     * transform pixel coordinate to point coordinate
     *
     * @method untransform
     * @param {Object} point pixel coordinate
     * @param {Number} zoom zoom level of the map
     * @return {Object} point, point coordinate
     */
    untransform: function (point, zoom) {
        point.x = point.x << (this.MAXZOOM - zoom);
        point.y = point.y << (this.MAXZOOM - zoom);
        return point;
    }
};

/**
 * Coordinate system for Baidu EPSG3857
 *
 * @class BEPSG3857
 */
L.CRS.BEPSG3857 = L.extend({}, L.CRS, {
    /**
     * transform latLng to pixel coordinate
     *
     * @method untransform
     * @param {Object} latlng latitude and longitude
     * @param {Number} zoom zoom level of the map
     * @return {Object} pixel coordinate calculated for latLng
     */
    latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
        var projectedPoint = this.projection.project(latlng);
        return this.transformation._transform(projectedPoint, zoom);
    },

    /**
     * transform pixel coordinate to latLng
     *
     * @method untransform
     * @param {Object} point pixel coordinate
     * @param {Number} zoom zoom level of the map
     * @return {Object} latitude and longitude
     */
    pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
        var untransformedPoint = this.transformation.untransform(point, zoom);
        return this.projection.unproject(untransformedPoint);
    },

    code: 'EPSG:3857',
    projection: L.Projection.BaiduSphericalMercator,

    transformation: new L.BTransformation()
});

/**
 * Tile layer for Baidu Map
 *
 * @class Baidu
 */
L.Baidu = L.TileLayer.extend({
    options: {
        subdomains: ['online1', 'online2', 'online3'],
        //TODO: decode utf8 characters in attribution
        attribution: '© 2014 Baidu - GS(2012)6003;- Data © <a target="_blank" href="http://www.navinfo.com/">NavInfo</a> & <a target="_blank" href="http://www.cennavi.com.cn/">CenNavi</a> & <a target="_blank" href="http://www.365ditu.com/">DaoDaoTong</a>',
    },

    /**
     * initialize the map with key and tile URL
     *
     * @method initialize
     * @param {String} key access key of baidu map
     * @param {Object} options, option of the map
     */
    initialize: function (key, options) {
        L.Util.setOptions(this, options);
        this._key = key;
        this._url = 'http://{subdomain}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20140711';
    },

    /**
     * Set the corresponding position of tiles in baidu map.
     * if point.y is less or equal than 256, i.e. 35=>291, -221=>547
     * if point.y is greater than 256, i.e. 291=>35, 547=>-221
     *
     * @method _getTilePos
     * @param {Object} tilePoint tile coordinate
     * @return {Object} point left and top property of <img>
     */
    _getTilePos: function (tilePoint) {
        var origin = this._map.getPixelOrigin();
        var tileSize = this._getTileSize();

        var point = tilePoint.multiplyBy(tileSize).subtract(origin);
        if (point.y <= 256) {
            point.y = (
                2 * Math.abs(
                    Math.floor(point.y / tileSize)
                ) + 1
            ) * tileSize + point.y;
        } else {
            point.y = point.y - (
                Math.floor(point.y / tileSize) * 2 - 1
            ) * tileSize;
        }
        return point;
    },

    /**
     * Override _update method in map. redefine bounds.
     * Pros: no blank row on the top or bottom
     * Cons: some times it might load a row that is not necessary.
     *
     * @method _updateBaidu
     */
     _update: function () {
        if (!this._map) { return; }
        var map = this._map,
            bounds = map.getPixelBounds(),
            zoom = map.getZoom(),
            tileSize = this._getTileSize();
        if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
            return;
        }

        boundsMax = bounds.max.divideBy(tileSize);
        boundsMax.x = Math.floor(boundsMax.x);
        boundsMax.y = Math.ceil(boundsMax.y);

        var tileBounds = L.bounds(
            bounds.min.divideBy(tileSize)._floor(),
            boundsMax
        );

        this._addTilesFromCenterOut(tileBounds);
        if (this.options.unloadInvisibleTiles || this.options.reuseTiles) {
            this._removeOtherTiles(tileBounds);
        }
    },

    /**
     * get a tile url of the map
     *
     * @method getTileUrl
     * @param {Object} coords, tile coordinate
     * @return {String} url of a tile
     */
    getTileUrl: function(coords) {
        return this._url.replace('{subdomain}', this._getSubdomain(coords))
            .replace('{x}', coords.x)
            .replace('{y}', coords.y)
            .replace('{z}', this._getZoomForUrl());
    }
});

L.map = function (id, options) {
    var map = new L.Map(id, options);

    /**
     * load new tiles when set zoom for baidu map
     * Works well: mouse scroll. zoom level <= 14 in double click
     * Works not well: zoom level > 14. Not Accurate at all.
     * TODO: figure out why not accurate. Potential: CRS differences.
     *
     * @method _setZoomAroundBaidu
     * @param {Object} latlng position of mouse clicked on the canvas
     * @param {Number} zoom zoom level
     * @param {Object} options options of the map
     * @return {Object} TODO: not sure for now. probably the map itself
     */
    var setZoomAroundBaidu = function (latlng, zoom, options) {
        var scale = this.getZoomScale(zoom);
        var viewHalf = this.getSize().divideBy(2);
        var containerPoint = latlng instanceof L.Point ? latlng : this.latLngToContainerPoint(latlng);
        var centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale);
        var newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));
        var oldCenterLat = this.getCenter().lat;
        //add offset rather than minus it
        newCenter.lat = oldCenterLat - newCenter.lat + oldCenterLat;
        return this.setView(newCenter, zoom, {zoom: options});
    };

    /**
     * Override _getTopLeftPoint method. For Baidu Map, if dragging
     * down side of the map, y will increase rather than decrease.
     * vice versa.
     *
     * @method _getTopLeftPoint
     * @return {Object} point top left point
     */
    var _getTopLeftPointBaidu = function () {
        var pixel = this.getPixelOrigin();
        var pane = this._getMapPanePos();
        var point = new L.Point(pixel.x - pane.x, pixel.y + pane.y);
        return point;
    };

    //if option has baidu, use custom method
    if (options.baidu === true) {
        map._getTopLeftPoint = _getTopLeftPointBaidu;
        map.setZoomAround = setZoomAroundBaidu;
    }
    return map;
};

L.baiduLayer = function (key, options) {
    return new L.Baidu(key, options);
};
