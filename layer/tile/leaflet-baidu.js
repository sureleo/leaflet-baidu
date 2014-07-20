/**
 * Projection class for Baidu Spherical Mercator
 *
 * @class BaiduSphericalMercator
 */
L.Projection.BaiduSphericalMercator = {
    R: 6378137,
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
        leafletPoint = new L.Point(point.x, point.y);
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
        console.log(point);
        latLng = new L.LatLng(point.lng, point.lat);
        return latLng;
    },

    /**
     * Don't know how it used currently.
     */
    bounds: (function () {
        var d = this.R * Math.PI;
        return L.bounds([-d, -d], [d, d]); //20037508.342789244
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
        attribution: 'Baidu'
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

L.baiduLayer = function (key, options) {
    return new L.Baidu(key, options);
};
