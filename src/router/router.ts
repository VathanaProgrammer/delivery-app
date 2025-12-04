import { createRouter, createWebHistory } from 'vue-router';
import SignIn from '../pages/Sign-in.vue';
import SignUp from '../pages/Sign-up.vue';
import Home from '../pages/Home.vue';
import App from '../App.vue';
import OpenStreetMap from '@/components/OpenStreetMap.vue';
const routes = [
    {
        path: '/sign-in',
        name: 'SignIn',
        component: SignIn,
    }, {
        path: '/sign-up',
        name: 'SignUp',
        component: SignUp,
    }, {
        path: '/',
        component: App,
        children: [
            { path: '', component: Home, name: 'App', },
            {
                path: '/map',
                name: 'OpenStreetMap',
                component: OpenStreetMap,
            }

        ]
    },
];

export default createRouter({
    history: createWebHistory(),
    routes,
});