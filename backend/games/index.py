"""
API для управления играми: получение списка, добавление, удаление.
Поддерживает загрузку обложки в S3.
"""
import json
import os
import base64
import uuid
import psycopg2
import boto3


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        return get_games(event)
    elif method == "POST":
        return add_game(event)
    elif method == "DELETE":
        return delete_game(event)

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}


def get_games(event):
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, title, genre, size, rating, downloads, year, cover_url, tag, is_new, description, created_at FROM {SCHEMA}.games ORDER BY created_at DESC"
    )
    rows = cur.fetchall()
    conn.close()
    games = [
        {
            "id": r[0],
            "title": r[1],
            "genre": r[2],
            "size": r[3],
            "rating": float(r[4]) if r[4] else 0,
            "downloads": r[5],
            "year": r[6],
            "cover_url": r[7],
            "tag": r[8],
            "is_new": r[9],
            "description": r[10],
            "created_at": str(r[11]),
        }
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"games": games})}


def add_game(event):
    body = json.loads(event.get("body") or "{}")
    title = body.get("title", "").strip()
    genre = body.get("genre", "").strip()
    size = body.get("size", "").strip()
    rating = float(body.get("rating", 0))
    year = int(body.get("year", 2025))
    tag = body.get("tag", "").strip()
    is_new = bool(body.get("is_new", True))
    description = body.get("description", "").strip()
    cover_base64 = body.get("cover_base64")
    cover_ext = body.get("cover_ext", "jpg")

    if not title or not genre:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "title и genre обязательны"})}

    cover_url = None
    if cover_base64:
        s3 = get_s3()
        key = f"games/covers/{uuid.uuid4()}.{cover_ext}"
        img_data = base64.b64decode(cover_base64)
        s3.put_object(Bucket="files", Key=key, Body=img_data, ContentType=f"image/{cover_ext}")
        access_key = os.environ["AWS_ACCESS_KEY_ID"]
        cover_url = f"https://cdn.poehali.dev/projects/{access_key}/files/{key}"

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        f"""INSERT INTO {SCHEMA}.games (title, genre, size, rating, year, tag, is_new, description, cover_url, downloads)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id""",
        (title, genre, size, rating, year, tag, is_new, description, cover_url, "0"),
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    conn.close()

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True, "id": new_id})}


def delete_game(event):
    params = event.get("queryStringParameters") or {}
    game_id = params.get("id")
    if not game_id:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id обязателен"})}

    conn = get_db()
    cur = conn.cursor()
    cur.execute(f"DELETE FROM {SCHEMA}.games WHERE id = %s", (int(game_id),))
    conn.commit()
    conn.close()

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True})}
