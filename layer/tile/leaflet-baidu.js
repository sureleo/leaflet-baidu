L.Projection.BaiduSphericalMercator = {
    R: 6378137,
    project: function(latLng) {
        var projection = new BMap.MercatorProjection();
        var point = projection.lngLatToPoint(
            new BMap.Point(latLng.lng, latLng.lat)
        );
        leafletPoint = new L.Point(point.x, point.y);
        return leafletPoint;
    },

    unproject: function (bpoint) {
        var projection= new BMap.MercatorProjection();
        var point = projection.pointToLngLat(
            new BMap.Pixel(bpoint.x, bpoint.y)
        );
        console.log(point);
        latLng = new L.LatLng(point.lng, point.lat);
        return latLng;
    },

    bounds: (function () {
        var d = 6378137 * Math.PI;
        return L.bounds([-d, -d], [d, d]); //20037508.342789244
    })()
};

L.BTransformation = function () {
};

L.BTransformation.prototype = {
    MAXZOOM: 18,
    transform: function (point, zoom) {
        return this._transform(point.clone(), zoom);
    },

    _transform: function (point, zoom) {
        point.x = point.x >> (this.MAXZOOM - zoom);
        point.y = point.y >> (this.MAXZOOM - zoom);
        return point;
    },

    untransform: function (point, zoom) {
        point.x = point.x << (this.MAXZOOM - zoom);
        point.y = point.y << (this.MAXZOOM - zoom);
        return point;
    }
};

L.CRS.BEPSG3857 = L.extend({}, L.CRS, {
    latLngToPoint: function (latlng, zoom) { // (LatLng, Number) -> Point
		var projectedPoint = this.projection.project(latlng);
		return this.transformation._transform(projectedPoint, zoom);
	},

    pointToLatLng: function (point, zoom) { // (Point, Number[, Boolean]) -> LatLng
		var untransformedPoint = this.transformation.untransform(point, zoom);
		return this.projection.unproject(untransformedPoint);
	},


    code: 'EPSG:3857',
    projection: L.Projection.BaiduSphericalMercator,

    transformation: new L.BTransformation()
});

L.Baidu = L.TileLayer.extend({
    options: {
        subdomains: ['online1', 'online2', 'online3'],
        attribution: 'Baidu'
    },
    initialize: function (key, options) {
        L.Util.setOptions(this, options);
        this._key = key;
        this._url = 'http://{subdomain}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=pl&udt=20140711';
    },
    point2tile: function(c) {
        var z = this._getZoomForUrl();
        var pixel = Math.floor(c>>(18-z));
        return Math.floor(pixel/256);
    },
    getTileUrl: function(coords) {
        //coords is tile coordinate
        return this._url.replace('{subdomain}', this._getSubdomain(coords))
            .replace('{x}', coords.x)
            .replace('{y}', coords.y)
            .replace('{z}', this._getZoomForUrl());
    }
});

L.baiduLayer = function (key, options) {
    return new L.Baidu(key, options);
};
