const Home = {
    template : `<h1 style="
    display: flex; 
    justify-content: center; 
    align-items: center; 
    height: 100vh; 
    margin: 0;
">
    Welcome to Housefix! A platform for all your home servicing needs!
</h1>`
}
import login from "../pages/login.js";
import custregister from "../pages/custregister.js";
import profregister from "../pages/profregister.js";
import custdash from "../pages/custdash.js";
import admindash from "../pages/admindash.js";
import profdash from "../pages/profdash.js";
import createservice from "../pages/createservice.js";
import reviews from "../pages/reviews.js";
import myservices from "../pages/myservices.js";
import feedback from "../pages/feedback.js";
import requestdetails from "../pages/requestdetails.js";
import store from "./store.js";

const routes = [
    {path : '/', component : Home},
    {path : '/login', component : login},
    {path : '/custregister', component : custregister},
    {path : '/profregister', component : profregister},
    {path : '/admindash', component : admindash, meta : {requiresLogin : true, role : 'admin'}},
    {path : '/custdash', component : custdash, meta : {requiresLogin : true, role : 'customer'}},
    {path : '/profdash', component : profdash, meta : {requiresLogin : true, role : 'professional'}},
    {path : '/createservice', component : createservice, meta : {requiresLogin : true, role : ['professional', 'admin']}},
    {path: '/services/:service_id/reviews', component: reviews, meta: { requiresLogin: true } },
    {path : '/myservices', component : myservices, meta : {requiresLogin : true, role : 'customer'}},
    { path: '/feedback/:requestId', name: 'feedback', component: feedback, meta: { requiresLogin: true } },
    {path : '/requestdetails/:id', component : requestdetails, meta : {requiresLogin : true, role : 'admin'}}
]
const router = new VueRouter({
    routes
})

router.beforeEach((to, from, next) => {
    if (to.matched.some((record) => record.meta.requiresLogin)) {
        if (!store.state.loggedIn) {
            next({ path: '/login' });
        } else if (to.meta.role) {
            // Check if to.meta.role is an array or a string
            if (Array.isArray(to.meta.role)) {
                if (!to.meta.role.includes(store.state.role)) {
                    alert('Role not authorized');
                    next({ path: '/' });
                } else {
                    next();
                }
            } else if (to.meta.role !== store.state.role) {
                alert('Role not authorized');
                next({ path: '/' });
            } else {
                next();
            }
        } else {
            next();
        }
    } else {
        next();
    }
});


export default router;