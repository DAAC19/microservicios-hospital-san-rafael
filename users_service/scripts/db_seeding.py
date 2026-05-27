from extensions import db
from models.userInfoModel import User


def seed_admin_user():
    try:
        existing_admin = User.query.get(1)

        if existing_admin:
            print("The admin user already exists in users_service.")
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

        print("Admin user created successfully in users_service.")

    except Exception as e:
        db.session.rollback()
        print(f"Error creating admin user in users_service: {e}")


def seed_all():
    seed_admin_user()