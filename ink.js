var express = require("express");
var mysql = require("mysql2");
var bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { location } = require("express/lib/response");
var jsonParser = bodyParser.urlencoded({ extended: false });
var app = express();
app.use(express.json());
var con = mysql.createConnection({
  host: "localhost",
  user: "admin",
  password: "abdullah134737",
  database: "ink",
});

function AddNotification(user_id, type, from, to) {
  var notifications =
    "INSERT INTO notifications (`user_id`,`type`, `from`,`to`) VALUES ('" +
    user_id +
    "','" +
    type +
    "','" +
    from +
    "','" +
    to +
    "')";

  ///var insertData = "INSERT INTO notifications (user_id,type,from,to) VALUES ('?','?','?','?')";
  // var sql = "INSERT INTO notifications (user_id, type, from, to) VALUES ('" +1+","+1+","+1+","+1+"')";
  con.query(notifications, (err, row) => {
    if (err) throw err;
    console.log(row);
    console.log("INTO");
  });
}

function AddNotification_delete(user_id, type, from, to) {
  var notifications2 =
    "DELETE FROM notifications WHERE `user_id` = ? AND `type` = ? AND `from` = ? AND `to` = ?";

  ///var insertData = "INSERT INTO notifications (user_id,type,from,to) VALUES ('?','?','?','?')";
  // var sql = "INSERT INTO notifications (user_id, type, from, to) VALUES ('" +1+","+1+","+1+","+1+"')";
  con.query(notifications2, [user_id, type, from, to], (err, row) => {
    if (err) throw err;
    console.log(row);
    console.log("DELETE");
  });
}

con.connect(function (err) {
  if (err) throw err;
  console.log("connect");
});

app.get("/new2", jsonParser, (req, res) => {
  var email = req.query.email;
  var sql = "SELECT * FROM users WHERE email = ?";

  con.query(sql, [email], function (err, row) {
    if (row.length > 0) {
      res.send("This account already exists");
    } else {
      var sql =
        "INSERT INTO users (username,email,password) VALUES ('" +
        req.query.username +
        "','" +
        email +
        "','" +
        req.query.password +
        "')";
      con.query(sql, function (err, result) {
        if (err) throw err;

        res.send("den");
      });
    }
  });
});

