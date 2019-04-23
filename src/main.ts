import CourseAdmin from '@/components/course_admin/course_admin.vue';
import CourseList from '@/components/course_list/course_list.vue';
import ProjectAdmin from '@/components/project_admin/project_admin.vue';
import ProjectSubmission from '@/components/project_submission/project_submission.vue';
import UIDemos from '@/demos/ui_demos.vue';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Vue from 'vue';
import VueRouter from 'vue-router';

import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(VueRouter);

const ROUTES = [
    { path: '/', name: "course_list", component: CourseList },
    { path: '/web/course_admin/:course_id', name: "course_admin", component: CourseAdmin },
    { path: '/web/project_admin/:project_id', name: 'project_admin', component: ProjectAdmin },
    { path: '/web/project/:project_id', component: ProjectSubmission },
    { path: '/__demos__', component: UIDemos }
];

const ROUTER = new VueRouter ({
    routes: ROUTES,
    mode: 'history'
});

new Vue({
    router: ROUTER,
    render: h => h(App)
}).$mount('#app');
