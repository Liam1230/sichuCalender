<template>
<v-container fill-height fill-width fluid grid-list-xl>
  <v-layout justify-center row wrap>
    <v-flex xs12 md12>
      <v-parallax class="toppic" dark src="/toppagebg.jpg">
          <v-row align="center" justify="center">
            <v-expand-transition>
              <p v-show="titleshow" class="text_title display-3 font-weight-bold">Daichi<br>Kinoshita's<br> Work</p>
            </v-expand-transition>
          </v-row>
      </v-parallax>
    </v-flex>
    <CoreToolbar />
    <v-flex xs12 md9>
      <p id="skill_title" class="text-center display-3 font-weight-bold green--text text--accent-3"> Skills</p>
      <v-img src="/skill.png"></v-img>
      <!-- <p class="text-center display-2 font-weight-bold green--text text--accent-3"> HP作成から画像認識まで</p>
      <p class="text-center display-2 font-weight-bold green--text text--accent-3"> Web系を中心にいろいろ触れます！</p>
      <p class="text-center display-1 font-weight-bold green--text text--accent-3"> 気軽にご相談ください！</p> -->
    </v-flex>
    <v-flex xs12 md12>
      <v-divider></v-divider>
      <p id="works_title" class="text-center display-3 font-weight-bold green--text text--accent-3"> Works</p>
      <PostPreview :posts="posts"></PostPreview>
      <p class="text-center display-1 font-weight-bold green--text text--accent-3"> もっと見る</p>
    </v-flex>
  </v-layout>
</v-container>
</template>

<script>
import CoreToolbar from '~/components/Toolbar.vue'
import PostPreview from '~/components/PostPreview.vue'

export default {
	components:{
    CoreToolbar,
    PostPreview
	},
	asyncData(env){
		console.log(env.app)
		return env.app.$contentful.getEntries({
			'content_type': 'blogPost',
			'limit': 3
		}).then(entries => {
			return {
				posts: entries.items
			}
		}).catch(console.error)
  },
  mounted: function(){
    setTimeout(()=>{
      this.titleshow = true;
    }, 800)
    setTimeout(()=>{
      this.titleDescAnim1 = true;
    }, 2000)
    setTimeout(()=>{
      this.titleDescAnim2 = true;
    }, 3200)
    setTimeout(()=>{
      this.titleDescAnim3 = true;
    }, 4400)
  },
	data: ()=>({
    posts:[],
    titleshow: false,
    titleDescAnim1: false,
    titleDescAnim2: false,
    titleDescAnim3: false,
  }),
  methods: {
  }
}
</script>

<style>
.text_title{
    padding: 0.5em 0.7em;
    margin: 1em 0;
    color: #FFF;/*文字色*/
    background: rgba(0,0,0,0);
    border: solid 5px #FFF;/*線*/
    border-radius: 10px;/*角の丸み*/
}
.title_description{
  color: #FFF;/*文字色*/
}
#toolbar{
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 3;
}
</style>