app.get("/login", jsonParser, function (request, response) {
  var email = request.query.email;
  var password = request.query.password;
  if (email && password) {
    con.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
      function (error, results, fields) {
        if (results.length > 0) {
          response.send("ok");
        } else {
          response.send("Incorrect Username and/or Password!");
        }
        response.end();
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
});

var storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "./images/"); // './public/images/' directory name where save the file
  },
  filename: (req, file, callBack) => {
    callBack(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
var upload = multer({
  storage: storage,
});

var type = upload.single("recfile");

app.get("/post", type, (req, res) => {
  //  var imgsrc = 'http://127.0.0.1:3000/images/' + req.file.filename
  var insertData = "INSERT INTO Post(image)VALUES('" + req.file.path + "')";
  con.query(insertData, (err, result) => {
    if (err) throw err;
    console.log("file uploaded");
  });
});

app.get("/get_products", (req, res) => {
  var imag = req.query.imag;
  con.query("SELECT * FROM img", function (error, results, fields) {
    res.send(results);
  });
});

app.get("/get_comment_image", function (req, res) {
  var post_id = req.query.post_id;

  con.query("SELECT * FROM comment WHERE post_id=?", [post_id], (err, row) => {
    console.log(row.length);
    var result = [];
    for (var i = 0; i < row.length; i++) {
      con.query(
        "SELECT * FROM users WHERE id = " + row[i].user_id,
        (err, rows) => {
          result.push({
            id: rows[0].id,
            profile_photo: rows[0].profile_photo,
          });

          if (result.length == row.length) {
            fs.readFile(result[0].profile_photo, function (err, data) {
              res.writeHead(200, { "Content-Type": "image/jpeg" });
              res.end(data);
            });
          }
        }
      );
    }

    //res.send("{"+row+","+user+"}")
  });
});

app.get("/bio", jsonParser, (req, res) => {
  var email = req.query.email;
  var password = req.query.password;
  if (email && password) {
    con.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
      function (error, results, fields) {
        if (results.length == results.length) {
          res.send("ok");

          bio(req.query.bio, email, password);
        } else {
          res.send("Incorrect Username and/or Password!");
        }
        res.end();
      }
    );
  }
});

function bio(bio, email, password) {
  con.query(
    "UPDATE users SET bio = ? WHERE email = ? AND password = ?",
    [bio, email, password],
    function (error, results, fields) {
      if (error) throw error;
      console.log("hi");
    }
  );
}

app.get("/bio2", jsonParser, type, (req, res) => {
  var profile_photo = req.file.path;
  var email = req.body.email;
  var password = req.body.password;
  bio2(profile_photo, email, password);
  res.send();
});
function bio2(profile_photo, email, password) {
  var sql =
    "UPDATE users SET profile_photo = ?  WHERE email = ?  AND password = ?";
  con.query(sql, [profile_photo, email, password], (err, row) => {
    if (err) throw err;
    console.log(row);
  });
}
app.get("/getpio", (req, res) => {
  var id = req.query.id;

  con.query("SELECT * FROM users WHERE id=?", [id], (err, rows) => {
    var result = [];
    result.push({
      id: rows[0].id,
      profile_photo: rows[0].profile_photo,
      bio: rows[0].bio,
    });
    if (result.length == rows.length) {
      res.send(result);
    }
  });
});
app.get("/getuser", jsonParser, (req, res) => {
  var email = req.query.email;
  var password = req.query.password;

  con.query(
    "SELECT * FROM users WHERE email=? AND password = ?",
    [email, password],
    (err, rows) => {
      res.send(rows);
    }
  );
});
app.post("/postimg", jsonParser, type, (req, res) => {
  var email = req.query.email;
  var password = req.query.password;
  var image = req.file.path;

  con.query(
    "SELECT * FROM users WHERE email=? AND password = ?",
    [email, password],
    (err, rows) => {
      var sql =
        "INSERT INTO Post (user_id,image) VALUES ('" + 2 + "','" + image + "')";

      con.query(sql, (err, rows) => {
        console.log("good");
      });
    }
  );
});

app.get("/post10", jsonParser, (req, res) => {
  var email = req.query.email;
  var password = req.query.password;
  var title = req.query.title;

  con.query(
    "SELECT * FROM users WHERE email=? AND password = ?",
    [email, password],
    (err, rows) => {
      var sql =
        "INSERT INTO Post (user_id,title) VALUES ('" +
        rows[0].id.toString() +
        "','" +
        title +
        "')";
      con.query(sql, (err, rows) => {
        console.log("good");
      });
    }
  );
});

app.get("/like", jsonParser, (req, res) => {
  var post_id = req.query.post_id;

  con.query(
    "SELECT * FROM users WHERE email = '" +
      req.query.email +
      "'And password ='" +
      req.query.password +
      "'",
    (err, row) => {
      if (row.length != 0) {
        // AddNotification(user_id,1,row[0].id,post_id);
        // var sql='SELECT * FROM likes WHERE post_id=? AND user_id = ?',[email,password];
        con.query(
          "SELECT * FROM likes WHERE post_id =? AND user_id = ?",
          [post_id, row[0].id],
          (err, row1) => {
            if (row1.length == 0) {
              // AddNotification(user_id,1,row[0].id,post_id);
              ///  var sql = "INSERT INTO Post (user_id,title) VALUES ('"+rows[0].id.toString()+"','"+title+"')";
              con.query(
                "INSERT INTO likes (post_id,user_id) VALUES ('" +
                  post_id +
                  "','" +
                  row[0].id.toString() +
                  "')",
                (err, rows) => {
                  ///   AddNotification(row[0].id,1,row[0].id,post_id);
                  res.send("like done");
                }
              );
            } else {
              //    var sql='DELETE FROM likes WHERE post_id = ? AND user_id = ?',[rows[0].id.toString(),rows[0].user_id.toString()];
              // var s='DELETE FROM likes WHERE post_id = '+req.query.post_id+'AND user_id = ' +row.user_id;
              con.query(
                "DELETE FROM likes WHERE post_id = ? AND user_id = ?",
                [post_id, row[0].id],
                (err, rows) => {
                  //  AddNotification(user_id,1,row[0].id,post_id);
                  ////   AddNotification_delete(row[0].id,1,row[0].id,post_id);
                  res.send("unlike done");
                }
              );
            }
          }
        );
      } else {
        res.send("error");
      }
    }
  );
});

app.get("/comment", (req, res) => {
  var id = req.query.id;
  var comment = req.query.comment;
  con.query("SELECT * FROM Post WHERE id=?", [id], (err, rows) => {
    var sql =
      "INSERT INTO comment (post_id,user_id,comment) VALUES ('" +
      rows[0].id.toString() +
      "','" +
      rows[0].user_id.toString() +
      "','" +
      comment +
      "')";
    con.query(sql, (err, rows) => {
      console.log("don");
    });
    res.end();
  });
});

app.get("/getlike", (req, res) => {
  var post_id = req.query.post_id;
  var user_id = req.query.user_id;

  con.query("SELECT * FROM likes WHERE post_id=?", [post_id], (err, rows) => {
    //res.send('{"Counts":'+rows.length().toString()+',"IsLike":')
    var result = [];
    for (var i = 0; i < rows.length; i++) {
      console.log("ll");
      if (rows[i].user_id == user_id) {
        result.push({
          post_id: rows[i].post_id,
          like: true,
        });
        console.log("1");

        break;
      }
      if (i == rows.length - 1) {
        result.push({
          post_id: rows[i].post_id,
          like: false,
        });
        console.log("2");

        break;
      }
    }
    res.send(result);
  });
});

app.get("/homepage2", (req, res) => {
  var fan_id = req.query.fan_id;
  var user_id = req.query.user_id;
  var result = [];
  var result2 = [];
  con.query("SELECT * FROM follows WHERE fan_id=?", [fan_id], (err, rows) => {
    //  console.log(1);
    for (var i = 0; i < rows.length; i++) {
      con.query(
        "SELECT * FROM users WHERE id = " + rows[i].account_id,
        (err, row) => {
          //    console.log(2);
          con.query(
            "SELECT * FROM Post WHERE user_id = " + row[0].id,
            (err, rows1) => {
              //    console.log(3);
              ///    fan_id = ? AND account_id = ?"

              con.query(
                "SELECT * FROM likes WHERE post_id =?",
                [rows1[0].id],

                (err, rowsa) => {
                  for (var a in rowsa) {
                    result.push({
                      id: rows1[0].id,
                      username: row[0].username,
                      profile_photo: row[0].profile_photo,
                      title: rows1[0].title,
                      post_id: rowsa[a].post_id,
                      number: rowsa.length,
                      IsLike: rowsa ? rowsa.length != 0 : false,
                    });

                    console.log(rowsa ? rowsa.length != 0 : false);
                    if (result.length == rows.length) {
                      console.log("hi");

                      res.send(result);
                    }
                  }
                }
              );
            }
          );
        }
      );
    }
  });
});

app.get("/homepage3", (req, res) => {
  var user_id = req.query.user_id;
  var results = [];

  con.query(
    "SELECT * FROM follows INNER JOIN users on users.id = follows.account_id and follows.fan_id = ? INNER join Post on Post.user_id = users.id",
    [user_id],
    (err, rows) => {
      for (let i = 0; i < rows.length; i++) {
        //  console.log(i);

        con.query(
          "SELECT * FROM likes WHERE post_id =?",
          [rows[i].post_id],
          (err, result) => {
            for (let index = 0; index < rows.length; index++) {
              for (let a = 0; a < result.length; a++) {
                if (result[a].user_id == result[a].user_id) {
                  if (i == results.length) {
                    results.push({
                      id: rows[i].post_id,
                      user_id: rows[i].user_id,
                      account_name: rows[i].username,
                      profile_photo: rows[i].profile_photo,
                      title: rows[i].title,
                      image: rows[i].image,
                      likes: result.length,
                      IsLike: true,
                    });
                  }
                }
              }

              if (i == results.length) {
                results.push({
                  id: rows[i].post_id,
                  user_id: rows[i].user_id,
                  account_name: rows[i].username,
                  profile_photo: rows[i].profile_photo,
                  title: rows[i].title,
                  image: rows[i].image,
                  likes: result.length,
                  IsLike: false,
                });
              }
              if (results.length == rows.length) {
                console.log("h");

                res.send(results);
                break;
              }
            }
          }
        );
      }
    }
  );
});

app.get("/my_user_Post", (req, res) => {
  var id = req.query.id;
  var results = [];

  con.query("SELECT * FROM users WHERE id =?", [id], (err, rows) => {
    for (let i = 0; i < rows.length; i++) {
      con.query(
        "SELECT * FROM Post WHERE user_id =?",
        [rows[i].id],
        (err, row) => {
          for (let index = 0; index < row.length; index++) {
            con.query(
              "SELECT * FROM likes WHERE post_id =?",
              [row[index].post_id],
              (err, result) => {
                for (let a = 0; a < result.length; a++) {
                  if (result[a].user_id == id) {
                    if (index == results.length) {
                      results.push({
                        post_id: row[index].post_id,
                        account_name: rows[i].username,
                        profile_photo: rows[i].profile_photo,
                        title: row[index].title,
                        image: row[index].image,
                        likes: result.length,
                        IsLike: true,
                      });
                    }
                  }
                }

                if (index == results.length) {
                  results.push({
                    post_id: row[index].post_id,
                    account_name: rows[i].username,
                    profile_photo: rows[i].profile_photo,
                    title: row[index].title,
                    image: row[index].image,
                    likes: result.length,
                    IsLike: false,
                  });
                }

                if (results.length == row.length) {
                  console.log("h");

                  res.send(results);
                }
              }
            );
          }
        }
      );
    }
  });
});

app.get("/user", (req, res) => {
  var id = req.query.id;
  var results = [];

  con.query("SELECT * FROM Post WHERE post_id =?", [id], (err, row2) => {
    for (let i = 0; i < row2.length; i++) {
      con.query(
        "SELECT * FROM Post WHERE user_id =?",
        [row2[i].user_id],
        (err, row) => {
          for (let z = 0; z < row.length; z++) {
            //   console.log(row[z].post_id)
            con.query(
              "SELECT * FROM likes WHERE post_id =?",
              [row[z].post_id],
              (err, result) => {
                for (let a = 0; a < result.length; a++) {
                  if (result[a].user_id == result[a].user_id) {
                    if (z == results.length) {
                      results.push({
                        id: row[z].post_id,

                        title: row[z].title,
                        image: row[z].image,
                        likes: result.length,
                        IsLike: true,
                      });
                    }
                  }
                }

                if (z == results.length) {
                  results.push({
                    id: row[z].post_id,

                    title: row[z].title,
                    image: row[z].image,
                    likes: result.length,
                    IsLike: false,
                  });
                }
                if (results.length == row.length) {
                  console.log("h");

                  res.send(results);
                }
              }
            );
          }
        }
      );
    }
  });
});

app.get("/userbio", (req, res) => {
  var id = req.query.id;

  con.query("SELECT * FROM Post WHERE post_id=?", [id], (err, row) => {
    con.query(
      "SELECT * FROM users WHERE id=?",
      [row[0].user_id],
      (err, rows) => {
        var result = [];
        result.push({
          id: rows[0].id,
          username: rows[0].username,
          profile_photo: rows[0].profile_photo,
          bio: rows[0].bio,
        });
        if (result.length == rows.length) {
          res.send(result);
        }
      }
    );
  });
});

/*
var array=[0,1];
for (let index = 0; index < array.length; index++) {
 
  
   console.log(index?array.length>0:false);
}
*/

app.get("/getlike2", (req, res) => {
  var user_id = req.query.user_id;
  var result = [];

  con.query("SELECT * FROM Post WHERE user_id =?", [user_id], (err, rows2) => {
    // console.log(rows2);

    for (let f = 0; f < rows2.length; f++) {
      con.query(
        "SELECT * FROM likes WHERE post_id =?",
        [rows2[f].post_id],
        (err, rows) => {
          /// console.log(rows);
          for (let c = 0; c < rows.length; c++) {
            con.query(
              "SELECT * FROM users WHERE id =?",
              [rows[c].user_id],
              (err, row) => {
                for (let index = 0; index < row.length; index++) {
                  con.query(
                    "SELECT * FROM Post WHERE post_id =?",
                    [rows[index].post_id],
                    (err, row2) => {
                      ///     console.log(rows2);

                      result.push({
                        username: row[0].username,
                        profile_photo: row[0].profile_photo,

                        user_id: row[0].id,

                        title: row2[index].title,
                        image: row2[index].image,
                      });

                      if (result.length == rows2.length) {
                        console.log("k");

                        res.send(result);
                      }
                    }
                  );
                }
              }
            );
          }
        }
      );
    }
  });
});

app.get("/getMylikes", (req, res) => {
  var result = [];
  con.query(
    "SELECT * FROM Post INNER JOIN likes ON Post.user_id = " +
      req.query.user_id +
      " AND likes.post_id = Post.post_id AND likes.user_id != " +
      req.query.user_id +
      " INNER JOIN users ON users.id =likes.user_id ",
    (err, rows) => {
      for (let index = 0; index < rows.length; index++) {
        result.push({
          username: rows[0].username,
          profile_photo: rows[0].profile_photo,

          user_id: rows[0].id,

          title: rows[index].title,
          image: rows[index].image,
        });

        if (result.length == rows.length) {
          res.send(result);
        }
      }
    }
  );
});

app.get("/getfollowing4", (req, res) => {
  var account_id = req.query.account_id;
  var result = [];

  con.query(
    "SELECT * FROM follows WHERE account_id=?",
    [account_id],
    (err, rows) => {}
  );
});

app.get("/getlike3", (req, res) => {
  id = req.query.id;
  var result = [];
  con.query("SELECT * FROM users WHERE id=?", [id], (err, row) => {
    for (let index = 0; index < row.length; index++) {
      con.query(
        "SELECT * FROM likes WHERE post_id=?",
        [row[i].post_id],
        (err, rowes) => {
          con.query(
            "SELECT * FROM Post WHERE user_id=?",
            [row[index].id],
            (err, rows) => {
              result.push({
                username: row[0].username,
                profile_photo: row[0].profile_photo,
                post_id: rows[i].post_id,
                title: rows[i].title,
                image: rows[i].image,
              });

              if (result.length == rows.length) {
                res.send(result);
              }
            }
          );
        }
      );
    }
  });
});

app.get("/get_like_image", function (req, res) {
  var post_id = req.query.post_id;

  con.query("SELECT * FROM likes WHERE post_id=?", [post_id], (err, row) => {
    console.log(row.length);
    var result = [];
    for (var i = 0; i < row.length; i++) {
      con.query(
        "SELECT * FROM users WHERE id = " + row[i].user_id,
        (err, rows) => {
          result.push({
            id: rows[0].id,
            profile_photo: rows[0].profile_photo,
          });

          if (result.length == row.length) {
            fs.readFile(result[0].profile_photo, function (err, data) {
              res.writeHead(200, { "Content-Type": "image/jpeg" });
              res.end(data);
            });
          }
        }
      );
    }
  });
});

app.get("/getcomment", (req, res) => {
  var post_id = req.query.post_id;

  con.query("SELECT * FROM comment WHERE post_id=?", [post_id], (err, rows) => {
    var result = [];
    for (var i = 0; i < rows.length; i++) {
      con.query(
        "SELECT * FROM users WHERE id = " + rows[i].user_id,
        (err, row) => {
          for (var a = 0; a < rows.length; a++) {
            result.push({
              username: row[0].username,
              profile_photo: row[0].profile_photo,
              comment: rows[a].comment,
            });
          }
          if (result.length == rows.length) {
            res.send(result);
          }
        }
      );
    }
  });
});

app.get("/follow", jsonParser, (req, res) => {
  var account_id = req.query.account_id;
  var result = [];
  con.query(
    "SELECT * FROM users WHERE email = '" +
      req.query.email +
      "'And password ='" +
      req.query.password +
      "'",
    (err, row) => {
      if (row.length != 0) {
        // var sql='SELECT * FROM likes WHERE post_id=? AND user_id = ?',[email,password];
        con.query(
          "SELECT * FROM follows WHERE account_id =? AND fan_id = ?",
          [account_id, row[0].id],
          (err, row1) => {
            if (row1.length == 0) {
              ///  var sql = "INSERT INTO Post (user_id,title) VALUES ('"+rows[0].id.toString()+"','"+title+"')";
              con.query(
                "INSERT INTO follows (account_id,fan_id) VALUES ('" +
                  account_id +
                  "','" +
                  row[0].id.toString() +
                  "')",
                (err, rows) => {
                  result.push({
                    follow: true,
                  });

                  // AddNotification(row[0].id,2,row[0].id,account_id);
                  res.send(result);
                }
              );
            } else {
              //    var sql='DELETE FROM likes WHERE post_id = ? AND user_id = ?',[rows[0].id.toString(),rows[0].user_id.toString()];
              // var s='DELETE FROM likes WHERE post_id = '+req.query.post_id+'AND user_id = ' +row.user_id;
              con.query(
                "DELETE FROM follows WHERE account_id = ? AND fan_id = ?",
                [account_id, row[0].id],
                (err, rows) => {
                  result.push({
                    follow: false,
                  });
                  /// AddNotification_delete(row[0].id,2,row[0].id,account_id);
                  res.send(result);
                }
              );
            }
          }
        );
      } else {
        res.send("error");
      }
    }
  );
});

app.get("/getfollowing", (req, res) => {
  var account_id = req.query.account_id;
  var result = [];

  con.query(
    "SELECT * FROM follows WHERE account_id=?",
    [account_id],
    (err, rows) => {
      console.log(rows);
      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          con.query(
            "SELECT * FROM users WHERE id =?",
            [rows[i].fan_id],
            (err, row) => {
              if (rows[i].fan_id == account_id) {
                console.log("ll");

                result.push({
                  id: row[0].id,
                  username: row[0].username,
                  profile_photo: row[0].profile_photo,
                  IsLike: true,
                });
              }

              result.push({
                id: row[0].id,
                username: row[0].username,
                profile_photo: row[0].profile_photo,
                IsLike: false,
              });

              res.send(result);
            }
          );
        }
      } else {
        res.send("[]");
      }
    }
  );
});

