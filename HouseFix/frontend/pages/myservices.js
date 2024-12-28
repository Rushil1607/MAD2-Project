export default {
    template: `
      <div style="max-width: 900px; margin: 0 auto; padding: 16px;">
          <h1>My Pending Services</h1>
          <table border="1" cellpadding="10" style="width: 100%; margin-bottom: 30px;">
              <thead>
                  <tr>
                      <th>S.No.</th>
                      <th>Date Requested</th>
                      <th>Service Name</th>
                      <th>Service Provider</th>
                      <th>Email</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="(service, index) in pendingServices" :key="service.id">
                      <td>{{ index + 1 }}</td>
                      <td>{{ formatDate(service.req_date) }}</td>
                      <td>{{ service.service_name }}</td>
                      <td>{{ service.professional_name }}</td>
                      <td>{{ service.professional_email }}</td>
                      <td>
                          <button @click="cancelRequest(service)">Cancel</button>
                      </td>
                  </tr>
              </tbody>
          </table>
  
          <h1>My Completed Services</h1>
          <table border="1" cellpadding="10" style="width: 100%;">
              <thead>
                  <tr>
                      <th>S.No.</th>
                      <th>Date Requested</th>
                      <th>Service Name</th>
                      <th>Service Provider</th>
                      <th>Email</th>
                      <th>Date Completed</th>
                      <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                  <tr v-for="(service, index) in completedServices" :key="service.id">
                      <td>{{ index + 1 }}</td>
                      <td>{{ formatDate(service.req_date) }}</td>
                      <td>{{ service.service_name }}</td>
                      <td>{{ service.professional_name }}</td>
                      <td>{{ service.professional_email }}</td>
                      <td>{{ formatDate(service.comp_date) }}</td>
                      <td>
                          <button @click="goToFeedbackPage(service)">Feedback</button>
                      </td>
                  </tr>
              </tbody>
          </table>
      </div>
    `,
    data() {
      return {
        pendingServices: [], // Array to hold pending services
        completedServices: [], // Array to hold completed services
      };
    },
    async mounted() {
      try {
        // Fetch the pending and completed services for the logged-in customer
        const res = await fetch(location.origin + '/api/service_requests', {
          headers: {
            'Authentication-Token': this.$store.state.auth_token,
          },
        });
  
        if (res.ok) {
          const data = await res.json();
          console.log('API Response:', data); // Log the full response
  
          // Filter service requests for the logged-in customer
          const currentUserId = this.$store.state.user_id; // Assuming the customer_id is available in the store
  
          // Filter for pending services
          this.pendingServices = data.service_requests.filter(service =>
            service.status === 'Pending' && service.customer_user_id === currentUserId
          );
  
          // Filter for completed services
          this.completedServices = data.service_requests.filter(service =>
            service.status === 'Completed' && service.customer_user_id === currentUserId
          );
        } else {
          console.error('Failed to fetch services:', await res.text());
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    },
    methods: {
      // Format the date to a readable format
      formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString(); // Customize this format if needed
      },
      // Method to cancel a service request
      async cancelRequest(service) {
        try {
          const res = await fetch(location.origin + `/api/service_requests/${service.id}`, {
            method: 'DELETE',
            headers: {
              'Authentication-Token': this.$store.state.auth_token,
            },
          });
  
          if (res.ok) {
            console.log(`Service request for ${service.service_name} has been canceled.`);
            alert(`Your request for the service "${service.service_name}" has been canceled.`);
            
            // Update the local array after successful cancellation
            this.pendingServices = this.pendingServices.filter(s => s.id !== service.id);
          } else {
            console.error('Failed to cancel service request:', await res.text());
            alert('Failed to cancel your service request. Please try again.');
          }
        } catch (error) {
          console.error('Error while canceling service request:', error);
          alert('An error occurred. Please try again.');
        }
      },
      // Method to navigate to the feedback page for a completed service
      goToFeedbackPage(service) {
        console.log('Navigating to feedback page for Service ID:', service.id); // Debugging log
        this.$router.push({
          name: 'feedback', // Use the named route
          params: { requestId: service.id }, // Pass the actual service ID as the parameter
        });
      }
    },
  };
  