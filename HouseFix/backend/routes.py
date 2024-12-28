from flask import current_app as app, render_template, request, jsonify, send_file
from flask_security import auth_required, verify_password, hash_password
from backend.models import db, Customer, Professional, Role
from datetime import datetime
from backend.celery.tasks import add, create_csv
from celery.result import AsyncResult

datastore = app.security.datastore
cache = app.cache

@app.get('/')
def home():
    return render_template('index.html')

@app.get('/celery')
def celery():
    task = add.delay(10, 20)
    return {'task_id' : task.id}

#@auth_required('token') 
@app.get('/create-csv')
def createCSV():
    task = create_csv.delay()
    return {'task_id' : task.id}, 200

# @auth_required('token') 
@app.get('/get-csv/<id>')
def getCSV(id):
    result = AsyncResult(id)

    if result.ready():
        return send_file(f'./backend/celery/user-downloads/{result.result}'), 200
    else:
        return {'message' : 'task not ready'}, 405

@app.get('/cache')
@cache.cached(timeout = 5)
def cache():
    return {'time' : str(datetime.now())}

@app.route('/login', methods=['POST'])
def login():

    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message" : "invalid inputs"}), 404
    
    user = datastore.find_user(email = email)

    if not user:
        return jsonify({"message" : "invalid email"}), 404
    
    if verify_password(password, user.password):
        return jsonify({'token' : user.get_auth_token(), 'email' : user.email, 'role' : user.roles[0].name, 'id' : user.id})

@app.route('/custregister', methods=['POST'])
def custregister():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    address = data.get('address')
    pin = data.get('pin')
    role_name = 'customer'  # Default role for customers

    if not email or not password or not name or not address or not pin:
        return jsonify({"message": "Invalid inputs"}), 400

    # Check if the user already exists
    user = datastore.find_user(email=email)
    if user:
        return jsonify({"message": "User already exists"}), 400

    # Retrieve or create the 'customer' role
    role = Role.query.filter_by(name=role_name).first()
    if not role:
        role = Role(name=role_name)
        db.session.add(role)
        db.session.commit()

    try:
        # Create user in the User table
        user = datastore.create_user(
            email=email, password=hash_password(password), roles=[role], active=True
        )
        db.session.commit()  # Commit to ensure the user is saved

        # Now that user is created, link the user to the Customer model
        customer = Customer(
            user_id=user.id,  # Use the user's id as the foreign key
            name=name,
            address=address,
            pin=pin,
        )

        db.session.add(customer)
        db.session.commit()  # Commit to save the customer

        return jsonify({"message": "Customer registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error creating user: {str(e)}"}), 500



@app.route('/profregister', methods=['POST'])
def profregister():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    service_type = data.get('service_type')
    exp = data.get('experience')
    pin = data.get('pin')
    role_name = 'professional'  # Default role for professionals

    if not email or not password or not name or not service_type or not exp or not pin:
        return jsonify({"message": "Invalid inputs"}), 400

    # Check if the user already exists
    user = datastore.find_user(email=email)
    if user:
        return jsonify({"message": "User already exists"}), 400

    # Retrieve or create the 'professional' role
    role = Role.query.filter_by(name=role_name).first()
    if not role:
        role = Role(name=role_name)
        db.session.add(role)
        db.session.commit()

    try:
        # Create user in the User table
        user = datastore.create_user(
            email=email, password=hash_password(password), roles=[role], active=False
        )
        db.session.commit()  # Commit to ensure the user is saved

        # Now that the user is created, link the user to the Professional model
        professional = Professional(
            user_id=user.id,  # Use the user's id as the foreign key
            name=name,
            service_type=service_type,
            exp=exp,
            pin=pin,
        )

        db.session.add(professional)
        db.session.commit()  # Commit to save the professional

        return jsonify({"message": "Professional registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error creating professional: {str(e)}"}), 500


