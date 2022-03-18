from flask import Flask, request
import json

app = Flask(__name__)

@app.route('/', methods = ['POST'])
def authenticate():
    if request.json['username'] == 'test' and request.json['password'] == '123':
        print(True)
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    else:
        print(False)
        return json.dumps({'success':False}), 200, {'ContentType':'application/json'} 


if __name__ == '__main__':
    app.run(debug=True, host='192.168.100.40', port=8110)