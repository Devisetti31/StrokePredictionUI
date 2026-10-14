from flask import Flask, request, jsonify, render_template
import pandas as pd
import joblib

app = Flask(__name__)

# Load trained model
model = joblib.load("brainstroke_model.pkl")
@app.route("/")
def home():
    return render_template("index.html")
@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    new_person = pd.DataFrame({
        "gender": [data["gender"]],
        "age": [float(data["age"])],
        "hypertension": [int(data["hypertension"])],
        "heart_disease": [int(data["heart_disease"])],
        "ever_married": [data["ever_married"]],
        "work_type": [data["work_type"]],
        "Residence_type": [data["Residence_type"]],
        "avg_glucose_level": [float(data["avg_glucose_level"])],
        "bmi": [float(data["bmi"])],
        "smoking_status": [data["smoking_status"]]
    })

    prediction = model.predict(new_person)

    if prediction[0] == 1:
        result = "Person is likely to have a stroke"
    else:
        result = "Person is not likely to have a stroke"

    return jsonify({
        "prediction": int(prediction[0]),
        "result": result
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)