app.get("/getfollowing6666", (req, res) => {
  var account_id = req.query.account_id;
  var result = [];

  con.query(
    "SELECT * FROM follows WHERE account_id=?",
    [account_id],
    (err, rows) => {
      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i++) {
          con.query(
            "SELECT * FROM users WHERE id =?",
            [rows[i].fan_id],
            (err, row) => {
              con.query(
                "SELECT * FROM follows WHERE fan_id=? AND account_id=?",
                [account_id, rows[i].fan_id],
                (err, rowing) => {
                  console.log(rowing);

                  for (let index = 0; index < rowing.length; index++) {
                    if (rowing[index].fan_id == account_id) {
                      result.push({
                        id: row[0].id,
                        username: row[0].username,
                        profile_photo: row[0].profile_photo,
                        like: true,
                      });

                      res.send(result);
                    }
                  }

                  result.push({
                    id: row[0].id,
                    username: row[0].username,
                    profile_photo: row[0].profile_photo,
                    like: false,
                  });

                  if (rows.length == result.length) {
                    res.send(result);
                  }
                }
              );
            }
          );
        }
      } else {
        res.send("[]");
      }
    }
  );
});

app.get("/homepage344", (req, res) => {
  var user_id = req.query.user_id;
  var results = [];

  con.query("SELECT * FROM Post WHERE user_id=?", [user_id], (err, rowes) => {
    for (let c = 0; c < rowes.length; c++) {
      con.query(
        "SELECT * FROM likes WHERE post_id=?",
        [rowes[c].post_id],
        (err, row) => {
          con.query(
            "SELECT * FROM follows WHERE account_id=?",
            [user_id],
            (err, row1) => {
              console.log(row1);
              for (let index = 0; index < row1.length; index++) {
                con.query(
                  "SELECT * FROM users WHERE id=?",
                  [row1[index].fan_id],
                  (err, rows) => {
                    //   console.log(rows);

                    con.query(
                      "SELECT * FROM Post WHERE post_id=?",
                      [rowes[c].post_id],
                      (err, roew) => {
                        //  console.log(roew);
                        for (let i = 0; i < roew.length; i++) {
                          results.push({
                            id: rows[0].id,
                            username: rows[0].username,
                            profile_photo: rows[0].profile_photo,
                            title: roew[i].title,
                            image: roew[i].image,
                          });

                          if (results.length == roew.length) {
                            res.send(results);
                          }
                        }
                      }
                    );
                  }
                );
              }
            }
          );
        }
      );
    }
  });
});

