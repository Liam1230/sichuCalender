<template>
  <v-tabs class="v-toolbar" background-color="light-blue lighten-2" center-active centered dark :class="{'sticky': position > 0}">
    <!-- <v-tab v-scroll-to="'#business_title'">Business</v-tab> -->
    <v-tab v-scroll-to="'#works_title'">Works</v-tab>
    <v-tab v-scroll-to="'#access_title'">Access</v-tab>
  </v-tabs>
</template>

<script>
export default {
  data: () => ({
    title: null,
    position: 0,
    defpos:0,
    dscrolltop:0,
    bscrolltop:0
  }),

  mounted () {
    document.onscroll = (e) => {
      this.position = document.documentElement.scrollTop || document.body.scrollTop;
      this.dscrolltop = document.documentElement.scrollTop;
      this.bscrolltop = document.body.scrollTop;
    }
  },
  methods: {
  }
}
</script>
<style>
.v-toolbar{
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 3;
}
</style>
