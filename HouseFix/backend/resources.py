from flask import jsonify, request, current_app as app
from flask_restful import Api, Resource, fields, marshal_with
from flask_security import auth_required, roles_required, current_user
from backend.models import User, Service, Professional, Customer, ServiceRequest, db
from sqlalchemy import func
from datetime import datetime
#import logging

cache = app.cache

api = Api(prefix='/api')

# Service fields for marshaling responses
service_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'price': fields.Integer,
    'time_req': fields.Integer,
    'description': fields.String,
    'professional': fields.Nested({
        'user_id' : fields.Integer,
        'name': fields.String,
        'pin_code': fields.Integer
        
    }),
    'rating': fields.Float,  # Add rating field
}

# Service API
class ServiceAPI(Resource):
    @auth_required('token')
    @cache.memoize(timeout=5)
    @marshal_with(service_fields)
    def get(self, service_id):
        # Check if the current user has the 'admin' role
        is_admin = any(role.name == 'admin' for role in current_user.roles)

        if is_admin:
            # Allow admin to access any service
            service = Service.query.filter_by(id=service_id).join(Professional, Service.professional_id == Professional.professional_id)\
                .add_columns(
                    Service.id, Service.name, Service.price, Service.time_req, Service.description,
                    Professional.user_id.label("professional_user_id"),
                    Professional.name.label("professional_name"), Professional.pin.label("professional_pin")
                ).first()
        else:
            # Restrict access to professionals' own services
            service = Service.query.filter_by(id=service_id).join(Professional, Service.professional_id == Professional.professional_id)\
                .add_columns(
                    Service.id, Service.name, Service.price, Service.time_req, Service.description,
                    Professional.user_id.label("professional_user_id"),
                    Professional.name.label("professional_name"), Professional.pin.label("professional_pin")
                ).filter(Professional.user_id == current_user.id).first()

        if not service:
            return {"message": "Service not found or unauthorized access"}, 404

        # Calculate average rating
        avg_rating = db.session.query(func.avg(ServiceRequest.rating).label('avg_rating'))\
            .filter(ServiceRequest.service_id == service.id).scalar()
        
        # If no reviews, set rating to None
        rating = avg_rating if avg_rating is not None else None

        return {
            "id": service.id,
            "name": service.name,
            "price": service.price,
            "time_req": service.time_req,
            "description": service.description,
            "professional": {
                "user_id": service.professional_user_id,
                "name": service.professional_name,
                "pin_code": service.professional_pin,
            },
            "rating": rating  # Add rating to the response
        }


    
    @auth_required('token')
    def delete(self, service_id):
    # Check if the user is an admin
        is_admin = any(role.name == 'admin' for role in current_user.roles)

        if is_admin:
            # Admins can delete any service
            service = Service.query.filter_by(id=service_id).first()
        else:
            # Professionals can only delete their own services
            service = Service.query.filter_by(
                id=service_id, 
                professional_id=current_user.professional.professional_id
            ).first()

        if not service:
            return {"message": "Service not found or unauthorized access"}, 404

        db.session.delete(service)
        db.session.commit()
        return {"message": "Service deleted successfully"}

    @auth_required('token')
    def put(self, service_id):
        # Check if the user is an admin
        is_admin = any(role.name == 'admin' for role in current_user.roles)

        if is_admin:
            # Admins can update any service
            service = Service.query.filter_by(id=service_id).first()
        else:
         # Professionals can only update their own services
            service = Service.query.filter_by(
                id=service_id, 
                professional_id=current_user.professional.professional_id
            ).first()

        if not service:
            return {"message": "Service not found or unauthorized access"}, 404

        # Parse the update data
        data = request.get_json()
        service.name = data.get('name', service.name)
        service.price = data.get('price', service.price)
        service.time_req = data.get('time_req', service.time_req)
        service.description = data.get('description', service.description)

        db.session.commit()
        return {"message": "Service updated successfully"}