app.get("/usefollow", (req, res) => {
  var fan_id = req.query.fan_id;
  var results = [];
  con.query("SELECT * FROM users WHERE id =?", [fan_id], (err, row) => {
    for (let z = 0; z < row.length; z++) {
      con.query(
        "SELECT * FROM follows WHERE account_id =?",
        [row[0].id],
        (err, result) => {
          console.log(result);

          for (let a = 0; a < row.length; a++) {
            if (row[a].user_id == row[a].user_id) {
              if (z == results.length) {
                results.push({
                  IsLike: true,
                });
              }
            }
          }

          if (results.length == row.length) {
            console.log("h");

            res.send(results);
          }
        }
      );
    }
  });
});

app.get("/get_following_image", function (req, res) {
  var account_id = req.query.account_id;

  con.query(
    "SELECT * FROM follows WHERE account_id=?",
    [account_id],
    (err, row) => {
      console.log(row.length);
      var result = [];
      for (var i = 0; i < row.length; i++) {
        con.query(
          "SELECT * FROM users WHERE id = " + row[i].fan_id,
          (err, rows) => {
            result.push({
              id: rows[0].id,
              profile_photo: rows[0].profile_photo,
            });

            if (result.length == row.length) {
              fs.readFile(result[0].profile_photo, function (err, data) {
                res.writeHead(200, { "Content-Type": "image/jpeg" });
                res.end(data);
              });
            }
          }
        );
      }
    }
  );
});

