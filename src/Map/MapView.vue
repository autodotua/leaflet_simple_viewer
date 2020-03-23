<template>
  <div id="map" style="height: 100%; width: 100%"></div>
</template>

<script>
/* eslint-disable no-undef */
import "leaflet/dist/leaflet.css";
let map;
//import L from 'vue2-leaflet'
export default {
  name: "MapView",
  components: {},
  data() {
    return { currentFeature: "" };
  },
  props: ["feature-clicked", "geoJsons"],
  computed: {},
  mounted: function() {
    this.$nextTick(async function() {
      map = L.map("map", {
        zoomSnap: 0,
        zoomDelta: 0.5
      }).setView([30.257, 119.727], 16);
      L.tileLayer("https://mt1.google.cn/vt/lyrs=s&x={x}&y={y}&z={z}", {
        maxZoom: 18,
        tileSize: 256
      }).addTo(map);

      importMbTiles(map);
      const response = await fetch("map/files.txt");
      const data = await response.text();
      for (const name of data.split(["\n"])) {
        if (name == "") break;
        // eslint-disable-next-line no-unused-vars
        let geoJson = await this.getGeoJson(name);
        console.log(geoJson);
      }
    });
  },
  methods: {
    async getGeoJson(name) {
      let path = "map/geojson/" + name + ".geojson";
      let response = await fetch(path);
      const data = await response.json();

      path = "map/style/" + name + ".style.json";
      response = await fetch(path);
      const styleJson = await response.json();

      let layer = L.geoJSON(data, {
        style: feature => this.getStyle(styleJson, feature),
        onEachFeature: (feature, layer) => {
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
    // eslint-disable-next-line no-unused-vars
    getStyle(styleJson, feature) {
      let renderer = styleJson.renderer;
      if (renderer.field1) {
        let property = feature.properties[renderer.field1];
        for (const item of renderer.uniqueValueInfos) {
          if (item.value === property) {
            return this.getSymbol(item.symbol);
          }
        }
      }
      return this.getSymbol(renderer.defaultSymbol);
    },
    getSymbol(json) {
      let color = this.getColor(json.color);
      let outlineColor = this.getColor(json.outline.color);
      let outlineWidth = json.outline.width;
      return {
        color: outlineColor,
        fillColor: color,
        weight: outlineWidth
      };
    },
    getColor(rgba) {
      let r = rgba[0];
      let g = rgba[1];
      let b = rgba[2];
      // let a = rgba[3];
      let d2h = this.decimalToHex;
      return "#" + d2h(r) + d2h(g) + d2h(b);
    },
    decimalToHex(d, padding = 2) {
      var hex = Number(d).toString(16);
      padding =
        typeof padding === "undefined" || padding === null
          ? (padding = 2)
          : padding;

      while (hex.length < padding) {
        hex = "0" + hex;
      }

      return hex;
    }
  }
};

function importMbTiles(map) {
  let mb = L.tileLayer.mbTiles("map/google2tiles2.mbtiles", {}).addTo(map);
  map.removeLayer(mb);
  mb.on("databaseloaded", function(ev) {
    console.info("MBTiles DB 已加载", ev);
  });
  mb.on("databaseerror", function(ev) {
    console.info("MBTiles DB 错误", ev);
  });
}
</script>