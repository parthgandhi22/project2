from flask import Flask, request, jsonify
from flask_cors import CORS
import dlib
import requests
import numpy as np
import cv2 as cv
import base64 

app=Flask(__name__) #starts flask
CORS(app)
app.config["MAX_CONTENT_LENGTH"]=50*1024*1024 

#pre trained models
detector=dlib.get_frontal_face_detector()
shape_predictor=dlib.shape_predictor("shape_predictor_5_face_landmarks.dat")
face_rec_model=dlib.face_recognition_model_v1("dlib_face_recognition_resnet_model_v1.dat")

def extract_embedding(image_url):
    image=None
    if image_url.startswith("http"):
        response=requests.get(image_url)
        image_np=np.frombuffer(response.content,np.uint8)
        image=cv.imdecode(image_np,cv.IMREAD_COLOR)
    elif image_url.startswith("data:image"):
        header, encoded = image_url.split(",", 1)  # Remove "data:image/jpeg;base64,"
        image_data = base64.b64decode(encoded)
        image_np = np.frombuffer(image_data, np.uint8)
        image= cv.imdecode(image_np, cv.IMREAD_COLOR) 
    else:
        return None
    
    if image is None:
        return None
    
    gray=cv.cvtColor(image,cv.COLOR_BGR2GRAY)

    #detects faces
    faces=detector(gray)
    if len(faces)==0:
        return None
    
    #lamdmarks and 128d embeddings
    shape = shape_predictor(image, faces[0])
    
    # Take 3 embeddings and average them
    embeddings = []
    for _ in range(3):
        face_embed = face_rec_model.compute_face_descriptor(image, shape)
        embeddings.append(np.array(face_embed))

    avg_embedding = np.median(embeddings, axis=0)  # Compute average
    return list(avg_embedding)

#accepting the post request
@app.route("/get-embedding",methods=["POST"])

def get_embeddings():
    data=request.json
    image_url=data.get("image_url")

    if not image_url:
        return jsonify({"message":"Image URL required"}),400

    embeddings=extract_embedding(image_url)
    if embeddings is None:
        return jsonify({"message":"No face detected"}),400

    return jsonify({"embeddings":embeddings}),200

if __name__=="__main__":       #running the port
    app.run(port=5000,debug=True)