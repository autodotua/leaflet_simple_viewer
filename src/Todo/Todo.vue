
<template>
  <div id="app">
    <el-container>
      <el-main>
        <el-collapse accordion v-model="expanding" >
          <el-collapse-item title="正在进行" name="1">
            <List :todoList="doingList" :done="false"></List>
          </el-collapse-item>
          <el-collapse-item title="已完成" name="2">
            <List :todoList="doneList" :done="true"></List>
          </el-collapse-item>
        </el-collapse>
      </el-main>
      <el-footer>
        <el-input
          placeholder="请输入内容"
          @keyup.enter.native="btnAddClick"
          v-model="input"
          class="input-with-select"
        >
          <el-button slot="append" icon="el-icon-arrow-right" @click="btnAddClick"></el-button>
        </el-input>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import List from "./List";
export default {
  name: "App",
  components: { List },
  data: () => {
    return {
      expanding:"1",
      input: "",
      todoList: [
        {
          id: Date.now(),
          done: false,
          content:
            "测试能否接受你快放开得了神经病艰苦撒旦那就多久啊是你看电脑卡死你考虑的看到那是看到你库拉索尼考虑到你看思考的是看看电脑上看看到卡死可能侃大山看",
          time: Date.now()
        },
        { id: Date.now() + 1, done: false, content: "测试2", time: Date.now() }
      ]
    };
  },
  computed: {
    doingList: function() {
      return this.todoList.filter(p => p.done === false);
    },
    doneList: function() {
      return this.todoList.filter(p => p.done);
    }
  },
  methods: {
    btnAddClick() {
      this.todoList.push({
        id: Date.now(),
        done: false,
        content: this.input,
        time: Date.now()
      });
      this.input='';
      this.expanding="1";
    }
  }
};
</script>
<style scoped>
.el-container {
  height: 100%;
}
</style>
