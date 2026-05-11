from models.roleModel import Role
from models.userInfoModel import db

def seed_roles():
    """Inserta roles iniciales si la tabla está vacía."""
    roles_data = [
        {"id": 1, "role_name": "Admin"},
        {"id": 2, "role_name": "User"},
    ]
    
    try:
        if Role.query.count() == 0:
            for r in roles_data:
                nuevo_rol = Role(id=r['id'], role_name=r['role_name'])
                db.session.add(nuevo_rol)
            db.session.commit()
            print(" Roles creados exitosamente.")
    except Exception as e:
        db.session.rollback()
        print(f"Error al crear los roles: {e}")