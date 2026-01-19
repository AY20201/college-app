import json
import os
import threading

import mysql.connector
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

load_dotenv()
# Flask constructor takes the name of
# current module (__name__) as argument.
app = Flask(__name__)
#CORS(app)

#DB_URL = os.getenv("SUPABASE_DB_URL_SHARED_POOL")
#DB_PASS = os.getenv("SUPABASE_DB_PASSWORD")
#DB_HOST = os.getenv("SUPABASE_DB_HOST")

DB_HOST = os.getenv("MYSQL_DB_HOST")
DB_USER = os.getenv("MYSQL_DB_USER")
DB_NAME = os.getenv("MYSQL_DB_NAME")
DB_PASSWORD = os.getenv("MYSQL_DB_PASSWORD")

try:
    conn = mysql.connector.connect(
      host=DB_HOST,
      user=DB_USER,
      password=DB_PASSWORD,
      database=DB_NAME
    )
    conn.autocommit = True
    print("Connection to database successful")
except mysql.connector.OperationalError as e:
    print(f"Unable to connect to the database: {e}")
    #print("Failed to connect to database")

def delete_activity_request(request_id):
    with conn.cursor() as curs:
        try:
            curs.execute("DELETE FROM activity_requests WHERE request_id = %s", (request_id,))
            print(f"Deleted activity {request_id}")
        except (Exception, mysql.connector.DatabaseError) as error:
            print(error)

def delete_join_request(user_id, group_id):
    with conn.cursor() as curs:
        try:
            curs.execute("DELETE FROM join_requests WHERE user_id = %s AND group_id = %s", (user_id, group_id,))
            print(f"Deleted join requests from {user_id} for group {group_id}")
        except (Exception, mysql.connector.DatabaseError) as error:
            print(error)

# The route() function of the Flask class is a decorator,
# which tells the application which URL should call
# the associated function.
@app.route('/')
def hello_word():
    return "Hello World"

@app.route('/add_user', methods=['POST'])
def add_user():
    if request.method == 'POST':
        data = request.get_json()

        user_id = data.get("userId")
        user_name = data.get("userName")
        email = data.get("email")
        phone_number = data.get("phoneNumber")

        with conn.cursor() as curs:
            try:
                curs.execute("INSERT INTO users (user_id, user_name, email, phone_number) VALUES (%s, %s, %s, %s)", (user_id, user_name, email, phone_number))
                return jsonify({"status": "success", "user": data})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/filter_users')
def filter_users():
    if request.method == 'GET':
        search_query = request.args.get('search_query')
        with conn.cursor() as curs:
            try:
                curs.execute(f"SELECT * FROM users WHERE LOWER(user_name) LIKE LOWER('%{search_query}%')")
                all_rows = curs.fetchall()
                return jsonify({"results": all_rows})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/modify_phone_number', methods=['POST'])
def modify_phone_number():
    if request.method == 'POST':
        data = request.get_json()

        user_id = data.get("userId")
        new_number = data.get("phoneNumber")
        with conn.cursor() as curs:
            try:
                curs.execute("UPDATE users SET phone_number = %s WHERE user_id = %s", (new_number, user_id,))
                return jsonify({"status": "success", "user": data})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/check_user')
def check_user():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        with conn.cursor() as curs:
            try:
                curs.execute("SELECT phone_number FROM users WHERE user_id = %s", (user_id,))
                user = curs.fetchall()
                return jsonify({"results": user})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/get_likes_list')
