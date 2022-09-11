<template>
  <div class="card-show">
    <p>{{ cardInfo.type }}</p>
    <p>{{ cardInfo.subtype ? cardInfo.subtype : '' }}</p>
  </div>
</template>

<script>
export default {
  name: 'CardShow',
  props: {
    cardInfo: Object,
  },
}
</script>

<style scoped>
.card-show {
  margin: 8px;
  padding: 16px;
  background-color: #cbcbcb;
  border: 0px;
  border-radius: 15px;
  height: 80px;
  width: 70px;
}
</style>
