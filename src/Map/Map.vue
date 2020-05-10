

<template>
  <div style="width:100%;height:100%">
    <MapView
      ref="mapRef"
      @feature-clicked="featureClicked"
      :geoJsons="geoJsons"
      :slices="slices"
      :mbtiles="mbtiles"
    ></MapView>
    <el-drawer title="属性表" :visible.sync="drawer" direction="ltr" :size="drawerSize">
      <el-table :data="properties" stripe :style="{width:drawerSize}">
        <el-table-column prop="key" label="属性名" width="100"></el-table-column>
        <el-table-column prop="value" label="属性值" min-width="50"></el-table-column>
      </el-table>
    </el-drawer>
    <div class="float-btn-group">
      <!-- <el-popover class="layer-popup" placement="left" title="图层" width="200" trigger="click">
        <draggable @change="layerMoved" :list="geoJsons">
          <div class="layer-li" v-for="layer in mbtiles" :key="layer.obj.id">
            <el-checkbox v-model="layer.visible" @change="layer.setVisiable($event)">{{layer.name}}</el-checkbox>
          </div>
        </draggable>
        <br />
        <a>矢量图</a>
        <draggable @change="layerMoved" :list="geoJsons">
          <div class="layer-li" v-for="layer in geoJsons" :key="layer.name">
            <el-checkbox v-model="layer.visible" @change="layer.setVisiable($event)">{{layer.name}}</el-checkbox>
          </div>
        </draggable>
        <draggable @change="layerMoved" :list="slices">
          <div class="layer-li" v-for="layer in slices" :key="layer.name">
            <el-checkbox v-model="layer.visible" @change="layer.setVisiable($event)">{{layer.name}}</el-checkbox>
          </div>
        </draggable>

        <el-button class="float-btn" slot="reference">
          <img src="icon/layer.svg" />
        </el-button>
      </el-popover>
      <br />
      <br />-->
      <el-button class="float-btn" @click="locate">
        <img src="icon/locate.svg" />
      </el-button>
      <br />
      <br />
      <el-button class="float-btn" @click="track">
        <img src="icon/track.svg" />
      </el-button>
    </div>
  </div>
</template>

<script>
import MapView from "./MapView";
import { Notification } from "element-ui";
// import draggable from "vuedraggable";
export default {
  name: "Map",
  components: { MapView /*, draggable*/ },
  data() {
    return {
      drawer: false,
      drawerSize: "360px",
      properties: [],
      geoJsons: [],
      mbtiles: [],
      slices: [],
      isTracking: false,
      locationWatcherID: 0
    };
  },
  computed: {},
  mounted: function() {
    this.$nextTick(async function() {});
  },
  methods: {
    featureClicked(e) {
      console.log("clicked");

      this.properties = [];
      for (const key in e.properties) {
        const value = e.properties[key];
        this.properties.push({ key, value });
      }
      this.drawer = true;
    },
    layerMoved() {
      this.$refs.mapRef.importGeoJsons();
    },
    locate() {
      this.$refs.mapRef.locate();
    },
    track() {
      Notification.success({ message: "开始记录轨迹" });
      if (this.isTracking) {
        this.isTracking = false;

        Notification.success({ message: "停止记录轨迹" });
        this.$refs.mapRef.stopTracking();
        navigator.geolocation.clearWatch(this.locationWatcherID);
        return;
      }
      this.isTracking = true;
      this.locationWatcherID = navigator.geolocation.watchPosition(pos => {
        this.$refs.mapRef.updateCoords(pos.coords);
      });

      //以下仅为测试用
      // let lat = 30;
      // let lng = 120;
      // setInterval(() => {
      //   lat += 0.001;
      //   lng += 0.001;
      //   this.$refs.mapRef.updateCoords({ latitude: lat, longitude: lng });
      // }, 1000);
    }
  }
};
</script>
<style >
.el-drawer__body {
  overflow-y: auto;
  height: 100%;
}
.float-btn-group {
  position: absolute;
  right: 20px;
  bottom: 40%;
  z-index: 1000;
}
.layer-popup {
  position: absolute;
  z-index: 1000;
}
.float-btn {
  padding: 4px 6px !important;
}
.float-btn img {
  width: 24px;
  height: 24px;
}
.layer-li {
  list-style: none;
}
</style>