def get_likes_list():
    if request.method == 'GET':
        request_id = request.args.get('request_id')
        group_id = request.args.get('group_id')

        with conn.cursor() as curs:
            try:
                curs.execute("SELECT user_likes FROM activity_requests WHERE request_id = %s", (request_id,))
                likes_list = curs.fetchone()[0]

                if(likes_list):
                    curs.execute("SELECT users.user_id, users.user_name, phone_number, user_groups.hide_number FROM users INNER JOIN user_groups ON users.user_id = user_groups.user_id WHERE JSON_CONTAINS(%s, JSON_QUOTE(users.user_id)) AND user_groups.group_id = %s", (likes_list, group_id,))

                    user_list = curs.fetchall()
                    print(user_list)
                    #curs.execute(f"SELECT hide_number FROM user_groups WHERE user_id = ANY(ARRAY{likes_list[0]}::TEXT[]) AND group_id = '{group_id}'")

                    return jsonify({"results": user_list})
                return []
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/add_user_group', methods=['POST'])
def add_user_group():
    if request.method == 'POST':
        data = request.get_json()

        user_id = data.get("userId")
        group_id = data.get("groupId")
        user_name = data.get("userName")

        with conn.cursor() as curs:
            try:
                curs.execute("INSERT INTO user_groups (id, user_id, group_id, user_name) VALUES (UUID(), %s, %s, %s)", (user_id, group_id, user_name,))
                #curs.execute("SELECT * FROM test_students")
                return jsonify({"status": "success", "user": data})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/leave_user_group', methods=['POST'])
def leave_user_group():
    if request.method == 'POST':
        data = request.get_json()

        user_id = data.get("userId")
        group_id = data.get("groupId")

        with conn.cursor() as curs:
            try:
                curs.execute(f"DELETE FROM user_groups WHERE user_id = %s AND group_id = %s", (user_id, group_id,))

                return jsonify({"status": "success", "user": data})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/like_activity', methods=['POST'])
def like_activity():
    if request.method == 'POST':
        data = request.get_json()

        request_id = data.get("requestId")
        user_id = data.get("userId")
        remove_like = data.get("removeLike")
        with conn.cursor() as curs:
            #print("Connection Successful")
            try:
                if(remove_like):
                    curs.execute("SELECT user_likes FROM activity_requests WHERE request_id = %s", (request_id,))
                    json_list = curs.fetchone()[0]
                    likes_list = json.loads(json_list)
                    if(user_id in likes_list):
                        likes_list.remove(user_id)
                        json_payload = json.dumps(likes_list)
                        curs.execute("UPDATE activity_requests SET user_likes = %s WHERE request_id = %s", (json_payload, request_id,))
                else:
                    curs.execute("UPDATE activity_requests SET user_likes = JSON_ARRAY_APPEND(user_likes, '$', %s) WHERE request_id = %s", (user_id, request_id,))

                return jsonify({"status": "success", "user": data})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})


@app.route('/user_groups')
def get_user_groups():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        group_id = request.args.get('group_id')

        with conn.cursor() as curs:
            #print("Connection Successful")
            try:
                if(group_id == "undefined"):
                    curs.execute(f"SELECT id, name, description, private, searchable, owner FROM campus_groups WHERE id = ANY(SELECT group_id FROM user_groups WHERE user_id = %s)", (user_id,))
                    all_groups = curs.fetchall()

                    json_dict = {"results" : all_groups}
                    return jsonify(json_dict)
                else:
                    curs.execute("SELECT user_id, group_id, user_name, hide_number FROM user_groups WHERE user_id = %s AND group_id = %s", (user_id, group_id,))
                    row = curs.fetchone()
                    return jsonify({"results": row})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failure", "error": error})

@app.route('/group_members')
def get_group_members():
    if request.method == 'GET':
        group_id = request.args.get('group_id')

        with conn.cursor() as curs:
            try:
                curs.execute("SELECT user_id, user_name FROM user_groups WHERE group_id = %s", (group_id,))
                all_rows = curs.fetchall() #IDs for all groups a user is part of
                json_dict = {"results" : all_rows}
                return jsonify(json_dict)
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failure", "error": error})

