import os
import string
import sqlite3
import sys

from lepl.apps.rfc3696 import Email
from html import escape

from flask import Flask, send_from_directory, send_file, request

STATIC_PATH = "../client/site"

app = Flask(__name__, static_folder=STATIC_PATH, static_url_path="/static")

conn = sqlite3.connect(".paperbots.db")


@app.route("/", methods=["GET"])
def main():
    return send_file(os.path.join(STATIC_PATH, "index.html"))


# The actual page
@app.route("/<path:filename>", methods=["GET"])
def papercontents(filename):
    return send_from_directory(STATIC_PATH, filename)

@app.route("/api/signup", methods=["POST"])
def signup():
    usertype = "user"
    json = request.get_json(force=True)
    name = json["name"]
    email = json["email"]
    if name.strip().length() == 0:
        raise Exception("Username must not be empty.")
    if email.strip().length() == 0:
        raise Exception("Email must not be empty.")
    name = escape(name.strip())

    email_validator = lepl.apps.rfc3696.Email()
    if not email_validator("email@example.com"):
        print
        "Invalid email"
    email = escape(email.strip())
    if not Email()(email):
        raise Exception("InvalidEmailAddress")
    # Make sure the user name is 4-25 letters/digits only.
    if len(name) < 4 or len(name) > 25:
        raise Exception("InvalidUserName")

    if not all([x in string.ascii_letters or x in string.digits for x in name]):
        raise Exception("InvalidUserName")
    # Check if name exists
    c = conn.cursor()
    if len(c.execute("SELECT name FROM users WHERE name=?", name).fetchall()):
        raise Exception("UserExists")
    if len(c.execute("Select id, name FROM users WHERE email=?", email).fetchall()):
        raise Exception("EmailExists")
    # Insert user // TODO: and send verification email
    c.execute("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'")
    c.execute("insert into users (name, email, type) value (?, ?, ?)", (name, email, usertype))
    return 1


@app.route("/api/login")
def login():
    #TODO
    pass

@app.route("/api/verify")
def verify():
    #TODO
    #TokenAndName tokenAndName = paperbots.verifyCode(request.code);
    pass
    resp = make_response()
    resp.set_cookie("token", token, max_age=2**31-1)
    resp.set_cookie("name", name, max_age=2**31-1)

@app.route("/api/logout")
def logout():
    request.cookies.get("token")
    resp = make_response()
    resp.set_cookie("token", "")
    resp.set_cookie("name", "")
    #todo: paperbots.logout(token)

@app.route("/api/getproject")
def getproject():
    #TODO: Do.
    project_id = request.get_json(force=True)["projectId"]
    token = request.cookies.get("token")
    pass

@app.route("/api/getprojects")
def getprojects():
    #TODO:
        #app.post("/api/getprojects", ctx -> {
        #    ProjectsRequest request = ctx.bodyAsClass(ProjectsRequest.class);
        #    ctx.json(paperbots.getUserProjects(ctx.cookie("token"), request.userName, request.worldData));
        #});

@app.route("/api/saveproject")
def saveproject():
    token = request.cookies.get("token")
    #TODO String projectId = paperbots.saveProject(ctx.cookie("token"), request.getCode(), request.getTitle(), request.getDescription(), request.getContent(), request.isPublic(), request.getType());

@app.route("/api/savethumbnail")
def savethumbnail():
    pass
    #SaveThumbnailRequest request = ctx.bodyAsClass(SaveThumbnailRequest.class);
    #        paperbots.saveThumbnail(ctx.cookie("token"), request.projectId, request.thumbnail);
    #    });

@app.route("/api/deleteproject")
def deleteproject():
            #ProjectRequest request = ctx.bodyAsClass(ProjectRequest.class);
            #paperbots.deleteProject(ctx.cookie("token"), request.projectId);
        pass

    app.post("/api/getfeaturedprojects", ctx -> {
            ctx.json(paperbots.getFeaturedProjects());
        });

        // Error handling
        app.error(404, ctx -> {
            ctx.redirect("/404.html");
        });

        app.post("/api/exception", ctx -> {
            throw new RuntimeException("This is a test");
        });

        app.exception(PaperbotsException.class, (e, ctx) -> {
            Log.info(e.getMessage(), e);
            ctx.json(new ErrorResponse(e.getError()));
            ctx.status(400);
        });

        app.exception(Exception.class, (e, ctx) -> {
            Log.info(e.getMessage(), e);
            ctx.json(new ErrorResponse(PaperbotsError.ServerError));
            ctx.status(500);
        });

        // Proxy images to avoid tainted canvases when thumbnailing
        app.get("/api/proxyimage", ctx -> {
            String url = ctx.queryParam("url");
            URLConnection connection = new URL(url).openConnection();
            connection.connect();
            String contentType = connection.getHeaderField("Content-Type");
            if (!contentType.startsWith("image/")) {
                ctx.status(404);
                return;
            }
            ctx.contentType(contentType);
            try (InputStream in = connection.getInputStream()) {
                in.transferTo(ctx.res.getOutputStream());
            }
        });

#Admin endpoints
@app.route("/api/getprojectsadmin")
def getprojectsadmin():
            #ProjectsRequest request = ctx.bodyAsClass(ProjectsRequest.class);
            #ctx.json(paperbots.getProjectsAdmin(ctx.cookie("token"), request.sorting, request.dateOffset));
    pass

@app.after_request
def secure(ctx):
    ctx.header("Content-Security-Policy", "script-src 'self' 'unsafe-inline';")
    ctx.header("X-Frame-Options", "SAMEORIGIN")
    ctx.header("X-Xss-Protection", "1; mode=block")
    ctx.header("X-Content-Type-Options", "nosniff")
    ctx.header("Referrer-Policy", "no-referrer-when-downgrade")
    ctx.header("Feature-Policy",
            "geolocation 'self'; midi 'self'; sync-xhr 'self'; microphone 'self'; camera 'self'; magnetometer 'self'; gyroscope 'self'; speaker 'self'; fullscreen *; payment 'self';")

if __name__ == "__main__":
    app.run()
