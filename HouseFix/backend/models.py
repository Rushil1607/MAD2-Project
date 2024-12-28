from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
from datetime import datetime

db = SQLAlchemy()

# Define User model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    # Flask-Security specific fields
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)
    active = db.Column(db.Boolean, default=True)
    
    # Relationship with roles
    roles = db.relationship('Role', backref='bearers', secondary='user_roles')

    # Relationship with Professional and Customer models
    professional = db.relationship('Professional', back_populates='user', uselist=False)
    customer = db.relationship('Customer', back_populates='user', uselist=False)

# Define Role model
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)

# Define UserRoles model for many-to-many relationship between User and Role
class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

# Define Professional model
class Professional(db.Model):
    professional_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Ensure this is required
    user = db.relationship('User', back_populates='professional')  # Back-populates User.professional
    name = db.Column(db.String, nullable=False)
    service_type = db.Column(db.String, nullable=False)
    exp = db.Column(db.String, nullable=False)
    pin = db.Column(db.Integer, nullable=False)


class Customer(db.Model):
    customer_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', back_populates='customer')  # Back-populates User.customer
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    pin = db.Column(db.Integer, nullable=False)


# Define Service model
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    price = db.Column(db.Integer, nullable=False)
    time_req = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.professional_id'))

# Define ServiceRequest model
class ServiceRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'))
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.customer_id'))
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.professional_id'))
    req_date = db.Column(db.DateTime, default=datetime.now())
    comp_date = db.Column(db.DateTime)
    status = db.Column(db.String, default='Pending')
    review = db.Column(db.String)
    rating = db.Column(db.Integer)

    # Relationship to Customer model
    customer = db.relationship('Customer', backref='service_requests')

    # Relationship to Service model
    service = db.relationship('Service', backref='service_requests')

    # Relationship to Professional model
    professional = db.relationship('Professional', backref='service_requests')