@app.route('/remove_group_member', methods=['POST'])
def remove_group_member():
    if request.method == 'POST':
        data = request.get_json()
        group_id = data.get('groupId')
        user_id = data.get('userId')

        with conn.cursor() as curs:
            try:
                curs.execute("DELETE FROM user_groups WHERE group_id = %s AND user_id = %s", (group_id, user_id,))

                curs.execute("SELECT request_id FROM activity_requests WHERE group_id = %s", (group_id,))
                group_activity_requests = curs.fetchall()
                for request_id in group_activity_requests:
                    curs.execute("SELECT user_likes FROM activity_requests WHERE request_id = %s", (request_id[0],))
                    json_list = curs.fetchone()[0]
                    likes_list = json.loads(json_list)
                    if(user_id in likes_list):
                        likes_list.remove(user_id)
                        json_payload = json.dumps(likes_list)
                        curs.execute("UPDATE activity_requests SET user_likes = %s WHERE request_id = %s", (json_payload, request_id[0],))
                return jsonify({"status": "success", "user": data})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failure", "error": error})

@app.route('/groups')
def get_groups():
    if request.method == 'GET':
        with conn.cursor() as curs:
            #print("Connection Successful")
            try:
                curs.execute("SELECT name, description, private, id, owner FROM campus_groups WHERE searchable = True")
                all_rows = curs.fetchall()
                json_dict = {"results" : all_rows}
                return jsonify(json_dict)
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failure", "error": error})

@app.route('/add_group', methods=['POST'])
#@cross_origin()
# ‘/’ URL is bound with hello_world() function.
def add_group():
    if request.method == 'POST':
        data = request.get_json()

        name = data.get("name")
        description = data.get("description")
        private = data.get("isPrivate")
        searchable = data.get("isSearchable")
        owner = data.get("owner")
        #print(name, description, id)

        with conn.cursor() as curs:
            try:
                curs.execute("SELECT UUID()")
                group_id = curs.fetchone()[0]

                curs.execute("INSERT INTO campus_groups (id, name, description, private, searchable, owner) VALUES (%s, %s, %s, %s, %s, %s)", (group_id, name, description, private, searchable, owner,))
                #curs.execute("SELECT * FROM test_students")
                #curs.execute("SELECT * FROM activity_requests ORDER BY request_id DESC LIMIT 1;")
                #last_id = last_row[len(last_row) - 1]

                return jsonify({"status": "success", "id": group_id})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/activity_requests')
def get_activity_requests():
    if request.method == 'GET':
        with conn.cursor() as curs:
            try:
                curs.execute("""
                            SELECT users.user_id, users.user_name, users.email, users.phone_number, user_groups.hide_number, activity, location, activity_requests.group_id, request_id, time_posted, user_likes FROM activity_requests
                            INNER JOIN users ON users.user_id = activity_requests.user_id
                            INNER JOIN user_groups ON user_groups.user_id = activity_requests.user_id AND user_groups.group_id = activity_requests.group_id
                            """)
                all_rows = curs.fetchall()
                json_dict = {"results" : all_rows}
                #print(json_dict)
                return jsonify(json_dict)
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failure", "error": error})

@app.route('/add_activity_request', methods=['POST'])
def add_activity_request():
    if request.method == 'POST':
        data = request.get_json()

        user_id = data.get("userId")
        activity = data.get("activity")
        location = data.get("location")
        group_id = data.get("groupId")
        time_posted = data.get("timePosted")

        with conn.cursor() as curs:
            try:
                curs.execute("SELECT UUID()")
                request_id = curs.fetchone()[0]

                curs.execute("INSERT INTO activity_requests (request_id, user_id, activity, location, group_id, time_posted, user_likes) VALUES (%s, %s, %s, %s, %s, %s, '[]')", (request_id, user_id, activity, location, group_id, time_posted,))
                delay_seconds = 45 * 60

                # Create a Timer object: it runs the function after the specified delay
                timer = threading.Timer(delay_seconds, delete_activity_request, args=(request_id,))
                # Start the timer thread
                timer.start()
                #curs.execute("SELECT * FROM test_students")
                return jsonify({"status": "success", "user": data, "id": request_id})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/modify_privacy_status', methods=['POST'])
