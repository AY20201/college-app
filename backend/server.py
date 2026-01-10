import threading

import psycopg2
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin

# Flask constructor takes the name of 
# current module (__name__) as argument.
app = Flask(__name__)
#CORS(app)

try:
    conn = psycopg2.connect(
        host="localhost",
        database="college_app",
        user="postgres",
        password="Amy!2023"
    )
    conn.autocommit = True
except:
    print("Failed to connect to database")

def delete_activity_request(request_id):
    with conn.cursor() as curs:
        try:
            curs.execute(f"DELETE FROM activity_requests WHERE request_id = '{request_id}'")
            print(f"Deleted activity {request_id}")
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)

def delete_join_request(user_id, group_id):
    with conn.cursor() as curs:
        try:
            curs.execute(f"DELETE FROM join_requests WHERE user_id = '{user_id}' AND group_id = '{group_id}'")
            print(f"Deleted join requests from {user_id} for group {group_id}")
        except (Exception, psycopg2.DatabaseError) as error:
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
                curs.execute(f"INSERT INTO users (user_id, user_name, email, phone_number) VALUES ('{user_id}', '{user_name}', '{email}', '{phone_number}')")
                return jsonify({"status": "success", "user": data})
            except (Exception, psycopg2.DatabaseError) as error:
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
            except (Exception, psycopg2.DatabaseError) as error:
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
                curs.execute(f"UPDATE users SET phone_number = '{new_number}' WHERE user_id = '{user_id}'")
                return jsonify({"status": "success", "user": data})
            except (Exception, psycopg2.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/check_user')
def check_user():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        with conn.cursor() as curs:
            try:
                curs.execute(f"SELECT phone_number FROM users WHERE user_id = '{user_id}'")
                user = curs.fetchall()
                return jsonify({"results": user})
            except (Exception, psycopg2.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/get_likes_list')
def get_likes_list():
    if request.method == 'GET':
        request_id = request.args.get('request_id')
        group_id = request.args.get('group_id')

        with conn.cursor() as curs:
            try:
                curs.execute(f"SELECT user_likes FROM activity_requests WHERE request_id = '{request_id}'")
                likes_list = curs.fetchone()

                if(likes_list):
                    curs.execute(f"SELECT users.user_id, users.user_name, phone_number, user_groups.hide_number FROM users INNER JOIN user_groups ON users.user_id = user_groups.user_id WHERE users.user_id = ANY(ARRAY{likes_list[0]}::TEXT[]) AND user_groups.group_id = '{group_id}'")
                    user_list = curs.fetchall()

                    #curs.execute(f"SELECT hide_number FROM user_groups WHERE user_id = ANY(ARRAY{likes_list[0]}::TEXT[]) AND group_id = '{group_id}'")

                    return jsonify({"results": user_list})
                return []
            except (Exception, psycopg2.DatabaseError) as error:
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
                curs.execute(f"INSERT INTO user_groups (user_id, group_id, user_name) VALUES ('{user_id}', '{group_id}', '{user_name}')")
                #curs.execute("SELECT * FROM test_students")
                return jsonify({"status": "success", "user": data})
            except (Exception, psycopg2.DatabaseError) as error:
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
                curs.execute(f"DELETE FROM user_groups WHERE user_id = '{user_id}' AND group_id = '{group_id}'")

                return jsonify({"status": "success", "user": data})
            except (Exception, psycopg2.DatabaseError) as error:
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
                    curs.execute(f"UPDATE activity_requests SET user_likes = array_remove(user_likes, '{user_id}') WHERE request_id = '{request_id}'")
                else:
                    curs.execute(f"UPDATE activity_requests SET user_likes = array_append(user_likes, '{user_id}') WHERE request_id = '{request_id}'")

                return jsonify({"status": "success", "user": data})
            except (Exception, psycopg2.DatabaseError) as error:
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
                    curs.execute(f"SELECT group_id FROM user_groups WHERE user_id = '{user_id}'")
                    all_group_ids = curs.fetchall() #IDs for all groups a user is part of
                    if(all_group_ids):
                        array_string = "["
                        for i in range(len(all_group_ids)):
                            array_string += f"'{str(all_group_ids[i][0])}'"
                            if(i != len(all_group_ids) - 1):
                                array_string += ","
                        array_string += "]"

                        curs.execute(f"SELECT * FROM groups WHERE id = ANY(ARRAY{array_string}::UUID[])")
                        all_groups = curs.fetchall()

                        json_dict = {"results" : all_groups}
                        return jsonify(json_dict)
                    else:
                        return jsonify({"results" : []})
                else:
                    curs.execute(f"SELECT * FROM user_groups WHERE user_id = '{user_id}' AND group_id = '{group_id}'")
                    row = curs.fetchone()
                    return jsonify({"results": row})
            except (Exception, psycopg2.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failure", "error": error})

@app.route('/group_members')
def get_group_members():
    if request.method == 'GET':
        group_id = request.args.get('group_id')

        with conn.cursor() as curs:
            try:
                curs.execute(f"SELECT user_id, user_name FROM user_groups WHERE group_id = '{group_id}'")
                all_rows = curs.fetchall() #IDs for all groups a user is part of
                json_dict = {"results" : all_rows}
                return jsonify(json_dict)
            except (Exception, psycopg2.DatabaseError) as error:
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
                curs.execute(f"DELETE FROM user_groups WHERE group_id = '{group_id}' AND user_id = '{user_id}'")
                return jsonify({"status": "success", "user": data})
            except (Exception, psycopg2.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failure", "error": error})

@app.route('/groups')
def get_groups():
    if request.method == 'GET':
        with conn.cursor() as curs:
            #print("Connection Successful")
            try:
                curs.execute(f"SELECT * FROM groups WHERE searchable = True")
                all_rows = curs.fetchall()
                json_dict = {"results" : all_rows}
                return jsonify(json_dict)
            except (Exception, psycopg2.DatabaseError) as error:
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
                curs.execute(f"INSERT INTO groups (name, description, private, searchable, owner) VALUES ('{name}', '{description}', {private}, {searchable}, '{owner}') RETURNING id")
                #curs.execute("SELECT * FROM test_students")
                #curs.execute("SELECT * FROM activity_requests ORDER BY request_id DESC LIMIT 1;")
                group_id = curs.fetchone()[0]
                #last_id = last_row[len(last_row) - 1]

                return jsonify({"status": "success", "id": group_id})
            except (Exception, psycopg2.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/activity_requests')
def get_activity_requests():
    if request.method == 'GET':
        with conn.cursor() as curs:
            try:
                curs.execute(f"""
                            SELECT users.user_id, users.user_name, users.email, users.phone_number, user_groups.hide_number, activity, location, activity_requests.group_id, request_id, time_posted::text, user_likes FROM activity_requests 
                            INNER JOIN users ON users.user_id = activity_requests.user_id
                            INNER JOIN user_groups ON user_groups.user_id = activity_requests.user_id AND user_groups.group_id = activity_requests.group_id
                            """)
                all_rows = curs.fetchall()
                json_dict = {"results" : all_rows}
                #print(json_dict)
                return jsonify(json_dict)
            except (Exception, psycopg2.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failure", "error": error})

@app.route('/add_activity_request', methods=['POST'])
def add_activity_request():
    if request.method == 'POST':
        data = request.get_json()

        user_id = data.get("user_id")
        activity = data.get("activity")
        location = data.get("location")
        group_id = data.get("group_id")

        with conn.cursor() as curs:
            try:
                curs.execute(f"INSERT INTO activity_requests (user_id, activity, location, group_id) VALUES ('{user_id}', '{activity}', '{location}', '{group_id}') RETURNING request_id")
                request_id = curs.fetchone()[0]
                delay_seconds = 45 * 60

                # Create a Timer object: it runs the function after the specified delay
                timer = threading.Timer(delay_seconds, delete_activity_request, args=(request_id,))
                # Start the timer thread
                timer.start()
                #curs.execute("SELECT * FROM test_students")
                return jsonify({"status": "success", "user": data, "id": request_id})
            except (Exception, psycopg2.DatabaseError) as error:
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
                curs.execute(f"UPDATE groups SET {field_to_alter} = {new_privacy_status} WHERE id = '{group_id}'")
                
                return jsonify({"status": "success", "user": data})
            except (Exception, psycopg2.DatabaseError) as error:
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
                curs.execute(f"UPDATE user_groups SET hide_number = {new_status} WHERE user_id = '{user_id}' AND group_id = '{group_id}'")
                return jsonify({"status": "success", "user": data})
            except (Exception, psycopg2.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/delete_group', methods=['POST'])
def delete_group():
    if request.method == 'POST':
        data = request.get_json()

        group_id = data.get("groupId")

        with conn.cursor() as curs:
            try:
                curs.execute(f"DELETE FROM groups WHERE id = '{group_id}'")
                curs.execute(f"DELETE FROM user_groups WHERE group_id = '{group_id}'")
                curs.execute(f"DELETE FROM activity_requests WHERE group_id = '{group_id}'")
                return jsonify({"status": "success", "user": data})
            except (Exception, psycopg2.DatabaseError) as error:
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
                curs.execute(f"INSERT INTO join_requests (user_id, user_name, group_id) VALUES ('{user_id}', '{user_name}', '{group_id}')")
                
                return jsonify({"status": "success", "user": data})
            except (Exception, psycopg2.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/accept_join_request', methods=['POST'])
def accept_join_request():
    if request.method == 'POST':
        data = request.get_json()

        user_id = data.get("userId")
        group_id = data.get("groupId")

        with conn.cursor() as curs:
            try:
                # curs.execute(f"UPDATE join_requests SET accepted = True WHERE user_id = '{user_id}' AND group_id = '{group_id}'")
                curs.execute(f"DELETE FROM join_requests WHERE user_id = '{user_id}' AND group_id = '{group_id}'")

                # delay_seconds = 5 * 60
                # timer = threading.Timer(delay_seconds, delete_join_request, args=(user_id, group_id,))
                # timer.start()

                return jsonify({"status": "success", "user": data})
            except (Exception, psycopg2.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/user_join_requests')
def get_user_join_requests():
    if request.method == 'GET':
        user_id = request.args.get('user_id')

        with conn.cursor() as curs:
            try:
                curs.execute(f"SELECT group_id FROM join_requests WHERE user_id = '{user_id}'")
                all_rows = curs.fetchall()

                print(all_rows)

                json_dict = {"results" : all_rows}
                return jsonify(json_dict)
            except (Exception, psycopg2.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

@app.route('/join_requests')
def get_join_requests():
    if request.method == 'GET':
        group_id = request.args.get('group_id')

        with conn.cursor() as curs:
            try:
                curs.execute(f"SELECT * FROM join_requests WHERE group_id = '{group_id}'")
                request_list = curs.fetchall()

                return jsonify({"results": request_list})

            except (Exception, psycopg2.DatabaseError) as error:
                print(error)
                return jsonify({"status": "failed"})

# main driver function
if __name__ == '__main__':
    # run() method of Flask class runs the application 
    # on the local development server.
    app.run(debug=True)