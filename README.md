# 简易地图浏览器

## 开发相关

### Shp转GeoJson

很可能是因为NTS的BUG，在读取shapefile的dbf文件时，指定编码无效（包括构造函数和设置默认编码的静态属性）。需要在*.shp同级


### leaflet相关

- leaflet图层没有Visible选项，因此当设置图层不可见时，直接移除图层

## 使用相关
### 关于GeoJSON

- 性能较差，超过2MB的文件会有可感知操作延迟
- 文件较大，大约是相同Shapefile的10倍大小
- 仅支持WGS84坐标系



## 待解决的问题
### GeoJson转换问题
- 问题：NTS的GeoJson转换器或Shapefile的Reader有BUG，部分shapefile无法完整转换，部分Shapefile转换后无法读取。
- 解决方案：
  1. 使用C#重写Shapefile转GeoJson的方法

### Leaflet支持Geopackage问题
- 问题：Leaflet-Geopackage的包无法安装
- 解决方案：
  - 放弃Geopackage的支持
  - 使用C#重写Geopackage转mbtiles的方法
  - 使用QGIS进行导出/转换