def modify_privacy_status():
    if request.method == 'POST':
        data = request.get_json()

        group_id = data.get("groupId")
        new_privacy_status = data.get("newPrivacyStatus")
        use_searchable = data.get("useSearchable")

        field_to_alter = "private"
        if(use_searchable):
            field_to_alter = "searchable"

        with conn.cursor() as curs:
            try:
                curs.execute(f"UPDATE campus_groups SET {field_to_alter} = {new_privacy_status} WHERE id = '{group_id}'")

                return jsonify({"status": "success", "user": data})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/modify_hide_number', methods=['POST'])
def modify_hide_number():
    if request.method == 'POST':
        data = request.get_json()

        user_id = data.get("userId")
        group_id = data.get("groupId")
        new_status = data.get("newStatus")

        with conn.cursor() as curs:
            try:
                curs.execute("UPDATE user_groups SET hide_number = %s WHERE user_id = %s AND group_id = %s", (new_status, user_id, group_id,))
                return jsonify({"status": "success", "user": data})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/delete_group', methods=['POST'])
def delete_group():
    if request.method == 'POST':
        data = request.get_json()

        group_id = data.get("groupId")

        with conn.cursor() as curs:
            try:
                curs.execute("DELETE FROM campus_groups WHERE id = %s", (group_id,))
                curs.execute("DELETE FROM user_groups WHERE group_id = %s", (group_id,))
                curs.execute("DELETE FROM activity_requests WHERE group_id = %s", (group_id,))
                return jsonify({"status": "success", "user": data})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/add_join_request', methods=['POST'])
def add_join_request():
    if request.method == 'POST':
        data = request.get_json()

        user_id = data.get("userId")
        user_name = data.get("userName")
        group_id = data.get("groupId")

        with conn.cursor() as curs:
            try:
                curs.execute("INSERT INTO join_requests (id, user_id, user_name, group_id) VALUES (UUID(), %s, %s, %s)", (user_id, user_name, group_id,))

                return jsonify({"status": "success", "user": data})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/accept_join_request', methods=['POST'])
def accept_join_request():
    if request.method == 'POST':
        data = request.get_json()

        user_id = data.get("userId")
        group_id = data.get("groupId")
        multiple = data.get("multiple")

        with conn.cursor() as curs:
            try:
                # curs.execute(f"UPDATE join_requests SET accepted = True WHERE user_id = '{user_id}' AND group_id = '{group_id}'")
                if(multiple):
                    curs.execute("DELETE FROM join_requests WHERE group_id = %s", (group_id,))
                else:
                    curs.execute("DELETE FROM join_requests WHERE user_id = %s AND group_id = %s", (user_id, group_id,))

                # delay_seconds = 5 * 60
                # timer = threading.Timer(delay_seconds, delete_join_request, args=(user_id, group_id,))
                # timer.start()

                return jsonify({"status": "success", "user": data})
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/user_join_requests')
def get_user_join_requests():
    if request.method == 'GET':
        user_id = request.args.get('user_id')

        with conn.cursor() as curs:
            try:
                curs.execute(f"SELECT group_id FROM join_requests WHERE user_id = %s", (user_id,))
                all_rows = curs.fetchall()

                print(all_rows)

                json_dict = {"results" : all_rows}
                return jsonify(json_dict)
            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/join_requests')
def get_join_requests():
    if request.method == 'GET':
        group_id = request.args.get('group_id')

        with conn.cursor() as curs:
            try:
                curs.execute(f"SELECT user_id, group_id, user_name FROM join_requests WHERE group_id = %s", (group_id,))
                request_list = curs.fetchall()

                return jsonify({"results": request_list})

            except (Exception, mysql.connector.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

# main driver function
if __name__ == '__main__':
    # run() method of Flask class runs the application
    # on the local development server.
    app.run(debug=True)