app.get("/getfollower", (req, res) => {
  var fan_id = req.query.fan_id;
  var result = [];

  con.query("SELECT * FROM follows WHERE fan_id=?", [fan_id], (err, rows) => {
    if (rows.length > 0) {
      for (var i = 0; i < rows.length; i++) {
        con.query(
          "SELECT * FROM users WHERE id = " + rows[i].account_id,
          (err, rows1) => {
            result.push({
              id: rows1[0].id,
              username: rows1[0].username,
              profile_photo: rows1[0].profile_photo,
            });

            if (result.length == rows.length) {
              res.send(result);
            }
          }
        );
      }
    } else {
      res.send("[]");
    }
  });
});

app.get("/get_follower_image", function (req, res) {
  var fan_id = req.query.fan_id;

  con.query("SELECT * FROM follows WHERE fan_id=?", [fan_id], (err, row) => {
    console.log(row.length);
    var result = [];
    for (var i = 0; i < row.length; i++) {
      con.query(
        "SELECT * FROM users WHERE id = " + row[i].account_id,
        (err, rows) => {
          result.push({
            id: rows[0].id,
            profile_photo: rows[0].profile_photo,
          });

          if (result.length == row.length) {
            fs.readFile(result[0].profile_photo, function (err, data) {
              res.writeHead(200, { "Content-Type": "image/jpeg" });
              res.end(data);
            });
          }
        }
      );
    }
  });
});

