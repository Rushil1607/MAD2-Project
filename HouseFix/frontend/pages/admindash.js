export default {
  template: `
  <div>
    <h1 style="margin-left: 10px">Admin Dashboard</h1>
    
    <!-- Professionals Table -->
    <h2 style="text-align: center;">Professionals</h2>
    <table 
      style="width: 95%; margin-left: 40px; margin-right: auto; margin-bottom: 20px; border-collapse: separate; border-spacing: 10px 0px; background-color: white;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">S.no.</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Name</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Email</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">PIN</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Service</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Experience</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(professional, index) in filteredProfessionals" :key="professional.id">
          <td style="padding: 1px; border: 1px solid #ddd;">{{ index + 1 }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ professional.name || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ professional.email || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ professional.pin || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ professional.service || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ professional.experience || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">
            <button @click="toggleBlockProfessional(professional.id)">{{ professional.active ? 'Block' : 'Unblock' }}</button>
            <button @click="confirmDelete(professional.userid)">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Customers Table -->
    <h2 style="text-align: center;">Customers</h2>
    <table 
      style="width: 95%; margin-left: 40px; margin-right: auto; margin-bottom: 20px; border-collapse: separate; border-spacing: 10px 0px; background-color: white;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">S.no.</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Name</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Email</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">PIN</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Address</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(customer, index) in filteredCustomers" :key="customer.id">
          <td style="padding: 1px; border: 1px solid #ddd;">{{ index + 1 }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ customer.name || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ customer.email || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ customer.pin || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ customer.address || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">
            <button @click="toggleBlockCustomer(customer.id)">{{ customer.active ? 'Block' : 'Unblock' }}</button>
            <button @click="confirmDelete(customer.userid)">Remove</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Services Table -->
    <h2 style="text-align: center;">Services</h2>
    <table 
      style="width: 95%; margin-left: 40px; margin-right: auto; margin-bottom: 20px; border-collapse: separate; border-spacing: 10px 0px; background-color: white;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">S.no.</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Service Name</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Professional Name</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Price</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Time Required</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(service, index) in filteredServices" :key="service.id">
          <td style="padding: 1px; border: 1px solid #ddd;">{{ index + 1 }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ service.name || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ service.professional ? service.professional.name : 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ service.price || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ service.time_req || 'N/A' }} mins </td>
          <td style="padding: 1px; border: 1px solid #ddd;">
            <button @click="editService(service.id)">Edit/Remove</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Service Requests Table -->
    <h2 style="text-align: center;">Service Requests</h2>
    <table 
      style="width: 95%; margin-left: 40px; margin-right: auto; margin-bottom: 20px; border-collapse: separate; border-spacing: 10px 0px; background-color: white;">
      <thead>
        <tr>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">S.no.</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Service Name</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Customer Name</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Professional Name</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Status</th>
          <th style="text-align: left; padding: 1px; border: 1px solid #ddd; background-color: #f4f4f4;">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(request, index) in filteredServiceRequests" :key="request.id">
          <td style="padding: 1px; border: 1px solid #ddd;">{{ index + 1 }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ request.service_name || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ request.customer.name || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ request.professional_name || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">{{ request.status || 'N/A' }}</td>
          <td style="padding: 1px; border: 1px solid #ddd;">
            <button @click="viewDetails(request.id)">View Details</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
`,
data() {
  return {
    professionals: [],
    customers: [],
    services: [],
    serviceRequests: [],
    searchQuery: this.$route.query.search || '', // Get search query from URL
  };
},
async mounted() {
  await this.fetchProfessionals();
  await this.fetchCustomers();
  await this.fetchServices();
  await this.fetchServiceRequests();
},
computed: {
  filteredProfessionals() {
    return this.professionals.filter(professional =>
      professional.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      professional.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  },
  filteredCustomers() {
    return this.customers.filter(customer =>
      customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  },
  filteredServices() {
    return this.services.filter(service =>
      service.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      service.professional.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  },
  filteredServiceRequests() {
    return this.serviceRequests.filter(request =>
      request.service_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      request.customer.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      request.professional_name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
},
watch: {
  '$route.query.search'(newSearch) {
    this.searchQuery = newSearch || ''; // Update local searchQuery when route query changes
  },
},
  methods: {
    async fetchProfessionals() {
      try {
        const response = await fetch('/api/professionals', {
          method: 'GET',
          headers: { 'Authentication-Token': this.$store.state.auth_token },
        });
        const data = await response.json();
        this.professionals = data.map((professional) => ({
          ...professional,
          blocked: false, // Initialize blocked state
        }));
      } catch (error) {
        console.error('Error fetching professionals:', error);
      }
    },
    async fetchCustomers() {
      try {
        const response = await fetch('/api/customers', {
          method: 'GET',
          headers: { 'Authentication-Token': this.$store.state.auth_token },
        });
        const data = await response.json();
        this.customers = data.map((customer) => ({
          ...customer,
          blocked: false, // Initialize blocked state
        }));
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    },
    async fetchServices() {
      try {
        const response = await fetch('/api/services', {
          method: 'GET',
          headers: { 'Authentication-Token': this.$store.state.auth_token },
        });
        const data = await response.json();
        this.services = data;
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    },
    async fetchServiceRequests() {
      try {
        const response = await fetch('/api/service_requests', {
          method: 'GET',
          headers: { 'Authentication-Token': this.$store.state.auth_token },
        });
        const data = await response.json();
        this.serviceRequests = data.service_requests; // Adjust if response structure differs
      } catch (error) {
        console.error('Error fetching service requests:', error);
      }
    },
    async toggleBlockProfessional(id) {
      const professional = this.professionals.find((p) => p.id === id);
      if (professional) {
        const newStatus = !professional.active;
        professional.active = newStatus;
  
        // Make a PATCH request to update the active status in the backend
        try {
          await fetch(`/api/professionals/${id}/toggle_block`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.auth_token,
            }
          });
        } catch (error) {
          console.error('Error toggling professional block status:', error);
        }
      }
    },
  
    async toggleBlockCustomer(id) {
      const customer = this.customers.find((c) => c.id === id);
      if (customer) {
        const newStatus = !customer.active;
        customer.active = newStatus;
  
        // Make a PATCH request to update the active status in the backend
        try {
          await fetch(`/api/customers/${id}/toggle_block`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.auth_token,
            }
          });
        } catch (error) {
          console.error('Error toggling customer block status:', error);
        }
      }
    },
    confirmDelete(userId) {
      console.log('Delete User ID:', userId);
      if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        this.deleteUser(userId);
      }
    },
    async deleteUser(userId) {
      try {
        console.log('Delete User ID:', userId);
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authentication-Token': this.$store.state.auth_token },
        });
        if (!response.ok) throw new Error('Failed to delete user');
        alert('User deleted successfully.');
        // Refresh data
        this.fetchProfessionals();
        this.fetchCustomers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user. Please try again.');
      }
    },
    editService(id) {
      console.log(`Edit service with ID: ${id}`);
      // this.$router.push(`/createservice?`);
      this.$router.push(`/createservice?id=${id}&mode=update`);
    },
    viewDetails(id) {
      console.log(`View details for request ID: ${id}`);
      this.$router.push(`/requestdetails/${id}`);
    },
    handleSearchChange() {
      this.searchQuery = this.$route.query.search || ''; // Update searchQuery when query param changes
    }
  },
};