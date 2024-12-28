export default {
    template: `
    <div style="max-width: 900px; margin: 0 auto; padding: 16px;">
        <h1>Reviews</h1>
        <div v-if="reviews && reviews.length > 0">
            <ul>
                <li v-for="(review, index) in reviews" :key="index">{{ review }}</li>
            </ul>
        </div>
        <div v-else>
            <p style="font-size: 16px; color: #333;">There are no reviews yet.</p>
        </div>
    </div>
    `,
    data() {
        return {
            reviews: null, // Default to null
        };
    },
    async mounted() {
        try {
            const res = await fetch(location.origin + `/api/services/${this.$route.params.service_id}/reviews`, {
                headers: {
                    'Authentication-Token': this.$store.state.auth_token,
                },
            });

            if (res.ok) {
                const data = await res.json();
                console.log('API Response:', data); // Log the full response
                // Filter out null values from the reviews array
                this.reviews = (data.reviews || []).filter(review => review !== null);
            } else {
                console.error('Failed to fetch reviews:', await res.text());
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        }
    },
};