app.get("/homepage", (req, res) => {
  var fan_id = req.query.fan_id;

  con.query("SELECT * FROM follows WHERE fan_id=?", [fan_id], (err, rows) => {
    var result = [];
    for (var i = 0; i < rows.length; i++) {
      con.query(
        "SELECT * FROM users WHERE id = " + rows[i].account_id,
        (err, row) => {
          con.query(
            "SELECT * FROM Post WHERE user_id = " + row[0].id,
            (err, rows1) => {
              for (var a = 0; a < rows1.length; a++) {
                result.push({
                  id: rows1[0].id,
                  username: row[0].username,
                  profile_photo: row[0].profile_photo,
                  title: rows1[a].title,
                });
              }

              if (result.length == rows.length) {
                res.send(result);
              }
            }
          );
        }
      );
    }
  });
});

app.get("/get_homepage_image", function (req, res) {
  var fan_id = req.query.fan_id;

  con.query("SELECT * FROM follows WHERE fan_id=?", [fan_id], (err, row) => {
    console.log(row.length);
    var result = [];
    for (var i = 0; i < row.length; i++) {
      con.query(
        "SELECT * FROM users WHERE id = " + row[i].account_id,
        (err, rows) => {
          result.push({
            id: rows[0].id,
            profile_photo: rows[0].profile_photo,
          });

          if (result.length == row.length) {
            fs.readFile(result[0].profile_photo, function (err, data) {
              res.writeHead(200, { "Content-Type": "image/jpeg" });
              res.end(data);
            });
          }
        }
      );
    }
  });
});

