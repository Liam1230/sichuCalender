<template>
  <v-layout justify-center row wrap>
    <template class="column is-half" v-for="post in posts">
      <transition :key="post.id">         
          <newsCards :post="post" />
      </transition>
    </template>
  </v-layout>
</template>

<script>
  import newsCards from '~/components/NewsCard.vue'

  export default {
    components:{
      newsCards
    },
    props: ['posts'],
    methods: {
    }
  }
</script>

<style scoped>
.preview-card{
  width:300px;
  height: 300px;
}
</style>