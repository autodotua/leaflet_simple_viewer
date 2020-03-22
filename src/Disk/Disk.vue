
<template>
  <div id="app">
    <el-container>
      <el-main>
        
      </el-main>
      <el-footer>
       
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "App",
  components: {  },
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
