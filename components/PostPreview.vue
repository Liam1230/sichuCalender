<template>
  <section class="section container">
    <div class="columns is-multiline">
      <v-layout>
        <template class="column is-half" v-for="post in posts">
          <transition :key="post.id">
            <v-card class="my-5 mx-2 preview-card"  v-scroll="handleScroll">
              <v-card-title>
                {{ post.fields.title }}
              </v-card-title>
              <v-card-text>
                {{ post.fields.description }}
                <br>
                <small>{{ ( new Date(post.fields.publishDate)).toDateString() }}</small>
              </v-card-text>
              <v-card-actions>
                <nuxt-link :to="{ name: 'posts-slug', params: { slug: post.fields.slug }}" class="card-footer-item">
                  Read More
                </nuxt-link>
              </v-card-actions>
            </v-card>
          </transition>
        </template>
      </v-layout>
    </div>
  </section>
</template>

<script>
  export default {
    props: ['posts'],
    methods: {
      handleScroll: function(evt, el) {
        // console.log(el);
        // if (window.scrollY > 50) {
        //   el.setAttribute(
        //     "style",
        //     "opacity: 1; transform: translateY(0);"
        //   );
        // }
        // return window.scrollY > 100;
      }
    }
  }
</script>

<style scoped>
.preview-card{
  width:300px;
  height: 300px;
}
</style>