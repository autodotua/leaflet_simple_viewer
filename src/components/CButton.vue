<template>
  <button 
  @click="$emit('c')"
   v-on:click="count++">{{getText()}}</button>
</template>
<script>
export default {
  name: "button-counter",
  props: ["text"],
  data: function() {
    return {
      count: 0
    };
  },
  methods: {
    getText() {
      return this.text.replace("{count}", this.count);
    }
  }
};
</script>