import { createRouter, createWebHistory } from 'vue-router';
import SignIn from '../pages/Sign-in.vue';
import SignUp from '../pages/Sign-up.vue';
import Home from '../pages/Home.vue';
import App from '../App.vue';
import OpenStreetMap from '@/components/OpenStreetMap.vue';
import API from '@/api.ts';
import { showAlert } from '@/alertService.ts';

const routes = [
  {
    path: '/sign-in',
    name: 'SignIn',
    component: SignIn,
  },
  {
    path: '/sign-up',
    name: 'SignUp',
    component: SignUp,
  },
  {
    path: '/',
    component: App,
    children: [
      { path: '', component: Home, name: 'App' },
      { path: '/map', name: 'OpenStreetMap', component: OpenStreetMap },
    ],
  },
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Add navigation guard on the router, not on routes
router.beforeEach(async (to, from, next) => {
  const protectedRoutes = ["OpenStreetMap", "App"]; // adjust to your protected routes
  const isProtected = protectedRoutes.includes(to.name as string);

  if (isProtected) {
    try {
      // quick call to check session
      await API.get("/check-session");
      next(); // session is alive
    } catch {
      // session expired
      showAlert({ type: "error", messageKey: "sessionExpired" });
      next({ name: "SignIn" });
    }
  } else {
    next(); // public page
  }
});

export default router;
