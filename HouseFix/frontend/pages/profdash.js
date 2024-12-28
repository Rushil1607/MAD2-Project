export default {
    template: `
        <div style="position: relative; height: 100vh; padding: 20px; display: flex; flex-direction: column; gap: 40px;">
            <h1>Professional Dashboard</h1>

            <!-- Pending Requests Table -->
            <section>
                <h2>Pending Requests</h2>
                <div v-if="pendingRequests.length">
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr>
                                <th>S.no.</th>
                                <th>Date Requested</th>
                                <th>Customer Name</th>
                                <th>Customer Address</th>
                                <th>Customer PIN</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(request, index) in pendingRequests" :key="request.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ formatDate(request.req_date) }}</td>
                                <td>{{ request.customer.name }}</td>
                                <td>{{ request.customer.address }}</td>
                                <td>{{ request.customer.pin }}</td>
                                <td>
                                    <button @click="acceptRequest(request.id)">Accept</button>
                                    <button @click="declineRequest(request.id)">Reject</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p v-else>No pending requests.</p>
            </section>

            <!-- Accepted Requests Table -->
            <section>
                <h2>Accepted Requests</h2>
                <div v-if="acceptedRequests.length">
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr>
                                <th>S.no.</th>
                                <th>Date Requested</th>
                                <th>Customer Name</th>
                                <th>Customer Address</th>
                                <th>Customer PIN</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(request, index) in acceptedRequests" :key="request.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ formatDate(request.req_date) }}</td>
                                <td>{{ request.customer.name }}</td>
                                <td>{{ request.customer.address }}</td>
                                <td>{{ request.customer.pin }}</td>
                                <td>
                                    <button @click="markComplete(request.id)">Mark as Completed</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p v-else>No accepted requests.</p>
            </section>

            <!-- Completed Requests Table -->
            <section>
                <h2>Completed Requests</h2>
                <div v-if="completedRequests.length">
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr>
                                <th>S.no.</th>
                                <th>Date Requested</th>
                                <th>Customer Name</th>
                                <th>Customer Address</th>
                                <th>Customer PIN</th>
                                <th>Date Completed</th>
                                <th>Rating</th>
                                <th>Review</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(request, index) in completedRequests" :key="request.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ formatDate(request.req_date) }}</td>
                                <td>{{ request.customer.name }}</td>
                                <td>{{ request.customer.address }}</td>
                                <td>{{ request.customer.pin }}</td>
                                <td>{{ formatDate(request.comp_date) }}</td>
                                <td>{{ request.rating }}</td>
                                <td>{{ request.review }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p v-else>No completed requests.</p>
            </section>

            <!-- Create/Update Service Button -->
            <button 
                @click="checkService"
                style="position: fixed; bottom: 20px; right: 20px; background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); cursor: pointer;">
                Create/Update Service
            </button>
        </div>
    `,
    data() {
        return {
            pendingRequests: [],
            acceptedRequests: [],
            completedRequests: [],
            searchQuery: this.$route.query.search || '',  // Initialize search query from route
        };
    },
    async mounted() {
        await this.fetchRequests();
    },
    methods: {
        async fetchRequests() {
            try {
                const res = await fetch('/api/service_requests', {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    const requests = data.service_requests || [];
                    const currentUserId = this.$store.state.user_id;

                    // Filter requests by the logged-in professional's user_id
                    const filteredRequests = requests.filter(
                        (req) => req.professional_user_id === currentUserId
                    );

                    // If search query exists, filter by customer name, address, or PIN
                    if (this.searchQuery.trim()) {
                        this.pendingRequests = filteredRequests.filter(req => 
                            req.customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            req.customer.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            String(req.customer.pin).includes(this.searchQuery)  // Ensure PIN is a string
                        ).filter(req => req.status === 'Pending');
        
                        this.acceptedRequests = filteredRequests.filter(req => 
                            req.customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            req.customer.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            String(req.customer.pin).includes(this.searchQuery)  // Ensure PIN is a string
                        ).filter(req => req.status === 'Accepted');
        
                        this.completedRequests = filteredRequests.filter(req => 
                            req.customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            req.customer.address.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            String(req.customer.pin).includes(this.searchQuery)  // Ensure PIN is a string
                        ).filter(req => req.status === 'Completed');
                    } else {
                        // Default case, no search query, show all requests as usual
                        this.pendingRequests = filteredRequests.filter(req => req.status === 'Pending');
                        this.acceptedRequests = filteredRequests.filter(req => req.status === 'Accepted');
                        this.completedRequests = filteredRequests.filter(req => req.status === 'Completed');
                    }
                } else {
                    console.error('Error fetching requests:', await res.text());
                    // alert('Error fetching requests.');
                }
            } catch (error) {
                console.error('Error fetching service requests:', error);
                alert('Error fetching service requests.');
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleString();
        },
        async checkService() {
            try {
                const res = await fetch('/api/services', {
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (res.ok) {
                    const services = await res.json();
                    const existingService = services.find(
                        (service) => service.professional.user_id === this.$store.state.user_id
                    );

                    if (existingService) {
                        this.$router.push(`/createservice?id=${existingService.id}&mode=update`);
                    } else {
                        this.$router.push(`/createservice?mode=create`);
                    }
                } else {
                    const error = await res.json();
                    console.error('Error fetching services:', error.message);
                    alert('Error fetching services.');
                }
            } catch (error) {
                console.error('Error checking service existence:', error);
                alert('Please wait for admin approval.');
            }
        },
        async acceptRequest(requestId) {
            try {
                const res = await fetch(`/api/service_requests/${requestId}?accept=true`, {
                    method: 'PATCH',
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (res.ok) {
                    alert('Request accepted successfully.');
                    this.fetchRequests();
                } else {
                    console.error('Error accepting request:', await res.text());
                    alert('Failed to accept request.');
                }
            } catch (error) {
                console.error('Error accepting request:', error);
                alert('Error accepting request.');
            }
        },
        async declineRequest(requestId) {
            try {
                const res = await fetch(`/api/service_requests/${requestId}?reject=true`, {
                    method: 'PATCH',
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (res.ok) {
                    alert('Request rejected successfully.');
                    this.fetchRequests();
                } else {
                    console.error('Error rejecting request:', await res.text());
                    alert('Failed to reject request.');
                }
            } catch (error) {
                console.error('Error rejecting request:', error);
                alert('Error rejecting request.');
            }
        },
        async markComplete(requestId) {
            try {
                const res = await fetch(`/api/service_requests/${requestId}?complete=true`, {
                    method: 'PATCH',
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });

                if (res.ok) {
                    alert('Request marked as completed.');
                    this.fetchRequests();
                } else {
                    console.error('Error marking request as complete:', await res.text());
                    alert('Failed to mark request as completed.');
                }
            } catch (error) {
                console.error('Error marking request as complete:', error);
                alert('Error marking request as complete.');
            }
        },
    },
    watch: {
        $route(to, from) {
            // React to changes in route (like search query)
            this.searchQuery = to.query.search || '';
            this.fetchRequests();  // Re-fetch requests based on the new search query
        }
    }
};
