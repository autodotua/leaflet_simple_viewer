

<template>
  <div style="width:100%;height:100%">
    <MapView @feature-clicked="featureClicked" :geoJsons="geoJsons"></MapView>
    <el-drawer title="属性表" :visible.sync="drawer" direction="ltr" :size="drawerSize">
      <el-table :data="properties" stripe :style="{width:drawerSize}">
        <el-table-column prop="key" label="属性名" width="100"></el-table-column>
        <el-table-column prop="value" label="属性值" min-width="50"></el-table-column>
      </el-table>
    </el-drawer>

    <el-popover class="layer-popup" placement="left" title="标题" width="200" trigger="click">
      <div>
        <li class="layer-li" v-for="layer in geoJsons" :key="layer.obj.id">
          <el-checkbox v-model="layer.visible" @change="layer.setVisiable($event)"> {{layer.name}}</el-checkbox>
        </li>
      </div>

      <el-button class="icon-btn" slot="reference">
        <img src="icon/layer.svg" />
      </el-button>
    </el-popover>
  </div>
</template>

<script>
import MapView from "./MapView";
export default {
  name: "Map",
  components: { MapView },
  data() {
    return {
      drawer: false,
      drawerSize: "360px",
      properties: [],
      geoJsons: []
    };
  },
  computed: {},
  mounted: function() {
    this.$nextTick(async function() {});
  },
  methods: {
    featureClicked(e) {
      this.properties = [];
      for (const key in e.properties) {
        const value = e.properties[key];
        this.properties.push({ key, value });
      }
      this.drawer = true;
    }
  }
};
</script>
<style >
.el-drawer__body {
  overflow-y: auto;
  height: 100%;
}
.layer-popup {
  position: absolute;
  right: 20px;
  bottom: 40%;
  z-index: 1000;
}
.icon-btn {
  padding: 4px 6px !important;
}
.icon-btn img {
  width: 24px;
  height: 24px;
}
.layer-li{
  list-style: none;
}
</style>