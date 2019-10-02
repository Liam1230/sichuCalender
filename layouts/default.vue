<template>
  <v-app>
    <v-content>
      <nuxt />
    </v-content>
    <v-footer
      :fixed="fixed"
      app
    >
      <span>&copy; 2019 DaichiKinoshita</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js'
    }
  }
}
</script>
