import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [

  {
    path: '/',
    redirect: '/login'
  },

  {
    path: '/login',
    component: () => import('../components/Login.vue')
  },

  {
    path: '/home',
    component: () => import('../components/Home.vue'),
    redirect: '/home/welcome',
    children: [
      {
        path: 'welcome',
        component: () => import('../components/Welcome.vue')
      },
      {
        path: 'users',
        component: () => import('../components/Users/Users.vue')
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    return next()
  }
  const token = sessionStorage.getItem('token')
  if (token) {
    next()
  } else {
    next('/login')
  }
})

export default router
