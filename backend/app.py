from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson.objectid import ObjectId
import os

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb://localhost:27017/")
db = client["Gesture_lit"]

users_collection = db["users"]
books_collection = db["books"]
orders_collection = db["orders"]

BOOK_FOLDER = "books"
IMAGE_FOLDER = "static"

os.makedirs(BOOK_FOLDER, exist_ok=True)
os.makedirs(IMAGE_FOLDER, exist_ok=True)

HISTORY_COLLECTIONS = ["history", "reading_history", "readingHistory", "user_history", "readingHistoryCollection"]
BOOKMARK_COLLECTIONS = ["bookmarks", "bookmark", "user_bookmarks", "saved_bookmarks"]


def safe_int(value):
    try:
        return int(value)
    except:
        return 0


def get_all_history():
    history_list = []

    for collection_name in HISTORY_COLLECTIONS:
        collection = db[collection_name]

        for item in collection.find():
            history_list.append({
                "id": str(item.get("_id")),
                "email": item.get("email") or item.get("userEmail") or item.get("user") or item.get("username") or "Unknown",
                "bookId": item.get("bookId") or item.get("book_id") or item.get("book") or "",
                "bookTitle": item.get("bookTitle") or item.get("title") or item.get("bookName") or item.get("book") or "Unknown Book",
                "page": item.get("page") or item.get("pageNo") or item.get("pageNumber") or item.get("lastPage") or "N/A",
                "date": item.get("date") or item.get("createdDate") or item.get("lastReadDate") or item.get("timestamp") or "N/A",
                "time": item.get("time") or item.get("createdTime") or item.get("lastReadTime") or "N/A"
            })

    return history_list


def get_all_bookmarks():
    bookmarks_list = []

    for collection_name in BOOKMARK_COLLECTIONS:
        collection = db[collection_name]

        for item in collection.find():
            bookmarks_list.append({
                "id": str(item.get("_id")),
                "email": item.get("email") or item.get("userEmail") or item.get("user") or item.get("username") or "Unknown",
                "bookId": item.get("bookId") or item.get("book_id") or item.get("book") or "",
                "bookTitle": item.get("bookTitle") or item.get("title") or item.get("bookName") or item.get("book") or "Unknown Book",
                "page": item.get("page") or item.get("pageNo") or item.get("pageNumber") or item.get("lastPage") or "N/A",
                "date": item.get("date") or item.get("createdDate") or item.get("timestamp") or "N/A",
                "time": item.get("time") or item.get("createdTime") or "N/A"
            })

    return bookmarks_list


@app.route("/")
def home():
    return jsonify({"message": "Gesture_lit backend connected with MongoDB Compass"})


