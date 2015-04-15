#leaflet-baidu#

An on-going plugin for leaflet with Baidu Map.

##Why this plugin?##
Baidu map is using a different coordinate system and a different algorithm to calculate tile coordinate. Inspired by another [leaflet plugin](https://github.com/shramov/leaflet-plugins) by [Pavel Shramov](https://github.com/shramov) and [Bruno B](https://github.com/brunob). It is dedicated for Google, Bing, and Yandex map.

##Contributing to the code##
I have created several tickets in the issue list with "help wanted" labels. If you have any idea, please do not hesitate leave a comment or make a pull request. **All advices are appreciated.**  
It would be great if you create the branch accordingly: fix_***number of issue***.  
It would also be great if you create commit message accordingly: re #***number of issue***: ***your commit message***

##How Does Baidu Map Work?##
Basically, there are 4 kinds of coordinate need to know: Longitude and Latitude, point coordinate, pixel coordiante, tile coordinate. In the following demostration, I will use the coordinate of Tian'an Men(116.404, 39.915) in Baidu coordinate system.

###Longitude and Latitude###
The coordinate Baidu Map using is different from WGS84, which is general international standards. One layer encryption is required by the Chinese goverment, which is called GCJ-02. Moreover, Baidu Map encrypts another layer called BD-09 based on GCJ-02. [Here's an interface to convert those coordinates.](http://www.zdoz.net/apiList.html) 

###Point Coordinate###
Baidu Map uses Mercator projection. The difference between Baidu Map and other maps in projection is the range of latitude. Google map will project the earth to a square, latitude is roughly from -85 to 85; whereas baidu map projects the earth from -71.988531 to 74.000022. This coordinate convertion is managed by a class called BMap from Baidu.
```javascript
var projection = new BMap.MercatorProjection();
var point = projection.lngLatToPoint(new BMap.Point(116.404, 39.915));
alert(point.x + ", " + point.y);
//results: 12958175, 4825923.77
```
An image to show point coordinate:  
![point coordinate](http://pic002.cnblogs.com/images/2011/308287/2011070216261345.png)

###Pixel Coordinate###
Formula: pixel\_coordinate = |point\_coordinate \* 2^(zoom-18)|. *If you how to make math equation in markdown feel free to make a pull request.*  
18 is the Max Zoom level of Baidu map. The pixel coordinate of Tian'an Men in Zoom Level 4 in Baidu Map is 790, 294.  
![pixel coordinate](http://pic002.cnblogs.com/images/2011/308287/2011070216561045.jpg)

###Tile Coordinate###
Formula: tile\_coordinate = |pixel\_coordinate/256|  
256 is the size of the tile height and width in Baidu Map. For instance, the tile coordinate of Tian'an Men in zoom level 4 is 3,1, and 50617, 18851 in zoom level 18.  
![tile coordinate](http://pic002.cnblogs.com/images/2011/308287/2011070217022613.png)

###Chinese Documentation###
The coordinate system is cited from [Here](http://www.zdoz.net/apiList.html). Here's more details in Chinese.

##Contact##
My email is <surezeroleo@gmail.com>. Again, **all advices are appreciated**.