app.get("/serch", (req, res) => {
  var username = req.query.username;
  var sq =
    "SELECT id, profile_photo ,username FROM users WHERE username LIKE '" +
    username +
    "%'";
  con.query(sq, (err, row) => {
    res.send(row);
  });
});
app.get("/get_serch_image", function (req, res) {
  var us = req.query.username;
  var sq =
    "SELECT id, profile_photo ,username FROM users WHERE username LIKE '" +
    us +
    "%'";
  con.query(sq, (err, row) => {
    fs.readFile(row[0].profile_photo, function (err, data) {
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.end(data);
    });
  });
});

app.get("/delete", jsonParser, (req, res) => {
  var post_id = req.query.post_id;

  con.query(
    "SELECT * FROM users WHERE email = '" +
      req.query.email +
      "'And password ='" +
      req.query.password +
      "'",
    (err, row) => {
      if (row.length != 0) {
        // var sql='SELECT * FROM likes WHERE post_id=? AND user_id = ?',[email,password];
        con.query(
          "DELETE FROM Post WHERE post_id  = ?",
          [post_id],
          (err, rows) => {
            con.query(
              "DELETE FROM likes WHERE post_id = ?",
              [post_id],
              (err, rows) => {
                res.send("delete");
              }
            );
          }
        );
      }
    }
  );
});

app.get("/trnd", (req, res) => {
  con.query("SELECT * FROM Post", (err, rows) => {
    var result = [];
    for (var i = 0; i < rows.length; i++) {
      con.query(
        "SELECT * FROM users WHERE id = " + rows[i].user_id,
        (err, row) => {
          for (var a = 0; a < row.length; a++) {
            result.push({
              username: row[0].username,
              profile_photo: row[0].profile_photo,
              id: rows[a].id,
              title: rows[a].title,
              image: rows[a].image,
            });
          }

          if (result.length == rows.length) {
            const { dup } = result.reduce(
              (acc, curr) => {
                acc.items[curr] = acc.items[curr] ? (acc.items[curr] += 1) : 1;
                if (acc.items[curr] === 3) {
                  acc.dup.push(curr);
                }
                return acc;
              },
              {
                items: {},
                dup: [],
              }
            );

            res.send(dup);
          }
        }
      );
    }
  });
});

app.get("/get_trnd2_image", function (req, res) {
  fs.readFile("./" + req.query.path, function (err, data) {
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    res.end(data);
  });
});

