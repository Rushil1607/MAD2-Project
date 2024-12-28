export default {
    template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f8f9fa;">
        <div style="max-width: 400px; width: 100%; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; margin-bottom: 20px;">Login</h2>
            <div class="form-group" style="margin-bottom: 15px;">
                <input 
                    placeholder="Email" 
                    v-model="email" 
                    class="form-control" 
                    style="width: 100%; padding: 10px; font-size: 1rem;" 
                />
            </div>
            <div class="form-group" style="margin-bottom: 15px;">
                <input 
                    placeholder="Password" 
                    type="password" 
                    v-model="password" 
                    class="form-control" 
                    style="width: 100%; padding: 10px; font-size: 1rem;" 
                />
            </div>
            <button 
                class="btn btn-primary" 
                @click="submitLogin" 
                style="width: 100%; padding: 10px; font-size: 1rem;">
                Login
            </button>
        </div>
    </div>
    `,
    data() {
        return {
            email: null,
            password: null,
        };
    },
    methods: {
        async submitLogin() {
            const res = await fetch(location.origin + '/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: this.email, password: this.password }),
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('user', JSON.stringify(data));
                this.$store.commit('setUser');
                if (data.role === 'admin') {
                    this.$router.push('/admindash');
                } else if (data.role === 'customer') {
                    this.$router.push('/custdash');
                } else if (data.role === 'professional') {
                    this.$router.push('/profdash');
                }
            } else {
                const error = await res.json();
                alert(error.message || 'Login failed');
            }
        },
    },
};
