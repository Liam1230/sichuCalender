<template>
  <div class="section">
    <div class="columns is-multiline">
      <div class="column is-half" v-for="post in posts" :key="post">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">
              {{ post.fields.title }}
            </p>
          </header>
          <div class="card-content">
            <div class="content">
              {{ post.fields.description }}
              <br>
              <small>{{ ( new Date(post.fields.publishDate)).toDateString() }}</small>
            </div>
          </div>
          <footer class="card-footer">
            <nuxt-link :to="{ name: 'posts-slug', params: { slug: post.fields.slug }}" class="card-footer-item">
              Read More
            </nuxt-link>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import contentful from '~/plugins/contentful.js'

  const client = contentful.createClient()
  export default {
    head: {
      title: 'Post'
    },
    data () {
      return {
        posts: []
      }
    },
    asyncData ({ env }) {
      return client.getEntries({
        // fetch all blog posts sorted by creation date
        'content_type': env.CTF_BLOG_POST_TYPE_ID,
        //order: '-fields.publishDate'
      }).then(entries => {
        console.log(entries.items)
        return {
          posts: entries.items
        }
      }).catch(console.error)
    }
  }
</script>