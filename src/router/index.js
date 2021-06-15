import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children:[

    ]
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },{
    path:'/flow',
    name:'Flow',
    component:()=>import('../views/Flow.vue')
  },
  {
    path:'/lisflood',
    name:'Lisflood',
    component:()=>import('../views/lisflood.vue')
  },
  {
    path:'/swmmviewer',
    name:'SWMMViewer',
    component:()=>import('../views/SWMMViewer.vue')
  },
  {
    path:'/lisfloodviewer',
    name:'LisfloodViewer',
    component:()=>import('../views/LisfloodViewer.vue')
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
