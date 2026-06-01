from extensions import db
from models.userInfoModel import User

def get_all_users():
    users = User.query.all()
    return [serialize_user(user) for user in users], 200

def get_user_by_id(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return{"Message: User not found"}, 404
    
    return serialize_user(user),200

def create_user(data):
    new_user = User(
        first_name=data['first_name'], 
        last_name=data['last_name'],
        document=data['document'],
        phone=data['phone'],
        )
    if User.query.filter_by(document=data['document']).first():
        return {"error":"El documento ya se encuentra registrado"}, 400
    db.session.add(new_user)
    db.session.commit()
    return serialize_user(new_user), {"message": "User created successfully"}, 200

def update_user(user_id, data):
    user = User.query.get(user_id)
    
    if not user:
        return {"message": "User not found"}, 404
    
    new_document = data.get('document')
    if new_document:
        if new_document != user.document:
            existing_user = User.query.filter(
                User.document == data['document'],
                User.id != user_id
            ).first()
            if existing_user:
                return {"error":"The document is already registered"}, 400
            user.document = new_document
    
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.phone = data.get('phone', user.phone)
    db.session.commit()
    return serialize_user(user), {"message": "User updated successfully"}, 200

def delete_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return {"message": "User not found"}, 404
    db.session.delete(user)
    db.session.commit()
    return {"message": "User deleted successfully"}, 200

def serialize_user(user):
    return{
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "document": user.document,
        "phone": user.phone,
    }