# Service List API
class ServiceListAPI(Resource):
    @auth_required('token')
    @cache.cached(timeout=5)
    def get(self):
        # Get all services without filtering by professional
        services = Service.query.join(Professional, Service.professional_id == Professional.professional_id)\
            .add_columns(
                Service.id, Service.name, Service.price, Service.time_req, Service.description,
                Professional.user_id.label("professional_user_id"),
                Professional.name.label("professional_name"), Professional.pin.label("professional_pin")
            ).all()


        services_list = []
        
        for service in services:
            avg_rating = db.session.query(func.avg(ServiceRequest.rating).label('avg_rating'))\
                .filter(ServiceRequest.service_id == service.id).scalar()

            rating = avg_rating if avg_rating is not None else None
            
            services_list.append({
                "id": service.id,
                "name": service.name,
                "price": service.price,
                "time_req": service.time_req,
                "description": service.description,
                "professional": {
                    "user_id": service.professional_user_id, 
                    "name": service.professional_name,
                    "pin_code": service.professional_pin,
                },
                "rating": rating  # Add the rating here
            })

        return services_list

    @auth_required('token')
    def post(self):
        if not current_user.professional:
            return {"message": "Only professionals can create services"}, 403

        existing_service = Service.query.filter_by(professional_id=current_user.professional.professional_id).first()
        if existing_service:
            return {"message": "You already have a service. Please update or delete your existing service."}, 400

        data = request.get_json()
        service = Service(
            name=data['name'],
            price=data['price'],
            time_req=data['time_req'],
            description=data.get('description'),
            professional_id=current_user.professional.professional_id
        )
        db.session.add(service)
        db.session.commit()
        return {"message": "Service created successfully"}, 201

class ServiceReviewsAPI(Resource):
    @auth_required('token')
    def get(self, service_id):
        # Get all reviews for a specific service
        reviews = db.session.query(ServiceRequest.review).filter_by(service_id=service_id).all()
        reviews_list = [review[0] for review in reviews]  # Extract review text
        return jsonify({"reviews": reviews_list})

