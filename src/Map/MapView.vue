<template>
  <div id="map" style="height: 100%; width: 100%"></div>
</template>

<script>
/* eslint-disable no-undef */
import "leaflet/dist/leaflet.css";
//import './leaflet-geopackage'
let map;
//import L from 'vue2-leaflet'
export default {
  name: "MapView",
  components: {},
  data() {
    return { currentFeature: "", sheet: {} };
  },
  props: ["feature-clicked", "geoJsons", "mbtiles"],
  computed: {},
  mounted: function() {
    this.$nextTick(async function() {
      map = L.map("map", {
        zoomSnap: 0,
        zoomDelta: 0.5
      }).setView([28, 119.53], 12);
      // }).setView([30.257, 119.727], 16);
      L.tileLayer("https://mt1.google.cn/vt/lyrs=s&x={x}&y={y}&z={z}", {
        maxZoom: 18,
        tileSize: 256
      }).addTo(map);
      const response = await fetch("map/files.json");
      const files = await response.json();

      this.importMbTiles(files.mbtileses);
      this.importGeoJsons(files.geoJsons);
    });
  },
  methods: {
    async importGeoJsons(names) {
      this.geoJsons.forEach(layer => {
        map.removeLayer(layer.obj);
      });
      this.geoJsons.splice(0);

      for (const name of names) {
        if (name == "") break;
        // eslint-disable-next-line no-unused-vars
        let geoJson = await this.getGeoJson(name);
      }
    },
    async getGeoJson(name) {
      let path = "map/geojson/" + name + ".geojson";
      let response = await fetch(path);
      const data = await response.json();

      path = "map/style/" + name + ".style.json";
      response = await fetch(path);
      const styleJson = await response.json();
      console.log(name);

      let layer = L.geoJSON(data, {
        style: feature => this.getStyle(styleJson, feature),
        onEachFeature: (feature, layer) => {
          this.bindLabel(styleJson, layer, feature, name);
          layer.on("click", () => {
            this.$emit("feature-clicked", feature);
          });
        }
      });
      layer.addTo(map);
      let setVisiable = value => {
        if (value === false) {
          map.removeLayer(layer);
        } else {
          layer.addTo(map);
        }
      };

      let geoJson = { obj: layer, visible: true, name, setVisiable };
      this.geoJsons.push(geoJson);

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
      layer.bindTooltip("<a>" + content + "</a>", {
        permanent: true,
        className: "label-" + layerName,
        offset: [0, 0],
        direction: "center"
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
          if (item.value === property) {
            let symbol = this.getSymbol(item.symbol);

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
        fillOpacity: color.opacity
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
        let mb = L.tileLayer.mbTiles(path, {}).addTo(map);
        mb.on("databaseerror", function(ev) {
          let setVisible = () => {};
          this.mbtiles.push({ name, obj: mb, setVisible });
          console.info("MBTiles DB 错误：" + path, ev);
        });
      }
    }
  }
};
</script>