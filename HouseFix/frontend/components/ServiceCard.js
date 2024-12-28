export default {
    props: {
        name: { type: String, required: true },
        professional_name: { type: String, required: true },
        professional_pin: { type: Number, required: true },
        price: { type: Number, required: true },
        time_req: { type: [Number, String], required: true },
        description: { type: String, required: true },
        service_id: { type: Number, required: true },
        rating: { type: [Number, null], default: null },
        requested: { type: Boolean, required: true },
        status: { type: String, default: null }, // Added prop for status
    },
    template: `
    <div class="card-container" style="
        background-color: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 20px;
        width: 280px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px;
        transition: transform 0.3s ease-in-out;
    ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2 @click="$router.push('/services/' + service_id)" style="
                font-size: 1.5rem;
                color: #333;
                cursor: pointer;
                margin: 0;
                padding: 0;
            ">
                {{ name }}
            </h2>
            <span :style="{ color: 'red', fontSize: '1rem' }">
                Rating: {{ rating !== null ? rating + '/5' : '-/5' }}
            </span>
        </div>
        <p style="font-size: 1rem; color: #555; margin: 8px 0;">
            <strong>Provided by:</strong> {{ professional_name }}
        </p>
        <p style="font-size: 1rem; color: #555; margin: 8px 0;">
            <strong>Pin Code:</strong> {{ professional_pin }}
        </p>
        <p style="font-size: 1rem; color: #555; margin: 8px 0;">
            <strong>Price:</strong> ₹{{ price }}
        </p>
        <p style="font-size: 1rem; color: #555; margin: 8px 0;">
            <strong>Time Required:</strong> {{ time_req }} minutes
        </p>
        <p style="font-size: 1rem; color: #555; margin: 8px 0;">
            <strong>Description:</strong> {{ description }}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <a @click="$router.push('/services/' + service_id + '/reviews')" style="
                color: #007bff;
                text-decoration: none;
                font-size: 1rem;
                cursor: pointer;
            ">
                Reviews
            </a>
            <button @click="handleRequestClick" :class="{
                'btn btn-info': requested, 
                'btn btn-primary': !requested
            }" style="
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
                transition: background-color 0.3s ease;
            ">
                {{ requested ? (status === 'Pending' ? 'Requested' : 'Request') : 'Request' }}
            </button>
        </div>
    </div>
    `,
    methods: {
        handleRequestClick() {
            if (this.requested) {
                // Inform the user to cancel the existing request before proceeding
                this.$emit('request-service', this.$props); // Pass the full service object
            } else {
                this.$emit('request-service', this.$props); // Pass the full service object
            }
        },
    },
};