@app.route("/register", methods=["POST"])
def register():
    data = request.json

    name = data["name"]
    email = data["email"]
    password = data["password"]

    existing_user = users_collection.find_one({"email": email})

    if existing_user:
        return jsonify({"error": "Email already exists"})

    hashed_password = generate_password_hash(password)

    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": "user"
    })

    return jsonify({"message": "User registered successfully"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data["email"]
    password = data["password"]

    user = users_collection.find_one({"email": email})

    if user and check_password_hash(user["password"], password):
        return jsonify({
            "message": "Login successful",
            "user": {
                "name": user.get("name"),
                "email": user.get("email"),
                "role": user.get("role", "user")
            }
        })

    return jsonify({"error": "Invalid email or password"})


@app.route("/admin-login", methods=["POST"])
def admin_login():
    data = request.json

    email = data["email"]
    password = data["password"]

    if email == "hasratbhatia@gmail.com" and password == "hasrat123":
        return jsonify({
            "message": "Admin login successful",
            "admin": {
                "name": "Admin",
                "email": email,
                "role": "admin"
            }
        })

    return jsonify({"error": "Invalid admin credentials"}), 401


@app.route("/upload-book", methods=["POST"])
def upload_book():
    title = request.form.get("title")
    category = request.form.get("category")
    soft_price = request.form.get("softPrice")
    hard_price = request.form.get("hardPrice")

    pdf = request.files.get("pdf")
    image = request.files.get("image")

    if not title or not category or not soft_price or not hard_price or not pdf or not image:
        return jsonify({"error": "All fields are required"}), 400

    pdf_filename = secure_filename(pdf.filename)
    image_filename = secure_filename(image.filename)

    pdf.save(os.path.join(BOOK_FOLDER, pdf_filename))
    image.save(os.path.join(IMAGE_FOLDER, image_filename))

    books_collection.insert_one({
        "title": title,
        "category": category,
        "softPrice": soft_price,
        "hardPrice": hard_price,
        "pdf": pdf_filename,
        "image": image_filename
    })

    return jsonify({"message": "Book uploaded successfully"})


@app.route("/get-books", methods=["GET"])
def get_books():
    books = []

    for book in books_collection.find():
        books.append({
            "id": str(book["_id"]),
            "title": book.get("title"),
            "category": book.get("category"),
            "softPrice": book.get("softPrice"),
            "hardPrice": book.get("hardPrice"),
            "pdf": book.get("pdf"),
            "image": book.get("image")
        })

    return jsonify(books)


@app.route("/book-image/<filename>")
def get_book_image(filename):
    return send_from_directory(IMAGE_FOLDER, filename)


@app.route("/books/<filename>")
def get_book(filename):
    return send_from_directory(BOOK_FOLDER, filename)


@app.route("/delete-book/<book_id>", methods=["DELETE"])
def delete_book(book_id):
    book = books_collection.find_one({"_id": ObjectId(book_id)})

    if not book:
        return jsonify({"error": "Book not found"}), 404

    books_collection.delete_one({"_id": ObjectId(book_id)})

    return jsonify({"message": "Book deleted successfully"})


@app.route("/admin-users", methods=["GET"])
def admin_users():
    users = []

    for user in users_collection.find():
        users.append({
            "id": str(user.get("_id")),
            "name": user.get("name", "No Name"),
            "email": user.get("email", "No Email"),
            "role": user.get("role", "user")
        })

    return jsonify(users)


@app.route("/admin-books", methods=["GET"])
def admin_books():
    books = []

    for book in books_collection.find():
        books.append({
            "id": str(book["_id"]),
            "title": book.get("title"),
            "category": book.get("category"),
            "softPrice": book.get("softPrice"),
            "hardPrice": book.get("hardPrice"),
            "pdf": book.get("pdf"),
            "image": book.get("image")
        })

    return jsonify(books)


@app.route("/admin-orders", methods=["GET"])
def admin_orders():
    orders = []

    for order in orders_collection.find():
        orders.append({
            "id": str(order["_id"]),
            "email": order.get("email"),
            "bookId": order.get("bookId"),
            "bookTitle": order.get("bookTitle"),
            "purchaseType": order.get("purchaseType"),
            "amount": order.get("amount"),
            "status": order.get("status")
        })

    return jsonify(orders)


@app.route("/save-purchase", methods=["POST"])
def save_purchase():
    data = request.json

    email = data.get("email")
    book_id = data.get("bookId")
    book_title = data.get("bookTitle")
    purchase_type = data.get("purchaseType")
    amount = data.get("amount")

    if not email or not book_title or not purchase_type or not amount:
        return jsonify({"error": "Missing purchase details"}), 400

    orders_collection.insert_one({
        "email": email,
        "bookId": book_id,
        "bookTitle": book_title,
        "purchaseType": purchase_type,
        "amount": safe_int(amount),
        "status": "Paid"
    })

    return jsonify({"message": "Purchase saved successfully"})


@app.route("/admin-stats", methods=["GET"])
def admin_stats():
    total_revenue = 0

    for order in orders_collection.find():
        total_revenue += safe_int(order.get("amount", 0))

    return jsonify({
        "totalUsers": users_collection.count_documents({}),
        "totalBooks": books_collection.count_documents({}),
        "totalOrders": orders_collection.count_documents({}),
        "totalRevenue": total_revenue
    })


@app.route("/admin-user-analytics", methods=["GET"])
def admin_user_analytics():
    history = get_all_history()
    bookmarks = get_all_bookmarks()

    total_revenue = 0
    for order in orders_collection.find():
        total_revenue += safe_int(order.get("amount", 0))

    return jsonify({
        "totalUsers": users_collection.count_documents({}),
        "totalBooks": books_collection.count_documents({}),
        "totalOrders": orders_collection.count_documents({}),
        "totalReadingHistory": len(history),
        "totalBookmarks": len(bookmarks),
        "totalRevenue": total_revenue
    })


@app.route("/admin-book-records", methods=["GET"])
def admin_book_records():
    history = get_all_history()
    bookmarks = get_all_bookmarks()

    books = []

    for book in books_collection.find():
        book_id = str(book["_id"])
        title = book.get("title")

        read_count = sum(1 for h in history if h.get("bookId") == book_id or h.get("bookTitle") == title)
        purchase_count = orders_collection.count_documents({"$or": [{"bookId": book_id}, {"bookTitle": title}]})
        bookmark_count = sum(1 for b in bookmarks if b.get("bookId") == book_id or b.get("bookTitle") == title)

        books.append({
            "id": book_id,
            "title": title,
            "category": book.get("category"),
            "softPrice": book.get("softPrice"),
            "hardPrice": book.get("hardPrice"),
            "pdf": book.get("pdf"),
            "image": book.get("image"),
            "readCount": read_count,
            "purchaseCount": purchase_count,
            "bookmarkCount": bookmark_count
        })

    return jsonify(books)


@app.route("/admin-reading-history", methods=["GET"])
def admin_reading_history():
    return jsonify(get_all_history())


@app.route("/admin-bookmarks", methods=["GET"])
def admin_bookmarks():
    return jsonify(get_all_bookmarks())


@app.route("/admin-real-analytics", methods=["GET"])
def admin_real_analytics():
    history = get_all_history()

    most_read_books = []

    for book in books_collection.find():
        book_id = str(book["_id"])
        title = book.get("title")

        count = sum(1 for h in history if h.get("bookId") == book_id or h.get("bookTitle") == title)

        most_read_books.append({
            "title": title,
            "reads": count
        })

    most_read_books = sorted(most_read_books, key=lambda x: x["reads"], reverse=True)[:5]

    most_purchased_books = []

    for book in books_collection.find():
        book_id = str(book["_id"])
        title = book.get("title")

        count = orders_collection.count_documents({"$or": [{"bookId": book_id}, {"bookTitle": title}]})

        most_purchased_books.append({
            "title": title,
            "purchases": count
        })

    most_purchased_books = sorted(most_purchased_books, key=lambda x: x["purchases"], reverse=True)[:5]

    return jsonify({
        "mostReadBooks": most_read_books,
        "mostPurchasedBooks": most_purchased_books
    })


@app.route("/admin-user-activity", methods=["GET"])
def admin_user_activity():
    history = get_all_history()
    bookmarks = get_all_bookmarks()

    activity = []

    for user in users_collection.find():
        email = user.get("email")

        reads = sum(1 for h in history if h.get("email") == email)
        purchases = orders_collection.count_documents({"email": email})
        user_bookmarks = sum(1 for b in bookmarks if b.get("email") == email)

        activity.append({
            "name": user.get("name"),
            "email": email,
            "totalReads": reads,
            "totalPurchases": purchases,
            "totalBookmarks": user_bookmarks
        })

    return jsonify(activity)


@app.route("/save-reading-history", methods=["POST"])
def save_reading_history():
    data = request.json

    db["history"].insert_one({
        "email": data.get("email"),
        "bookId": data.get("bookId"),
        "bookTitle": data.get("bookTitle"),
        "page": data.get("page"),
        "date": data.get("date"),
        "time": data.get("time")
    })

    return jsonify({"message": "Reading history saved"})


@app.route("/save-bookmark", methods=["POST"])
def save_bookmark():
    data = request.json

    db["bookmarks"].insert_one({
        "email": data.get("email"),
        "bookId": data.get("bookId"),
        "bookTitle": data.get("bookTitle"),
        "page": data.get("page"),
        "date": data.get("date"),
        "time": data.get("time")
    })

    return jsonify({"message": "Bookmark saved"})


@app.route("/debug-collections", methods=["GET"])
def debug_collections():
    result = {}

    for name in db.list_collection_names():
        result[name] = db[name].count_documents({})

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)