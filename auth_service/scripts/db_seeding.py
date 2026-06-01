from models.roleModel import Role
from models.userModel import UserCredentials
from extensions import db
from werkzeug.security import generate_password_hash
def seed_roles():
    roles_data = [
        {"id": 1, "role_name": "ADMIN"},
        {"id": 2, "role_name": "USER"},
        {"id": 3, "role_name": "SUPERVISOR"},
        {"id": 4, "role_name": "TECHNICIAN"},
    ]
    
    try:
        if Role.query.count() == 0:
            for r in roles_data:
                nuevo_rol = Role(id=r['id'], role_name=r['role_name'])
                db.session.add(nuevo_rol)
            db.session.commit()
            print(" Roles successfully created.")
    except Exception as e:
        db.session.rollback()
        print(f"Error creating roles: {e}")
        
def seed_admin():
    try:
        existing_admin = UserCredentials.query.filter_by(username="admin").first()

        if existing_admin:
            print("The admin user already exists.")
            return

        admin_role = Role.query.get(1)

        if not admin_role:
            print("The ADMIN role does not exist. Please run seed_roles() first.")
            return

        admin_user = UserCredentials(
            username="admin",
            password=generate_password_hash("admin123"),
            user_id=1,
            role_id=1
        )

        db.session.add(admin_user)
        db.session.commit()

        print("Admin user created successfully.")

    except Exception as e:
        db.session.rollback()
        print(f"Error creating admin user: {e}")

