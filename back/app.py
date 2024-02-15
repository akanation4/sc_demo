#!/home/miyablo/.pyenv/versions/flask_peewee_3.6.4/bin/python
# -*- coding: utf-8 -*-
from flask import Flask
app = Flask(__name__)

@app.route('/')
def index():
    return "Hello World!\n"

if __name__ == '__main__':
    app.run()