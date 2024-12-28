import ServiceCard from "../components/ServiceCard.js";

export default {
  template: `
    <div class="services-list-container" style="
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: flex-start;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    ">
      <!-- Service Cards -->
      <ServiceCard 
        v-for="service in filteredServices" 
        :key="service.id"
        :name="service.name"
        :professional_name="service.professional.name"
        :professional_pin="service.professional.pin_code"
        :price="service.price"
        :time_req="service.time_req"
        :description="service.description"
        :service_id="service.id"
        :rating="service.rating"
        @request-service="handleRequest" 
        :requested="service.requested"
        :status="service.status"
      />
      
      <!-- My Services Button -->
      <button 
        @click="goToMyServices" 
        class="my-services-button"
        style="
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 10px 20px;
          background-color: #007BFF;
          color: white;
          border: none;
          border-radius: 5px;
          font-size: 16px;
          cursor: pointer;
        "
      >
        My Services
      </button>
    </div>
  `,
  data() {
    return {
      services: [], // Full list of services
    };
  },
  computed: {
    searchQuery() {
      return this.$route.query.search || ""; // Dynamically fetch the search query from the route
    },
    filteredServices() {
      if (!this.searchQuery) return this.services;

      return this.services.filter(service =>
        service.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        service.professional.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        String(service.professional.pin_code).includes(this.searchQuery)
      );
    },
  },
  async mounted() {
    try {
      const res = await fetch(location.origin + '/api/services', {
        headers: {
          'Authentication-Token': this.$store.state.auth_token,
        },
      });

      if (res.ok) {
        this.services = await res.json();

        // Set default values for requested if not present
        this.services.forEach(service => {
          if (service.requested === undefined) {
            service.requested = false;
          }
        });

        console.log("Fetched services:", this.services);
      } else {
        console.error('Failed to fetch services:', await res.text());
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  },
  watch: {
    '$route.query.search': {
      handler() {
        // Trigger recomputation of filteredServices
        console.log("Search query updated:", this.searchQuery);
      },
      immediate: true,
    },
  },
  methods: {
    async handleRequest(service) {
      try {
        console.log('Checking service request status:', service);
    
        if (service.status === 'Pending') {
          alert(`You already have a pending request for "${service.name}". Please cancel it before creating a new one.`);
          return;
        }
    
        // Create a new service request if status is not pending
        const requestPayload = {
          service_id: service.service_id,
          status: 'Pending',
        };
    
        const res = await fetch(location.origin + '/api/service_requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify(requestPayload),
        });
    
        if (res.ok) {
          console.log(`Service request created for service: ${service.name}`);
          alert(`Your request for the service "${service.name}" has been submitted.`);
          
          // Update the service's status and requested state
          service.requested = true;
          service.status = 'Pending';
        } else {
          console.error("Failed to create service request:", await res.text());
          alert("Failed to submit your service request. Please try again.");
        }
      } catch (error) {
        console.error("Error while sending service request:", error);
        alert("An error occurred. Please try again.");
      }
    },

    goToMyServices() {
      this.$router.push('/myservices');
    },
  },
  components: {
    ServiceCard,
  },
};
