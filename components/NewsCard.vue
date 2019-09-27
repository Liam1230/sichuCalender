<template>
    <v-card :color="getColor" class="card mx-5 mb-5">
        <v-flex text-xs-left>
            <nuxt-link :to="{ name: 'posts-slug', params: { slug: post.fields.slug }}" class="card-footer-item">
                <v-layout justify-center wrap fill-height>
                    <v-flex xs12 md12 class="my-0 py-0">
                        <span class="py-0 px-2 news-caption caption font-weight-bold grey--text text--darken-1" color="#a7a9af">{{( new Date(post.fields.publishDate)).toDateString()}}</span>
                    </v-flex>
                    <v-flex xs11 md11 class="my-0 py-0">
                        <v-img class="news-img" :src=post.fields.topimage.fields.file.url></v-img>
                    </v-flex>                    
                    <v-flex xs12 md12 class="my-0 py-0">
                        <v-flex xs12 md12 text-xs-left class="mt-0 mb-2 py-0 headline font-weight-black black--text text--darken-1">
                            {{post.fields.title}}
                        </v-flex>
                        <v-flex xs12 md12 text-xs-left class="my-0 py-0 body-2 grey--text text--darken-1">
                            {{post.fields.descript}}
                        </v-flex>
                    </v-flex>
                </v-layout>
            </nuxt-link>
        </v-flex>
    </v-card>
</template>

<script>
import { promised } from 'q';
export default {
    mounted: function(){
        //console.log(this.post)
    },
    props: ['post'],
    computed: {
        getColor: function () {
            let col = "#E1F5FE";

            if(this.color == "yellow"){
                col = "#eaec8c";
            }
            if(this.color == "blue"){
                col = "#9ed8f6";
            }
            if(this.color == "pink"){
                col = "#f8d2dc"
            }
            return col;
        }
    }
}
</script>

<style>

.card-container{
    display: inline-block;
    
    
}
.news-img{
    height:160px;
}

.news-caption{
    word-break: break-all;
    width:98%;
}

.card {
    border-radius: 2px;
    height: 300px;
    width: 300px;
    box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
    transition: all 0.3s cubic-bezier(.25,.8,.25,1);
}

.card:hover {
    box-shadow: 0 7px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
}

</style>
