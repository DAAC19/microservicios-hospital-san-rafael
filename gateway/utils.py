from flask import jsonify


def response_json(response):
    try:
        return jsonify(response.json()), response.status_code

    except Exception:
        return jsonify({
            "message": "Error occurred while communicating with the microservice",
            "status_code": response.status_code,
            "response": response.text
        }), response.status_code