class ServiceRequestAPI(Resource):
    @auth_required('token')
    @cache.cached(timeout=5)
    def get(self):
        # Retrieve all service requests
        service_requests = ServiceRequest.query.all()

        # Convert service requests to a list of dictionaries
        result = []
        for req in service_requests:
            # Fetch the associated service and professional details
            service = Service.query.get(req.service_id)
            professional = Professional.query.get(req.professional_id)
            customer = Customer.query.get(req.customer_id)

            # Fetch the email and user_id from the associated User model
            professional_user = User.query.get(professional.user_id)  # Fetch the User for the professional
            customer_user = User.query.get(customer.user_id)

            # Append the required details to the result
            result.append({
                'id': req.id,
                'service_id': req.service_id,
                'customer_user_id': customer.user_id,
                'customer': {
                    'name': req.customer.name,
                    'address': req.customer.address,
                    'pin': req.customer.pin,
                },
                'professional_id': req.professional_id,
                'professional_user_id': professional.user_id,  # Add user_id of the professional
                'service_name': service.name,  # Add service name
                'professional_name': professional.name,  # Add professional name
                'professional_email': professional_user.email,  # Add professional email (from User model)
                'req_date': req.req_date.isoformat(),
                'status': req.status,
                'comp_date': req.comp_date.isoformat() if req.comp_date else None,
                'rating': req.rating,
                'review': req.review,
            })
        
        return {"service_requests": result}, 200

    @auth_required('token')
    def post(self):
        data = request.get_json()
        service_id = data['service_id']
        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404

        service_request = ServiceRequest(
            service_id=service.id,
            customer_id=current_user.customer.customer_id,
            professional_id=service.professional_id,
            req_date=datetime.now(),
            status=data.get('status', 'Pending'),  # Default to 'Pending' if no status is provided
        )
        db.session.add(service_request)
        db.session.commit()
        return {"message": "Service request created"}, 201

    @auth_required('token')
    def patch(self, request_id):
        service_request = ServiceRequest.query.get(request_id)
        if not service_request:
            return {"message": "Request not found"}, 404

        if service_request.status == 'Pending':
            if 'accept' in request.args:
                service_request.status = 'Accepted'
                db.session.commit()
                return {"message": "Request accepted"}, 200
            elif 'reject' in request.args:
                db.session.delete(service_request)  # Delete the service request from the database
                db.session.commit()
                return {"message": "Request rejected"}, 200
        elif service_request.status == 'Accepted' and 'complete' in request.args:
            service_request.status = 'Completed'
            service_request.comp_date = datetime.now()  # Set the completion date
            db.session.commit()
            return {"message": "Request marked as completed"}, 200

        return {"message": "Invalid action or status"}, 400

    @auth_required('token')
    def delete(self, request_id):
        service_request = ServiceRequest.query.get(request_id)
        if not service_request:
            return {"message": "Request not found"}, 404

        if service_request.status == 'Pending':
            db.session.delete(service_request)
            db.session.commit()
            return {"message": "Service request deleted successfully"}, 200
        else:
            return {"message": "Only pending requests can be deleted"}, 400

    @auth_required('token')
    def post_feedback(self, request_id):
        """
        Submit or update feedback (rating and review) for a service request.
        """
        service_request = ServiceRequest.query.get(request_id)

        if not service_request:
            return {"message": "Service request not found"}, 404

        # Ensure that only the customer can submit feedback
        if service_request.customer_id != current_user.customer.customer_id:
            return {"message": "Only the customer can provide feedback"}, 403

        # Get the feedback data (rating and review)
        data = request.get_json()
        rating = data.get('rating')
        review = data.get('review')

        # Check if feedback exists already
        if service_request.rating is not None and service_request.review is not None:
            # If feedback exists, update it
            service_request.rating = rating
            service_request.review = review
            db.session.commit()
            return {"message": "Feedback updated successfully"}, 200
        else:
            # If no feedback exists, submit new feedback
            service_request.rating = rating
            service_request.review = review
            db.session.commit()
            return {"message": "Feedback submitted successfully"}, 201

    @auth_required('token')
    def get_feedback(self, request_id):
        """
        Get feedback (rating and review) for a service request.
        """
        service_request = ServiceRequest.query.get(request_id)

        if not service_request:
            return {"message": "Service request not found"}, 404

        feedback = {
            'rating': service_request.rating,
            'review': service_request.review,
        }

        return {"feedback": feedback}, 200

class ServiceRequestFeedbackAPI(Resource):
    @auth_required('token')
    def post(self, request_id):
        """
        Submit or update feedback (rating and review) for a service request.
        """
        service_request = ServiceRequest.query.get(request_id)

        if not service_request:
            return {"message": "Service request not found"}, 404

        # Ensure that only the customer can submit feedback
        if service_request.customer_id != current_user.customer.customer_id:
            return {"message": "Only the customer can provide feedback"}, 403

        # Get the feedback data (rating and review)
        data = request.get_json()
        rating = data.get('rating')
        review = data.get('review')

        # Check if feedback exists already
        if service_request.rating is not None and service_request.review is not None:
            # If feedback exists, update it
            service_request.rating = rating
            service_request.review = review
            db.session.commit()
            return {"message": "Feedback updated successfully"}, 200
        else:
            # If no feedback exists, submit new feedback
            service_request.rating = rating
            service_request.review = review
            db.session.commit()
            return {"message": "Feedback submitted successfully"}, 201

    @auth_required('token')
    def get(self, request_id):
        """
        Get feedback (rating and review) for a service request.
        """
        service_request = ServiceRequest.query.get(request_id)

        if not service_request:
            return {"message": "Service request not found"}, 404

        feedback = {
            'rating': service_request.rating,
            'review': service_request.review,
        }

        return {"feedback": feedback}, 200

