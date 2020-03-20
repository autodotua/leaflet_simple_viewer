
<template>
  <el-table
    ref="refTable"
    :data="todoList"
    style="width: 100%"
    :show-header="false"
    @row-click="rowExpand"
  >
    <el-table-column prop="content" show-overflow-tooltip label="内容" min-width="100"></el-table-column>
    <el-table-column prop label="日期" width="100">
      <template scope="scope">{{dateFormat(scope.row.time)}}</template>
    </el-table-column>
    <el-table-column type="expand">
      <template slot-scope="props">
        <div>
          <div class="detail">
            <p>{{props.row.content}}</p>
            <p>{{dateFormat(props.row.time,true)}}</p>
          </div>

          <el-button
            class="btn-done"
            circle
            :type="btnType"
            :icon="btnIcon"
            @click="doneButtonClick($event,props)"
          ></el-button>

          <el-popover placement="bottom" title="更多" trigger="click" style="height:auto;width:48px">
            <div>
              <el-button size="mini" round @click="btnDeleteClick($event,props)">删除</el-button>
              <br />
              <el-button size="mini" round>复制</el-button>
            </div>
            <el-button slot="reference" circle icon="el-icon-more" class="btn-more"></el-button>
          </el-popover>
        </div>
      </template>
    </el-table-column>
    <!-- <el-table-column type="selection" width="55"></el-table-column>   -->
  </el-table>
</template>

<script>
export default {
  name: "App",
  props: ["todoList", "done"],
  data: () => {
    return {};
  },
  computed: {
    btnIcon() {
      return this.done ? "el-icon-back" : "el-icon-finished";
    },
    btnType() {
      return this.done ? "primary" : "success";
    }
  },
  methods: {
    dateFormat: function(time, includeTime = false) {
      var date = new Date(time);
      var year = date.getFullYear();
      var month =
        date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1;
      var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      if (!includeTime) {
        return year + "-" + month + "-" + day;
      } else {
        let hour =
          date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        let min =
          date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        let sec =
          date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        return (
          year + "-" + month + "-" + day + " " + hour + ":" + min + " " + sec
        );
      }
    },
    rowExpand(row) {
      this.$refs.refTable.toggleRowExpansion(row);
    },
    doneButtonClick(e, props) {
      console.log(e);
      props.row.done = !props.row.done;
    },
    btnDeleteClick(e, props) {
      this.$confirm("确认删除？", {
        confirmButtonText: "是",
        cancelButtonText: "否",
        type: "warning"
      }).then(() => {
        const index = this.todoList.indexOf(props.row);
        if (index > -1) {
          this.todoList.splice(index, 1);
        }
      }).catch(()=>{});
      //console.log(this);

      //this.todoList.remove(props.row)
    }
  }
};
</script>
<style>
.el-table__row > td {
  border: none;
}
.el-table--border tr,
td {
  border: none !important;
}
.el-table::before {
  height: 0;
}
.el-table::before {
  height: 0px !important;
}

.btn-done {
  position: absolute;
  right: 20px;
  top: calc(35% - 24px);
}

.btn-more {
  position: absolute;
  right: 20px;
  top: calc(35% + 24px);
  height: 40px;
  width: 40px;
}

.detail {
  float: left;
  margin-right: 48px;
}

.el-table__expanded-cell {
  padding: 8px 16px !important;
}

.el-popover {
  min-width: 48px !important;
}
.el-popover button {
  margin-top: 6px;
  margin-bottom: 6px;
}
</style>