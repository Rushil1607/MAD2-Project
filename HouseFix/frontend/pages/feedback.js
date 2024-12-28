export default {
    template: `
      <div style="max-width: 600px; margin: 0 auto; padding: 16px;">
        <h1>Provide Feedback</h1>
  
        <!-- Feedback form -->
        <form @submit.prevent="submitFeedback">
          <div>
            <label for="rating">Rating (1 to 5):</label>
            <select v-model="rating" id="rating" required>
              <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
  
          <div>
            <label for="review">Review:</label>
            <textarea v-model="review" id="review" placeholder="Leave your review here..." required></textarea>
          </div>
  
          <div>
            <button type="submit">{{ isEditing ? 'Update' : 'Submit' }} Feedback</button>
          </div>
        </form>
  
        <p v-if="feedbackMessage" style="margin-top: 20px; color: green;">{{ feedbackMessage }}</p>
      </div>
    `,
    data() {
      return {
        rating: null,
        review: '',
        feedbackMessage: '',
        isEditing: false,
        serviceRequestId: null,
        existingFeedback: null,
      };
    },
    async mounted() {
      // Get the service request ID from the route params
      this.serviceRequestId = this.$route.params.requestId;

      console.log('Resolved Service Request ID:', this.serviceRequestId); 
      // Check if the user has already provided feedback for this service request
      await this.loadExistingFeedback();
    },
    methods: {
      async loadExistingFeedback() {
        try {
            const res = await fetch(`${location.origin}/api/service_requests/${this.serviceRequestId}/feedback`, {
                headers: {
                  'Authentication-Token': this.$store.state.auth_token,
                },
              });
  
          if (res.ok) {
            const data = await res.json();
            if (data.feedback) {
              this.rating = data.feedback.rating;
              this.review = data.feedback.review;
              this.isEditing = true;
            }
          } else {
            console.error('Failed to fetch feedback:', await res.text());
          }
        } catch (error) {
          console.error('Error fetching existing feedback:', error);
        }
      },
  
      async submitFeedback() {
        try {
          const feedbackData = {
            rating: this.rating,
            review: this.review,
          };
      
          const url = `${location.origin}/api/service_requests/${this.serviceRequestId}/feedback`;
          const method = 'POST'; // Use POST for both submitting and updating
      
          const res = await fetch(url, {
            method,
            headers: {
              'Authentication-Token': this.$store.state.auth_token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(feedbackData),
          });
      
          if (res.ok) {
            const data = await res.json();
            this.feedbackMessage = data.message || 'Feedback submitted successfully!';
            this.isEditing = true;
            this.$router.push('/custdash');
          } else {
            console.error('Failed to submit feedback:', await res.text());
            alert('Failed to submit feedback. Please try again.');
          }
        } catch (error) {
          console.error('Error submitting feedback:', error);
          alert('An error occurred. Please try again.');
        }
      },
    },
  };
  