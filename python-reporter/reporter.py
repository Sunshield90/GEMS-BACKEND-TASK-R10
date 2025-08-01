import os
from pymongo import MongoClient
from dotenv import load_dotenv
from collections import Counter
import certifi # Import certifi

def generate_report():
    load_dotenv()
    mongo_uri = os.getenv("MONGO_URI")

    # Use certifi for the SSL connection
    client = MongoClient(mongo_uri, tlsCAFile=certifi.where())

    db = client.get_database("task-manager")
    tasks_collection = db.tasks
    tasks = list(tasks_collection.find({}, {"status": 1, "_id": 0}))

    if not tasks:
        print("No tasks found.")
        return

    statuses = [task['status'] for task in tasks]
    status_counts = Counter(statuses)

    print("--- Task Status Report ---")
    print(f"Total Tasks: {len(tasks)}")
    print(f"Pending: {status_counts.get('Pending', 0)}")
    print(f"In-Progress: {status_counts.get('In-Progress', 0)}")
    print(f"Completed: {status_counts.get('Completed', 0)}")

if __name__ == "__main__":
    generate_report()