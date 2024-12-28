export default {
    template: `
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f8f9fa;">
        <div style="max-width: 400px; width: 100%; padding: 20px; background: white; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="text-align: center; margin-bottom: 20px;">Customer Registration</h2>
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
            <div class="form-group" style="margin-bottom: 15px;">
                <input 
                    placeholder="Full Name" 
                    v-model="name" 
                    class="form-control" 
                    style="width: 100%; padding: 10px; font-size: 1rem;" 
                />
            </div>
            <div class="form-group" style="margin-bottom: 15px;">
                <input 
                    placeholder="Address" 
                    v-model="address" 
                    class="form-control" 
                    style="width: 100%; padding: 10px; font-size: 1rem;" 
                />
            </div>
            <div class="form-group" style="margin-bottom: 15px;">
                <input 
                    placeholder="Pincode" 
                    v-model="pin" 
                    class="form-control" 
                    style="width: 100%; padding: 10px; font-size: 1rem;" 
                />
            </div>
            <button 
                @click="submitLogin" 
                class="btn btn-primary" 
                style="width: 100%; padding: 10px; font-size: 1rem;">
                Register
            </button>
        </div>
    </div>
    `,
    data() {
        return {
            email: null,
            password: null,
            name: null,
            address: null,
            pin: null,
        };
    },
    methods: {
        async submitLogin() {
            const res = await fetch(location.origin + '/custregister', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.email,
                    password: this.password,
                    name: this.name,
                    address: this.address,
                    pin: this.pin,
                }),
            });
    
            if (res.ok) {
                alert('Registration successful! Please log in.');
                this.$router.push('/login'); // Redirect to login page
            } else {
                const data = await res.json();
                alert(data.message || 'Error registering user.');
            }
        },
    },
};
