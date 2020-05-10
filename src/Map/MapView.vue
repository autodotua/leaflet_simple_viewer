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
import { Notification } from "element-ui";
export default {
  name: "MapView",
  components: {},
  data() {
    return {
      currentFeature: "",
      sheet: {},
      map: null,
      location: null,
      trees: [],
      jstsGeoms: [],
      files: {},
      trackPoints: [],
      trackLines: []
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
      this.files = files;

      this.importMbTiles(files.Mbtileses);
      this.importXYZs(files.XYZs);
      // return;
      // eslint-disable-next-line no-unreachable

      this.map.on("click", this.onMapClick);
    });
  },
  methods: {
    async onMapClick(e) {
      const x = e.latlng.lng;
      const y = e.latlng.lat;
      let trees = [];
      for (const t of this.trees) {
        let s = t.slice;
        if (s.XMin < x && s.XMax > x && s.YMin < y && s.YMax > y) {
          trees.push(t.tree);
        }
      }
      if (trees.length == 0) {
        //寻找合适的GeoJson，建立tree
        for (const slice of files.Slices) {
          if (
            slice.XMin < x &&
            slice.XMax > x &&
            slice.YMin < y &&
            slice.YMax > y
          ) {
            console.log("加载" + "map/geojsons/" + slice.Name + ".geojson");

            let response = await fetch(
              "map/geojson/" + slice.Name + ".geojson"
            );
            const data = await response.json();
            this.jstsGeoms = new GeoJSONReader().read(data).features;
            let t = new STRtree();
            for (const f of this.jstsGeoms) {
              t.insert(f.geometry.computeEnvelopeInternal(), f);
            }
            t.build();
            trees.push(t);
            this.trees.push({ tree: t, slice: slice });
          }
        }
      }
      const env = new Envelope(x - 1e-3, x + 1e-3, y - 1e-3, y + 1e-3);
      let point = new GeometryFactory().createPoint(new Coordinate(x, y));
      let ok = false;
      for (const tree of trees) {
        if (ok) {
          break;
        }
        const hits = tree.query(env);
        if (hits.array_.length > 0) {
          for (const f of hits.array_) {
            if (f.geometry.contains(point)) {
              this.$emit("feature-clicked", f);
              ok = true;
              break;
            }
          }
        }
      }
    },
    importXYZs(names) {
      for (const name of names) {
        if (name == "") break;
        L.tileLayer("map/xyz/" + name + "/{z}/{x}/{y}.jpg", {
          maxZoom: 16,
          tileSize: 256
        }).addTo(this.map);
      }
    },
    async importGeoJsons(names) {
      this.geoJsons.forEach(layer => {
        this.map.removeLayer(layer.obj);
      });
      this.geoJsons.splice(0);

      for (const name of names) {
        if (name == "") break;
        let geoJson = await this.getGeoJson(name);
      }
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
        if (this.location) {
          this.map.removeLayer(this.loacation);
        }
        this.loacation = L.circle(e.latlng, radius).addTo(this.map);
      });

      this.map.on("locationerror", function(e) {
        Notification.error({
          title: "定位",
          message: "定位失败：" + e.message
        });
        console.log(e);
      });
    },
    updateCoords(coords) {
      console.log(this.trackPoints);
      if (this.trackPoints.length > 0) {
        let last = this.trackPoints[this.trackPoints.length - 1];
        let line = L.polyline([
          [last.latitude, last.longitude],
          [coords.latitude, coords.longitude]
        ]).addTo(this.map);
      }
      this.trackPoints.push(coords);
      //L.circle([coords.latitude, coords.longitude], 20).addTo(this.map);
    },
    stopTracking() {
      for (const line of this.trackLines) {
        this.map.removeLayer(line);
      }
      this.trackPoints.length = 0;
      this.trackLines.length = 0;
    }
  }
};
</script>