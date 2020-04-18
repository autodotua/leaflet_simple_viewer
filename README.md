# 简易地图浏览器

## 开发相关

### Shp转GeoJson
>2020年3月23日

很可能是因为NTS的BUG，在读取shapefile的dbf文件时，指定编码无效（包括构造函数和设置默认编码的静态属性）。需要在*.shp同级


### leaflet相关
>2020年3月23日
- leaflet图层没有Visible选项，因此当设置图层不可见时，直接移除图层

## 使用相关
### 关于GeoJSON
>2020年3月23日
- 性能较差，超过2MB的文件会有可感知操作延迟
- 文件较大，大约是相同Shapefile的2倍大小
- 仅支持WGS84坐标系



## 待解决的问题

### GeoJson转换问题
>2020年3月24日

问题：NTS的GeoJson转换器或Shapefile的Reader有BUG，部分shapefile无法完整转换，部分Shapefile转换后无法读取。
解决方案：
  - 使用C#重写Shapefile转GeoJson的方法

### Leaflet支持Geopackage问题
>2020年3月24日

问题：Leaflet-Geopackage的包无法安装

解决方案：
  - 放弃Geopackage的支持
  - 使用C#重写Geopackage转mbtiles的方法
  - 使用QGIS进行导出/转换


## 日志

### 3-21

开始项目

### 3-22

完成对GeoJson和MtTiles格式的读写

### 3-23

基本完好对唯一值渲染器的读取和显示

### 3-27

基本完成显示标签功能

### 3-28

新增定位功能

### 3-30

为适配切分后的图层的适配起了个头

### 4-13

基本适配了新的切片方法

### 4-18

又开始测试又一种新的切片方法