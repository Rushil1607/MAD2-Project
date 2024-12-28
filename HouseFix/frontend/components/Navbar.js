export default {
    template: `
      <nav style="display: flex; justify-content: space-between; align-items: center; padding: 5px 20px; background-color: #007bff; color: white;">
          <div style="font-size: 1.5em; font-weight: bold; display: flex; align-items: center;">
              <router-link to="/" style="color: white; text-decoration: none;">HouseFix</router-link>
              
              <!-- Search Bar visible on specific pages -->
              <div v-if="isSearchVisible" style="margin-left: 20px; display: flex; align-items: center; position: relative;">
                  <input 
                      v-model="searchQuery"
                      type="text" 
                      placeholder=" Search..." 
                      @keypress="handleKeyPress"
                      style="padding: 0px; border-radius: 5px; border: none; width: 200px; height: 27px; font-size: 0.6em;" />
                  
                  <!-- Search Button inside the input field -->
                  <button 
                      @click="submitSearch"
                      style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); padding: 0px 0px; border: none; height:25px; background-color: white; color: gray; border-radius: 5px; font-size: 0.7em; cursor: pointer;">
                      Q
                  </button>
              </div>
          </div>
          <div style="display: flex; gap: 15px;">
              <router-link to="/" style="color: white; text-decoration: none;">Home</router-link>
              <router-link 
                  v-if="!$store.state.loggedIn" 
                  to="/login" 
                  style="color: white; text-decoration: none;">
                  Login
              </router-link>
              <router-link 
                  v-if="!$store.state.loggedIn" 
                  to="/custregister" 
                  style="color: white; text-decoration: none;">
                  Register as Customer
              </router-link>
              <router-link 
                  v-if="!$store.state.loggedIn" 
                  to="/profregister" 
                  style="color: white; text-decoration: none;">
                  Register as Professional
              </router-link>
  
              <router-link 
                  v-if="$store.state.loggedIn && $store.state.role == 'admin'" 
                  to="/admindash" 
                  style="color: white; text-decoration: none;">
                  Dashboard
              </router-link>
              <router-link 
                  v-if="$store.state.loggedIn && $store.state.role == 'customer'" 
                  to="/custdash" 
                  style="color: white; text-decoration: none;">
                  Dashboard
              </router-link>
              <router-link 
                  v-if="$store.state.loggedIn && $store.state.role == 'professional'" 
                  to="/profdash" 
                  style="color: white; text-decoration: none;">
                  Dashboard
              </router-link>
  
              <button 
                  class="btn btn-secondary" 
                  v-if="$store.state.loggedIn" 
                  @click="logout" 
                  style="background-color: #6c757d; color: white; border: none; cursor: pointer; padding: 5px 10px; border-radius: 5px;">
                  Logout
              </button>
          </div>
      </nav>
    `,
    data() {
      return {
        searchQuery: '', // Track the search input
      };
    },
    computed: {
      // Determine if the search bar should be shown based on the current route
      isSearchVisible() {
        const currentRoute = this.$route.path;
        return currentRoute === '/admindash' || currentRoute === '/custdash' || currentRoute === '/profdash';
      }
    },
    watch: {
      searchQuery(newQuery, oldQuery) {
        // Only update the route when Enter is pressed
        if (newQuery !== oldQuery && this.$route.name === 'admindash') {
          this.$router.push({ path: '/admindash', query: { search: newQuery } });
        }
        else if (newQuery !== oldQuery && this.$route.name === 'custdash') {
            this.$router.push({ path: '/custdash', query: { search: newQuery } });
          }
          else if (newQuery !== oldQuery && this.$route.name === 'profdash') {
            this.$router.push({ path: '/profdash', query: { search: newQuery } });
          }
      },
    },
    methods: {
      handleKeyPress(event) {
        if (event.key === 'Enter' && this.$route.name === 'admindash') {
          this.submitSearch();
        }
      },
      submitSearch() {
        if (this.searchQuery.trim() !== '') {
          // Only navigate if there is a valid search query
          this.$router.push({ path: this.$route.path, query: { search: this.searchQuery } });
        }
      },
      logout() {
        // Commit the logout mutation to clear Vuex state
        this.$store.commit('logout');
        
        // Redirect to the home page after logging out
        this.$router.push('/');
      }
    }
  }
  