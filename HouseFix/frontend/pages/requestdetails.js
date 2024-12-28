export default {
    template: `
    <div style="max-width: 900px; margin: 0 auto; padding: 16px;">
        <h3>Service Request Details</h3>
        
        <div v-if="request">
            <p><strong>Date Requested:</strong> {{ request.req_date }}</p>
            <p v-if="request.comp_date"><strong>Date Completed:</strong> {{ request.comp_date }}</p>
            <p><strong>Rating:</strong> {{ request.rating || 'Service not yet provided / no rating given'}}</p>
            <p><strong>Review:</strong> {{ request.review || 'Service not yet provided / no review given' }}</p>
        </div>
        <div v-else>
            <p>Loading...</p>
        </div>
    </div>
    `,
    data() {
        return {
            request: null, // Store the service request data here
        };
    },
    async mounted() {
        // Assuming the service request ID is passed via the URL (or another way)
        const requestId = this.$route.params.id; // Adjust based on your routing setup

        // Fetch the service request details from your API
        try {
            const response = await fetch(`/api/service_requests`, {
             headers: {
                    'Authentication-Token': this.$store.state.auth_token,
                },}
            );
            const data = await response.json();
            this.allRequests = data.service_requests;
      
      // Find the service request that matches the `id` passed
      this.request = this.allRequests.find(request => request.id === parseInt(requestId));
    } catch (error) {
      console.error('Error fetching service request details:', error);
    }
  },
};
