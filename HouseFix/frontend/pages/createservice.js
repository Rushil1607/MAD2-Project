export default {
    template: `
        <div style="max-width: 600px; margin: auto; padding: 20px;">
            <h2>{{ mode === 'update' ? 'Update' : 'Create' }} Service</h2>
            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="name">Service Name</label>
                    <input type="text" id="name" v-model="service.name" class="form-control" required />
                </div>
                <div class="form-group">
                    <label for="price">Price</label>
                    <input type="number" id="price" v-model="service.price" class="form-control" required />
                </div>
                <div class="form-group">
                    <label for="time_req">Time Required (in minutes)</label>
                    <input type="number" id="time_req" v-model="service.time_req" class="form-control" required />
                </div>
                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea id="description" v-model="service.description" class="form-control"></textarea>
                </div>
                <div class="button-group" style="display: flex; gap: 10px;">
                    <button type="submit" class="btn btn-primary" style="flex: 1;">
                        {{ mode === 'update' ? 'Update' : 'Create' }} Service
                    </button>
                    <button 
                        v-if="mode === 'update'" 
                        @click="handleDelete" 
                        type="button" 
                        class="btn btn-danger" 
                        style="flex: 1;">
                        Delete Service
                    </button>
                </div>
            </form>
        </div>
    `,
    data() {
        return {
            service: {
                id: null,
                name: '',
                price: '',
                time_req: '',
                description: '',
            },
            mode: 'create', // Default to create
        };
    },
    created() {
        const { id, mode } = this.$route.query;
        this.mode = mode || 'create'; // Set mode from query parameter

        if (id && this.mode === 'update') {
            this.fetchService(id);
        }
    },
    methods: {
        async fetchService(serviceId) {
            try {
                const res = await fetch(`/api/services/${serviceId}`, {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (res.ok) {
                    const service = await res.json();
                    this.service = service;
                } else {
                    const error = await res.json();
                    alert(error.message || 'Error fetching service details.');
                    this.redirectToDashboard();
                }
            } catch (error) {
                console.error('Error fetching service:', error);
                this.redirectToDashboard();
            }
        },
        async handleSubmit() {
            const url = this.mode === 'update'
                ? `/api/services/${this.service.id}`
                : `/api/services`;
            const method = this.mode === 'update' ? 'PUT' : 'POST';

            try {
                const res = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                    body: JSON.stringify(this.service),
                });

                if (res.ok) {
                    alert(
                        this.mode === 'update'
                            ? 'Service updated successfully.'
                            : 'Service created successfully.'
                    );
                    this.redirectToDashboard();
                } else {
                    const error = await res.json();
                    alert(error.message || 'Error saving service.');
                }
            } catch (error) {
                console.error('Error saving service:', error);
                alert('Error saving service.');
            }
        },
        async handleDelete() {
            try {
                const res = await fetch(`/api/services/${this.service.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (res.ok) {
                    alert('Service deleted successfully.');
                    this.redirectToDashboard();
                } else {
                    const error = await res.json();
                    alert(error.message || 'Error deleting service.');
                }
            } catch (error) {
                console.error('Error deleting service:', error);
                alert('Error deleting service.');
            }
        },
        redirectToDashboard() {
            // Redirect based on user role
            const role = this.$store.state.role;
            const dashboard = role === 'admin' ? '/admindash' : '/profdash';
            this.$router.push(dashboard);
        },
    },
};
