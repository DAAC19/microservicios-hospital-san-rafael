from extensions import db
from models.userInfoModel import User


def seed_admin_user():
    try:
        existing_admin = User.query.get(1)

        if existing_admin:
            print("El usuario admin ya existe en users_service.")
            return

        admin_user = User(
            id=1,
            first_name="Admin",
            last_name="Principal",
            document="000000001",
            phone="3000000000"
        )

        db.session.add(admin_user)
        db.session.commit()

        print("Usuario admin creado exitosamente en users_service.")

    except Exception as e:
        db.session.rollback()
        print(f"Error al crear usuario admin en users_service: {e}")


def seed_all():
    seed_admin_user()