from flask import Flask, request
import json

app = Flask(__name__)

@app.route('/store', methods = ['POST'])
def store_file():
    file_name = request.json["name"]
    path = request.json["path"]
    file_data = bytearray(request.json["data"]["data"])
    f = open(path + file_name, 'wb')
    f.write(file_data)
    f.close
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 


@app.route('/video', methods = ['GET'])
def stream_video():
    file_name = request.args.get('name')
    path = request.args.get('path')
    print(path + file_name)
    with open(path + file_name, 'rb') as f:
        data = f.read()
        return data


if __name__ == '__main__':
    app.run(debug=True, host='192.168.100.30', port=8090)