app.get("/alluser", jsonParser, (req, res) => {
  var results = [];
  var fan_id = req.query.fan_id;
  con.query("SELECT * FROM users WHERE id !=?", [fan_id], (err, rows) => {
    console.log(rows);
    for (let i = 0; i < rows.length; i++) {
      con.query(
        "SELECT * FROM follows WHERE fan_id =? AND account_id = ?",
        [fan_id, rows[i].id],
        (err, result) => {
          for (let a = 0; a < result.length; a++) {
            if (result[a].fan_id == result[a].fan_id) {
              if (i == results.length) {
                results.push({
                  id: rows[i].id,
                  profile_photo: rows[i].profile_photo,
                  username: rows[i].username,
                  IsLike: true,
                });
              }
            }
          }

          if (i == results.length) {
            results.push({
              id: rows[i].id,
              profile_photo: rows[i].profile_photo,
              username: rows[i].username,
              IsLike: false,
            });
          }

          if (results.length == rows.length) {
            console.log("h");

            res.send(results);
          }
        }
      );
    }
  });
});

app.get("/notifications", (req, res) => {
  var user_id = req.query.user_id;
  var results = [];

  con.query("SELECT * FROM users WHERE id =?", [user_id], (err, result) => {
    for (let index = 0; index < result.length; index++) {
      con.query(
        "SELECT * FROM notifications WHERE user_id =?",
        [result[0].id],
        (err, rows) => {
          for (let c = 0; c < rows.length; c++) {
            con.query(
              "SELECT * FROM Post WHERE post_id =?",
              [rows[c].to],
              (err, row) => {
                console.log("den");

                for (let i = 0; i < result.length; i++) {
                  if (result[i].user_id == result[i].user_id) {
                    if (index == results.length) {
                      results.push({
                        id: result[0].id,
                        profile_photo: result[0].profile_photo,
                        username: result[0].username,
                        title: row[0].title == null ? row[c].title : "",
                        type: rows[c].type,
                        IsLike: true,
                      });
                    }
                  }
                }

                if (index == results.length) {
                  results.push({
                    id: result[0].id,
                    profile_photo: result[0].profile_photo,
                    username: result[0].username,
                    title: row[0].title == null ? row[c].title : "",
                    type: rows[c].type,
                    IsLike: false,
                  });
                }

                if (results.length == rows.length) {
                  console.log("h");

                  res.send(results);
                }
              }
            );
          }
        }
      );
    }
  });
});

app.get("/notifications2", (req, res) => {
  var user_id = req.query.user_id;
  var results = [];

  con.query(
    "SELECT * FROM notifications WHERE user_id =?",
    [user_id],
    (err, result) => {
      for (let index = 0; index < result.length; index++) {
        console.log(result);
        con.query(
          "SELECT * FROM Post WHERE post_id =?",
          [result[index].to],
          (err, rows) => {
            for (let c = 0; c < rows.length; c++) {
              console.log(rows);
              con.query(
                "SELECT * FROM users WHERE id =?",
                [rows[c].user_id],
                (err, row) => {
                  console.log("den");

                  for (let i = 0; i < row.length; i++) {
                    if (row[i].user_id == row[i].user_id) {
                      if (index == results.length) {
                        results.push({
                          id: row[0].id,
                          profile_photo: row[0].profile_photo,
                          username: row[0].username,
                          title: rows[c].title,
                          type: result[c].type,
                          IsLike: true,
                        });
                      }
                    }
                  }

                  if (index == results.length) {
                    results.push({
                      id: row[0].id,
                      profile_photo: row[0].profile_photo,
                      username: row[0].username,
                      title: rows[c].title,
                      type: result[c].type,
                      IsLike: false,
                    });
                  }

                  if (results.length == rows.length) {
                    console.log("h");

                    res.send(results);
                  }
                }
              );
            }
          }
        );
      }
    }
  );
});

function dd() {
  for (let i = 0; i < row.length; i++) {
    if (row[i].user_id == row[i].user_id) {
      console.log("den");
      if (index == results.length) {
        results.push({
          id: result[0].id,
          profile_photo: result[0].profile_photo,
          username: result[0].username,
          title: rows[c].title,
          type: row[c].type,
          IsLike: true,
        });
      }
    }
  }

  if (index == results.length) {
    results.push({
      id: result[0].id,
      profile_photo: result[0].profile_photo,
      username: result[0].username,
      title: rows[c].title,
      type: row[c].type,
      IsLike: false,
    });
  }

  res.send(results);
}

app.listen(2000);
module.exports = con;