# Professional API
class ProfessionalListAPI(Resource):
    @auth_required('token')
    @cache.cached(timeout=5)
    def get(self):
        professionals = Professional.query.all()
        result = []
        for professional in professionals:
            result.append({
                'id': professional.professional_id,
                'userid': professional.user_id,
                'name': professional.name,
                'email': professional.user.email if professional.user else 'N/A',
                'service': professional.service_type,
                'experience': professional.exp,
                'pin': professional.pin,
                'active': professional.user.active  # Include active status
            })
        return jsonify(result)

    @auth_required('token')
    def patch(self, professional_id):
        professional = Professional.query.filter_by(professional_id=professional_id).first()
        if not professional:
            return {"message": "Professional not found"}, 404

        # Toggle the active status
        professional.user.active = not professional.user.active
        db.session.commit()

        return {"message": f"Professional {'blocked' if not professional.user.active else 'unblocked'} successfully"}, 200


# Customer API
class CustomerListAPI(Resource):
    @auth_required('token')
    @cache.cached(timeout=5)
    def get(self):
        customers = Customer.query.all()
        result = []
        for customer in customers:
            result.append({
                'id': customer.customer_id,
                'userid': customer.user_id,
                'name': customer.name,
                'email': customer.user.email if customer.user else 'N/A',
                'pin': customer.pin,
                'address': customer.address,
                'active': customer.user.active  # Include active status
            })
        return jsonify(result)

    @auth_required('token')
    def patch(self, customer_id):
        customer = Customer.query.filter_by(customer_id=customer_id).first()
        if not customer:
            return {"message": "Customer not found"}, 404

        # Toggle the active status
        customer.user.active = not customer.user.active
        db.session.commit()

        return {"message": f"Customer {'blocked' if not customer.user.active else 'unblocked'} successfully"}, 200


class UserDeleteAPI(Resource):
    @auth_required('token')
    @roles_required('admin')  # Ensure only admins can delete users
    def delete(self, user_id):
        # Check if the provided ID corresponds to a professional
        professional = Professional.query.filter_by(user_id=user_id).first()
        if professional:
            user = User.query.get(professional.user_id)
            if user:
                # Delete services associated with the professional
                services = Service.query.filter_by(professional_id=professional.professional_id).all()
                for service in services:
                    db.session.delete(service)

                # Delete service requests associated with the professional
                service_requests = ServiceRequest.query.filter_by(professional_id=professional.professional_id).all()
                for request in service_requests:
                    db.session.delete(request)

                # Delete professional and user
                db.session.delete(professional)
                db.session.delete(user)
                db.session.commit()
                return {"message": "Professional and associated user data deleted successfully"}, 200

            return {"message": "Associated user not found for the professional"}, 404

        # Check if the provided ID corresponds to a customer
        customer = Customer.query.filter_by(user_id=user_id).first()
        if customer:
            user = User.query.get(customer.user_id)
            if user:
                # Delete service requests associated with the customer
                service_requests = ServiceRequest.query.filter_by(customer_id=customer.customer_id).all()
                for request in service_requests:
                    db.session.delete(request)

                # Delete customer and user
                db.session.delete(customer)
                db.session.delete(user)
                db.session.commit()
                return {"message": "Customer and associated user data deleted successfully"}, 200

            return {"message": "Associated user not found for the customer"}, 404

        return {"message": "No professional or customer found with the given ID"}, 404


# Add resources to API
api.add_resource(ServiceAPI, '/services/<int:service_id>')
api.add_resource(ServiceListAPI, '/services')
api.add_resource(ServiceReviewsAPI, '/services/<int:service_id>/reviews')
api.add_resource(ServiceRequestAPI, '/service_requests', '/service_requests/<int:request_id>')
api.add_resource(ServiceRequestFeedbackAPI, '/service_requests/<int:request_id>/feedback')
api.add_resource(ProfessionalListAPI, '/professionals', '/professionals/<int:professional_id>/toggle_block')
api.add_resource(CustomerListAPI, '/customers', '/customers/<int:customer_id>/toggle_block')
api.add_resource(UserDeleteAPI, '/users/<int:user_id>')