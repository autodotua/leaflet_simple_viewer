<template>
  <div id="map" style="height: 100%; width: 100%"></div>
</template>

<script>
/* eslint-disable no-unused-vars */

/* eslint-disable no-undef */
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../Map/Leaflet.VectorGrid";
import "../Map/Leaflet.TileLayer.MBTiles";
import "jsts";
import STRtree from "jsts/org/locationtech/jts/index/strtree/STRtree";
import Envelope from "jsts/org/locationtech/jts/geom/Envelope";
import Point from "jsts/org/locationtech/jts/geom/Point";
import GeometryFactory from "jsts/org/locationtech/jts/geom/GeometryFactory";
import GeoJSONReader from "jsts/org/locationtech/jts/io/GeoJSONReader";
import WKTReader from "jsts/org/locationtech/jts/io/WKTReader";
import Polygon from "jsts/org/locationtech/jts/geom/Polygon";
import Coordinate from "jsts/org/locationtech/jts/geom/Coordinate";
import "jsts/org/locationtech/jts/monkey";
// import '../Map/Leaflet.shapefile'
// import PDFLayer from "../Map/PDFLayer";
//import './leaflet-geopackage'
// let map;
//import L from 'vue2-leaflet'
export default {
  name: "MapView",
  components: {},
  data() {
    return {
      currentFeature: "",
      sheet: {},
      map: null,
      location: null,
      tree: null,
      jstsGeoms: []
    };
  },
  props: ["feature-clicked", "geoJsons", "mbtiles", "slices"],
  computed: {},
  mounted: function() {
    this.$nextTick(async function() {
      this.map = L.map("map", {
        zoomSnap: 0,
        zoomDelta: 0.5
        // }).setView([30.8, 120], 12);
      }).setView([28, 119.53], 12);
      // }).setView([30.257, 119.727], 16);
      L.tileLayer("https://mt1.google.cn/vt/lyrs=s&x={x}&y={y}&z={z}", {
        maxZoom: 18,
        tileSize: 256
      }).addTo(this.map);
      const response = await fetch("map/files.json");
      const files = await response.json();
      // new L.Shapefile("map/小班2.shp").addTo(this.map);
      this.importMbTiles(files.Mbtileses);

      // return;
      // eslint-disable-next-line no-unreachable
      this.importGeoJsons(files.GeoJsons);
      // this.importSlices(files.Slices);

      // this.importPDFs([]);
      this.map.on("click", e => {
        const x = e.latlng.lng;
        const y = e.latlng.lat;
        console.log(new Envelope(x - 1e-5, x + 1e-5, y - 1e-5, y + 1e-5));
        // let p = new Point(x,y);
        //  for (const f of this.jstsGeoms) {

        //     f.geometry._SRID=4326;
        //     // if (f.geometry.contains(p)) {
        //     //   console.log("containse!");
        //     // }
        //   }
        const env=new Envelope(x - 1e-3, x + 1e-3, y - 1e-3, y + 1e-3);
        const hits = this.tree.query(env);
        if (hits.array_.length > 0) {
          console.log("POINT ( "+x+" "+y+" )");
          
          // let point=new WKTReader.read("POINT ( "+x+" "+y+" )")
          let point=new GeometryFactory().createPoint(new Coordinate(x,y))
          for (const f of hits.array_) {
            console.log(f.geometry);
            console.log(point);
            
            if (f.geometry.contains(point)) {
              this.$emit("feature-clicked", f);
            }
          }
        }
      });
      this.map.on("moveend", async () => {
        if (this.map.getZoom() > 13) {
          let latLng = this.map.getCenter();
          let x = latLng.lng;
          let y = latLng.lat;
          for (const slice of files.Slices) {
            if (
              slice.XMin < x &&
              slice.XMax > x &&
              slice.YMin < y &&
              slice.YMax > y
            ) {
              if (this.slices.some(p => p.name == slice.Name)) {
                return;
              }
              let geoJson = await this.getGeoJson(slice.Name);
              this.slices.push(geoJson);
              break;
            }
          }
          // Object.keys(files.sliceExtends).forEach(async key => {
          //   if (ok) {
          //     return;
          //   }

          //   if (this.slices.some(p => p.name == key)) {
          //     return;
          //   }
          //   let env = files.sliceExtends[key];
          //   if (env.XMin < x && env.XMax > x && env.YMin < y && env.YMax > y) {
          //     let geoJson = await this.getGeoJson(key);
          //     console.log(this.slices);
          //     this.slices.push(geoJson);
          //     ok = true;
          //     return;
          //   }
          // });
        }
      });
    });
  },
  methods: {
    importPDFs(names) {
      new PDFLayer({
        pdf: "map/宁波乡镇2.pdf",
        page: 1,
        minZoom: this.map.getMinZoom(),
        maxZoom: this.map.getMaxZoom(),
        bounds: new L.LatLngBounds([31, 121], [29, 122]),
        attribution:
          '<a href="https://census.gov/newsroom/press-releases/2017/cb17-100.html">U.S. Census Bureau</a>'
      }).addTo(this.map);
    },
    async importGeoJsons(names) {
      this.geoJsons.forEach(layer => {
        this.map.removeLayer(layer.obj);
      });
      this.geoJsons.splice(0);

      for (const name of names) {
        if (name == "") break;
        let geoJson = await this.getGeoJson(name);
        // this.geoJsons.push(geoJson);
      }
    },
    async importSlices(slices) {
      if (this.slices) {
        this.slices.forEach(layer => {
          this.map.removeLayer(layer.obj);
        });
        this.slices.splice(0);
      }
      // console.log(slices);
      let slice = slices[0];
      let geoJson = this.getGeoJson(slice.LayerName, slices, 0);
      this.slices.push(geoJson);
    },
    async getGeoJson(name, slices = null, sliceIndex = 0) {
      let path = "map/geojson/" + name + ".geojson";
      console.log("开始加载地图：" + path);
      // for (const f of data.features) {
      //   const jstsGeom = new jsts.io.GeoJSONReader().read(f);
      //   console.log(jstsGeom);
      // }
      // console.log(jstsGeoms);
      let response = await fetch(path);
      const data = await response.json();
      this.jstsGeoms = new GeoJSONReader().read(data).features;

      console.log(this.jstsGeoms);
      this.tree = new STRtree();
      for (const f of this.jstsGeoms) {
        this.tree.insert(f.geometry.computeEnvelopeInternal(), f);
      }
      this.tree.build();

      path = "map/style/" + name + ".style.json";
      response = await fetch(path);
      const styleJson = await response.json();
      console.log("结束加载地图：" + path);

      // eslint-disable-next-line no-constant-condition
      if (true) {
        return;
      }
      let layer = L.geoJSON(data, {
        style: feature => this.getStyle(styleJson, feature),
        onEachFeature: (feature, layer) => {
          try {
            this.bindLabel(styleJson, layer, feature, name);
          } catch (error) {
            console.log(error);
          }

          layer.on("click", async () => {
            if (slices && slices.length > sliceIndex + 1) {
              let value = feature.properties[slices[sliceIndex].LowField];
              // let value = Object.values(feature.properties)[0];
              let geoJson = await this.getGeoJson(
                slices[sliceIndex + 1].LayerName + "_" + value,
                slices,
                sliceIndex + 1
              );
              this.slices.push(geoJson);
              return;
            }
            this.$emit("feature-clicked", feature);
          });
        }
      });
      layer.addTo(this.map);
      let setVisiable = value => {
        if (value === false) {
          this.map.removeLayer(layer);
        } else {
          layer.addTo(this.map);
        }
      };

      let geoJson = { obj: layer, visible: true, name, setVisiable };
      //this.geoJsons.push(geoJson);

      return geoJson;
    },
    bindLabel(styleJson, layer, feature, layerName) {
      if (this.sheet[layerName] == undefined) {
        let sheet = this.createStyleSheet(layerName);
        let color = this.getColor(styleJson.label.symbol.color);
        let fontSize = styleJson.label.symbol.font.size * 1.5;
        let borderSize = styleJson.label.symbol.haloSize * 1.5;
        let borderColor = this.getColor(styleJson.label.symbol.haloColor);
        sheet.insertRule(
          `.label-${layerName}{
        background: none;
        border:none;
        box-shadow: none;
        }`,
          0
        );
        sheet.insertRule(
          `.label-${layerName}::before{
        display:none;
        }`,
          0
        );
        sheet.insertRule(
          `.label-${layerName} a{
        font-size:${fontSize}px;
        color:${color.color};
         text-shadow:  0 0 ${borderSize}px ${borderColor.color};
        }`,
          0
        );
      }

      //先在最后加一个空格，然后到时候替换的时候可以用来识别字段的结束
      let content = styleJson.label.labelExpressionInfo.expression + " ";
      for (const key in feature.properties) {
        content = content.replace(
          "$feature." + key + " ",
          feature.properties[key]
        );
      }
      this.map.on("moveend", () => {
        let zoom = this.map.getZoom();
        if (zoom > 15 && layer.getTooltip() == undefined) {
          layer.bindTooltip("<a>" + content + "</a>", {
            permanent: true,
            className: "label-" + layerName,
            offset: [0, 0],
            direction: "center"
          });
          console.log("bind");
        } else if (zoom <= 15 && layer.getTooltip() != undefined) {
          layer.unbindTooltip();
          console.log("unbind");
        }
      });
    },
    createStyleSheet(layerName) {
      var style = document.createElement("style");
      style.type = "text/css";
      document.head.appendChild(style);
      this.sheet[layerName] = style.sheet;
      return style.sheet;
    },
    // eslint-disable-next-line no-unused-vars
    getStyle(styleJson, feature) {
      let renderer = styleJson.renderer;
      if (renderer.field1) {
        let property = feature.properties[renderer.field1];
        for (const item of renderer.uniqueValueInfos) {
          // console.log(item);
          // console.log(feature);

          if (item.value === property) {
            let symbol = this.getSymbol(item.symbol);
            // console.log("symbol is:");
            // console.log(symbol);

            return symbol;
          }
        }
      }
      return renderer.defaultSymbol
        ? this.getSymbol(renderer.defaultSymbol)
        : null;
    },
    getSymbol(json) {
      let color = this.getColor(json.color);
      let outlineColor = this.getColor(json.outline.color);
      let outlineWidth = json.outline.width;
      return {
        color: outlineColor.color,
        fillColor: color.color,
        weight: outlineWidth * 2,
        fillOpacity: color.opacity,
        fill: true
      };
    },
    getColor(rgba) {
      let r = rgba[0];
      let g = rgba[1];
      let b = rgba[2];
      let a = rgba[3];
      let d2h = this.decimalToHex;
      return { color: "#" + d2h(r) + d2h(g) + d2h(b), opacity: a / 256.0 };
    },
    decimalToHex(d, padding = 2) {
      var hex = Number(d).toString(16);

      while (hex.length < padding) {
        hex = "0" + hex;
      }

      return hex;
    },
    importMbTiles(names) {
      for (const name of names) {
        let path = "map/mbtiles/" + name + ".mbtiles";
        let mb = L.tileLayer.mbTiles(path, {}).addTo(this.map);

        mb.on("databaseloaded", function(ev) {
          console.log("MBTiles DB 已加载：" + path, ev);
        });
        mb.on("databaseerror", function(ev) {
          console.log("MBTiles DB 错误：" + path, ev);
        });
      }
    },
    locate() {
      this.map.locate({
        setView: true,
        maxZoom: 16
      });
      this.map.on("locationfound", e => {
        var radius = e.accuracy / 2;
        // L.marker(e.latlng)
        //   .addTo(this.map)
        //   .bindPopup("当前位置");
        if (this.location) {
          this.map.removeLayer(this.loacation);
        }
        this.loacation = L.circle(e.latlng, radius).addTo(this.map);
      });

      this.map.on("locationerror", function(e) {
        this.$notify({
          title: "定位",
          message: "定位失败：" + e
        });
      });
    }
  }
};
</script>