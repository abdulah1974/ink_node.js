var express = require("express");
var mysql = require("mysql2");
var bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { location } = require("express/lib/response");
var jsonParser = bodyParser.urlencoded({ extended: false });
var app = express();
var human = require('human-time');
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
/*
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
app.get("/socit", (req, res) => {
  var connection=req.query.connection;
  console.log("kk");
  io.on(connection, (socket) => {
    socket.on(connection, (msg) => {
      io.emit('chat message', msg);
      console.log(socket);
    });
  });
});
*/



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
  var reslt=[];
  if (email && password) {
    con.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
      function (error, results, fields) {
        if (results.length > 0) {
          reslt.push({
            id:results[0].id,
            username:results[0].username,
          })
          response.send(reslt);
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


//هذا يغير  البايو
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

//هذا يغير اليوز نيم 
app.get("/update_username", jsonParser, (req, res) => {
  var email = req.query.email;
  var password = req.query.password;
  if (email && password) {
    con.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
      function (error, results, fields) {
        if (results.length == results.length) {
          res.send("ok");

          usernameedit(req.query.username, email, password);
        } else {
          res.send("Incorrect Username and/or Password!");
        }
        res.end();
      }
    );
  }
});

function usernameedit(username, email, password) {
  con.query(
    "UPDATE users SET username = ? WHERE email = ? AND password = ?",
    [username, email, password],
    function (error, results, fields) {
      if (error) throw error;
      console.log("den");
    }
  );
}


app.get("/change_password", jsonParser, (req, res) => {
  var email = req.query.email;
  var password = req.query.password;

  if (email && password) {
    con.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",[email, password],(err, row)=>{
     
        if (row.length == row.length) {
          res.send("ok");

          change_password(req.query.change_password, email, password);
        } else {
          res.send("Incorrect Username and/or Password!");
        }
        res.end();
      }
    );
  }
});

function change_password(change_password, email, password) {
  con.query(
    "UPDATE users SET password = ? WHERE email = ? AND password = ?",
    [change_password, email, password],
    function (error, results, fields) {
      if (error) throw error;
      console.log("den");
    }
  );
}



app.post("/bio2", jsonParser, type, (req, res) => {
  var profile_photo = req.file.path;
  var email = req.query.email;
  var password = req.query.password;
  bio2(profile_photo, email, password);
  res.send("god");
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
      username: rows[0].username,
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
        "INSERT INTO Post (user_id,image) VALUES ('" + 23 + "','" + image + "')";

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
        rows[0].id.toString()+
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
  var user_id =req.query.user_id;
  con.query("SELECT * FROM Post WHERE post_id=?",[id], (err, rows) => {
    console.log(rows);
    var sql =
      "INSERT INTO comment (post_id,user_id,comment) VALUES ('" +
      id +
      "','" +
      user_id +
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
                      time:human(new Date(rows[i].date+ 5 * 1000)),
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
                  time:human(new Date(rows[i].date+ 5 * 1000)),
                  IsLike: false,
                });
              }
              if (results.length == rows.length) {
                console.log("h");
               /// console.log(human(new Date(rows[i].date+ 5 * 100)));

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
          if(row.length>0){
            console.log("null_post");
          }else{
            results.push({
              post:null,
            });
            res.send(results);
          }
     
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
                        post:row.length,
                        time:human(new Date(row[index].date+ 5 * 1000)),
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
                    post:row.length,
                    time:human(new Date(row[index].date+ 5 * 1000)),
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

//اضهار منشورات ااشخص عل منطي لايك او لا
app.get("/userid", (req, res) => {
  var id = req.query.id;
  var myid=req.query.myid;
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
                  if (result[a].user_id == myid ) {
                    if (index == results.length) {
                      results.push({
                        post_id: row[index].post_id,
                        account_name: rows[i].username,
                        profile_photo: rows[i].profile_photo,
                        title: row[index].title,
                        image: row[index].image,
                        likes: result.length,
                        post:row.length,
                        time:human(new Date(row[index].date+ 5 * 1000)),
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
                    post:row.length,
                    time:human(new Date(row[index].date+ 5 * 1000)),
                    private:rows[i].private,
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

          if(row.length>0){

          }else{
            results.push({
             post:0,
             private:rows[i].private
            });
            res.send(results);
          }
         
        }
      );
    }
  });
 
});
 //هذا وضيفته يعرف اذا ضايفه او لا 
app.get("/userfollow_or_unfollow",(req,res)=>{
  var fan_id = req.query.fan_id;
  var account_id = req.query.account_id;
  var result=[];


    con.query("SELECT * FROM follows WHERE fan_id=? AND account_id=?",[fan_id,account_id],(err, rowing) => {
 

        for (var index = 0; index < rowing.length; index++) {
         
        
        if (rowing[index].fan_id==fan_id&&rowing[index].account_id==account_id) 

        {

             
             
                    result.push({like:true});
                    res.send(result);
                  
            
          }

        }
         if(rowing.length>0){
          
         }else{
            
          result.push({like:false});
        
          res.send(result);
      
         }


        
     
       
        
      
    }
  );

 


});


app.get("/private", jsonParser, (req, res) => {
  var email = req.query.email;
  var password = req.query.password;
  if (email && password) {
    con.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
      function (error, results, fields) {
        if (results.length == results.length) {
          res.send("ok");
          con.query("SELECT private FROM users  WHERE email = ? AND password = ? ",[email,password],(err,rowsing)=>{
            for (let index = 0; index < rowsing.length; index++) {
            
            if(rowsing[index].private==null){
              bio(req.query.private, email, password);
            }
          
            if(rowsing[index].private==1){
              bio2(null, email, password);
            }
          }
          })
        
         
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
    "UPDATE users SET private = ? WHERE email = ? AND password = ?",
    [bio, email, password],
    function (error, results, fields) {
      if (error) throw error;
      console.log("hi");
    }
  );
}

function bio2(bio, email, password) {
  con.query(
    "UPDATE users SET private = ? WHERE email = ? AND password = ?",
    [bio, email, password],
    function (error, results, fields) {
      if (error) throw error;
      console.log("hi2");
    }
  );
}
app.get("/get_private",(req,res)=>{
  var email = req.query.email;
  var password = req.query.password;
  con.query("SELECT private FROM users  WHERE email = ? AND password = ? ",[email,password],(err,row)=>{
            
    res.send(row);

  })


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
                    if (a == results.length) {
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

                if (a == results.length) {
                  results.push({
                    id: row[z].post_id,

                    title: row[z].title,
                    image: row[z].image,
                    likes: result.length,
                    IsLike: false,
                  });
                }
             
                  console.log("h");
                  res.send(results);
               
                
              }
            );
           
          }
        }
      );
    }
 
  });
});


/*
app.get("/userbio", (req, res) => {
  var id = req.query.id;

  con.query("SELECT * FROM Post WHERE post_id=?", [id], (err, row) => {

    con.query(
      "SELECT * FROM users WHERE id=?",[row[0].user_id],
    
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

*/

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
      if(rows.length>0){
      }else{
       result.push({like_null:null});
       res.send(result);
      }
      for (let index = 0; index < rows.length; index++) {
        result.push({
          username: rows[index].username,
          profile_photo: rows[index].profile_photo,

          user_id: rows[index].id,
          time2:rows[index].time,
          time:human(new Date(rows[index].time+ 5 * 1000)),
          title: rows[index].title,
          image: rows[index].image,
          islike:null,
        });
      
        if (result.length == rows.length) {
         console.log("kk");
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
    (err, rows) => {

    }
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
    for (let i = 0; i < rows.length; i++) {
      con.query(
        "SELECT * FROM users WHERE id =?",[rows[i].user_id],(err, row) => {
        for (let index = 0; index < row.length; index++) {
        
        
         
       
  
          const value = date.format((new Date(rows[i].time,)),'YY/M-D/h:mm');
        ///  console.log("date and time : " + value+5 *1000,);
         
        
      ///  console.log(getTimeInterval(Date.now() + rows[i].time));
        
          
       

            console.log(row[index].username);


             if(row.length>0){
               console.log("ll");
              result.push({

                username:row[index].username,
                profile_photo: row[index].profile_photo,
                comment: rows[i].comment,
                time:human(new Date(rows[i].time+ 5 * 1000)),
              });


             }
             

             
        
             
           
             
            
          }
           
       
          
          if (result.length == rows.length) {
            res.send(result);
          }
        }
      );
    }
  });
});
//هذا تابع للكومنتات
app.get("/get_usernamr_image",(req, res)=>{
  var id=req.query.id;
  con.query("SELECT id, username , profile_photo FROM users WHERE id =?",[id],(err,row)=>{

   res.send(row);


  });

});



app.get("/getcomment22", (req, res) => {
  var post_id = req.query.post_id;
   var user_id =req.query.user_id;
  var result = [];
 /// var i="SELECT * FROM follows INNER JOIN users ON follows.account_id=? AND users.id=follows.fan_id";
  con.query("SELECT * FROM `comment` INNER JOIN `users` ON comment.post_id=? AND comment.user_id=users.id", [post_id], (err, row) => {

    for (let x = 0; x < row.length; x++) {
    
      if(row[x].user_id==user_id){
        result.push({
          id:row[x].id,
          username:row[x].username,
          profile_photo: row[x].profile_photo,
          comment: row[x].comment,
          comsetmy:true,
          id_comment:row[x].id_comment,
          time:human(new Date(row[x].time+ 5 * 1000)),
       });
      
       if(result.length==row.length){

      res.send(result);


      }
      }

  
    }

   con.query("SELECT * FROM comment WHERE post_id=? AND user_id !=?",[post_id,user_id],(err,rowing)=>{
    for (let s = 0; s < rowing.length; s++) {
   

    con.query("SELECT * FROM users WHERE id=?",[rowing[s].user_id],(err,rows)=>{
     
    for (let x = 0; x < rowing.length; x++) {
    
   
      result.push({
         id:rows[0].id,
         username:rows[0].username,
         profile_photo: rows[0].profile_photo,
         comment: rowing[x].comment,
         comsetmy:false,
         id_comment:rowing[x].id_comment,
         time:human(new Date(rowing[x].time+ 5 * 1000)),
      });
  
    
    }

    if(result.length==row.length){

     res.send(result);


      }

      
 
    });
  }


  });
  

  });
});

app.get("/dlate_comment",(req,res)=>{
  var id_comment = req.query.id_comment;

  
  con.query("DELETE FROM comment WHERE id_comment=?",[id_comment],(err,row)=>{

   res.send("den");

  });

});
app.get("/get_notifications_comment_",(req,res)=>{
  var user_id = req.query.user_id;
  var result =[];

    con.query("SELECT * FROM users INNER JOIN Post ON users.id =? AND Post.user_id=users.id",[user_id],(err,rowing)=>{

       for (let index = 0; index < rowing.length; index++) {
    
      
      con.query("SELECT * FROM comment WHERE post_id=?",[rowing[index].post_id],(err,rows)=>{

      
      res.send(rows);
        

     });

       }
    
   });

});


app.get("/get_notifications_comment",(req,res)=>{
  var user_id = req.query.user_id;
  var result =[];
//  var i="SELECT * FROM users INNER JOIN Post ON users.id =? AND Post.user_id=users.id";

//   var x="SELECT * FROM Post INNER JOIN users ON Post.user_id =? AND users.id=Post.user_id"
  con.query("SELECT * FROM Post WHERE user_id=?",[user_id],(err,row)=>{
    for (let a = 0; a < row.length; a++) {
        console.log(row[a].post_id);
   
    // var ss="SELECT * FROM comment WHERE post_id =? AND user_id!=?"
    con.query("SELECT * FROM comment INNER JOIN users ON comment.post_id =? AND comment.user_id!=? AND users.id=comment.user_id",[row[a].post_id,row[a].user_id],(err,rowing)=>{

       for (let index = 0; index < rowing.length; index++) {
   
      
       try{

        result.push({
          user_id: rowing[index].user_id,
          username: rowing[index].username,
          profile_photo: rowing[index].profile_photo,
          comment:rowing[index].comment,
          image:row[a].image,
          title:row[a].title,
          time2:rowing[index].time,
          time:human(new Date(rowing[index].time+ 5 * 1000)),
        });

        res.send(result);

       }catch(_){

       }
      } 
  
  
    
  
  });

  }
  });

});

const date = require('date-and-time');
const { assert } = require("console");
const { init } = require("express/lib/application");

// Formatting the date and time
// by using date.format() method


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
                  console.log("den");

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

             // res.send(result);
            }
          );
        }
      } else {
        res.send("[]");
      }
    }
  );
});
/*
app.get("/getfollowing6666", (req, res) => {
  var account_id = req.query.account_id;
  var result = [];

  con.query(
    "SELECT * FROM follows WHERE account_id=?",
    [account_id],
    (err, rows) => {
      if (rows.length > 0) {
      //  console.log(rows);
        for (let i = 0; i < rows.length; i++) {
          con.query(
            "SELECT * FROM users WHERE id =?",
            [rows[i].fan_id],
            (err, row) => {
             // console.log(row);
              con.query(
                "SELECT * FROM follows WHERE fan_id=? AND account_id=?",
                [rows[i].fan_id, account_id],
                (err, rowing) => {
                 console.log(rowing);

                  for (let index = 0; index < rowing.length; index++) {
                    
                    if (account_id == account_id) {
                    
                        result.push({
                          id: row[0].id,
                          username: row[0].username,
                          profile_photo: row[0].profile_photo,
                          like: true,
                        });
                       
                  
                        console.log("jj");
                    
                      
                    

                     
                      /// res.send(result);
                         
                      
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
*/

//الاشعارات المتابعين
app.get("/getfollowing6", (req, res) => {
  var account_id = req.query.account_id;
  var result = [];
 
  con.query("SELECT * FROM follows INNER JOIN users ON follows.account_id=? AND users.id=follows.fan_id",[account_id], (err, rows) => {
      


 for (let i = 0; i < rows.length; i++) {
   
 con.query("SELECT * FROM follows WHERE  account_id=?",[rows[i].fan_id],(err,rowing)=>{
   for (let index = 0; index < rowing.length; index++) {
      
  if(rowing[index].fan_id==account_id){
    console.log("kk");

    if(result.length==i)
    {
      result.push({
        id: rows[i].id,
        username: rows[i].username,
        time2:rows[i].time,
        time:human(new Date(rowing[index].time+ 5 * 1000)),
        profile_photo: rows[i].profile_photo,
        like: true,
      });

 
     }

    
  }


   }
  
   if(result.length==i)
   {
   result.push({
     id: rows[i].id,
     username: rows[i].username,
     profile_photo: rows[i].profile_photo,
     time2:rows[i].time,
     time:human(new Date(rows[i].time+ 5 * 1000)),
     like: false,
   });
 
    }
  
   if(result.length==rows.length){
     res.send(result);
  
    }


     });
 }

});
});


app.get("/follow_requests", jsonParser, (req, res) => {
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
          "SELECT * FROM follow_requests WHERE account_id =? AND fan_id = ?",
          [account_id, row[0].id],
          (err, row1) => {
            if (row1.length == 0) {
              ///  var sql = "INSERT INTO Post (user_id,title) VALUES ('"+rows[0].id.toString()+"','"+title+"')";
              con.query(
                "INSERT INTO follow_requests (account_id,fan_id) VALUES ('" +
                  account_id +
                  "','" +
                  row[0].id.toString() +
                  "')",
                (err, rows) => {
                  result.push({
                    follow: true,
                  });
                  console.log("den");

                  // AddNotification(row[0].id,2,row[0].id,account_id);
                  res.send(result);
                }
              );
            } else {
          
              con.query(
                "DELETE FROM follow_requests WHERE account_id = ? AND fan_id = ?",
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
//يجيب المتابعين الي في الركوست
app.get("/get_follow_requests",(req,res)=>{
  var account_id = req.query.account_id;
  var result = [];
 
  con.query("SELECT * FROM follow_requests INNER JOIN users ON follow_requests.account_id=? AND users.id=follow_requests.fan_id",[account_id], (err, rows) => {
      


 for (let i = 0; i < rows.length; i++) {
   
   if(result.length==i)
   {
   result.push({
     id: rows[i].id,
     account_id:rows[i].account_id,
     username: rows[i].username,
     profile_photo: rows[i].profile_photo,
     time:human(new Date(rows[i].time+ 5 * 1000)),
   
   });
 
    }
  
   if(result.length==rows.length){
     res.send(result);
  
    }



 }

});

});

//الموافقه على طلب الركوست
app.get("/den_follow_requests",(req,res)=>{
  var account_id = req.query.account_id;
  var result = [];
  con.query("SELECT * FROM users WHERE email = '"+req.query.email+"'And password ='"+req.query.password+"'",(err, row) => {
    
    

      if (row.length != 0) {
        

        con.query("SELECT * FROM follow_requests WHERE account_id =? AND fan_id = ?",[account_id, row[0].id],(err, row1) => {
          
            if (row1.length == 0) {
            
              con.query("INSERT INTO follow_requests (account_id,fan_id) VALUES ('" +account_id +"','" +row[0].id.toString() +"')",(err, rows) => {
              
                  result.push({
                    follow: true,
                  });
                  console.log("den");

                  // AddNotification(row[0].id,2,row[0].id,account_id);
                  res.send(result);
                }
              );
            } else {
          
        
              con.query("DELETE FROM follow_requests WHERE account_id = ? AND fan_id = ?",[account_id, row[0].id],(err, rows) => {
              
              
                  result.push({
                    follow: false,
                  });
                  /// AddNotification_delete(row[0].id,2,row[0].id,account_id);
                  res.send(result);

                  con.query("INSERT INTO follows (account_id,fan_id) VALUES ('" +account_id +"','" +row[0].id+"')",(err, rows) => {
            
                  
                    // AddNotification(row[0].id,2,row[0].id,account_id);
            
                  }
                );

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

//يعرف اذا ضايفه في الركوست او لا

app.get("/follow_true",(req,res)=>{
  var fan_id = req.query.fan_id;
  var account_id = req.query.account_id;
  var result=[];


    con.query("SELECT * FROM follow_requests WHERE fan_id=? AND account_id=?",[fan_id,account_id],(err, rowing) => {
 

        for (var index = 0; index < rowing.length; index++) {
         
        
        if (rowing[index].fan_id==fan_id&&rowing[index].account_id==account_id) 

        {

             
             
                    result.push({request:true});
                    res.send(result);
                  
            
          }

        }
         if(rowing.length>0){
          
         }else{
            
          result.push({request:false});
        
          res.send(result);
      
         }


        
     
       
        
      
    }
  );

 

});



//وظيفته يحذف طلبات الركوستات 
app.get("/delete_follow_requests",(req,res)=>{
  var account_id = req.query.account_id;
  var result = [];
  con.query( "SELECT * FROM users WHERE email ='"+req.query.email+"'And password ='"+req.query.password +"'",(err, row) => {
  

      if (row.length != 0) {
       
        con.query("SELECT * FROM follow_requests WHERE account_id =? AND fan_id = ?",[account_id, row[0].id],(err, row1) => {
         
            if (row1.length == 0) {
            
              res.send("no");

            } else {
 
          
              con.query("DELETE FROM follow_requests WHERE account_id = ? AND fan_id = ?",[account_id, row[0].id],(err, rows) => {
              
                  result.push({
                    follow: false,
                  });
               
                  res.send(result);
                }
              );
            }
          }
        );
      } else {
        res.send("error");
      }
    
    });

});
//اظافه تاك 
app.get("/add_mention",(req,res)=>{
  var post_id = req.query.post_id;
  var user_id = req.query.user_id;
  var results = [];
   
   con.query("SELECT * FROM users WHERE email ='"+req.query.email+"'And password ='"+req.query.password +"'",(err,row)=>{
   
    //console.log(row);
    con.query("SELECT * FROM Post WHERE post_id=?",[post_id],(err,row1)=>{

      
      con.query("INSERT INTO mention (fan_id,post_id,user_id) VALUES ('"+row[0].id+"','" +post_id+"','"+user_id+"')",(err, rows) => {
            
      
   
        res.send("den");
    });
  
    })
    
   

   });
});


//يجلب الي مسويلي ناك

app.get("/get_mention",(req,res)=>{
  var user__id = req.query.user__id;
  var results = [];
  con.query("SELECT * FROM mention INNER JOIN users JOIN Post ON mention.user__id=? AND users.id=mention.fan_id AND Post.post_id=mention.post_id",[user__id],(err,rowing)=>{
    for (let index = 0; index < rowing.length; index++) {

    if(results.length==index){
    results.push({mention:null,fan_id:rowing[index].fan_id,user__id:rowing[index].user__id,username:rowing[index].username,profile_photo:rowing[index].profile_photo,title:rowing[index].title,image:rowing[index].image,time2:rowing[index].time,time:human(new Date(rowing[index].time2+ 5 * 1000)),});
    }
    if(results.length==rowing.length){
      res.send(results);
    }
    
    }
    
   
   
   });
});

app.get("/serch_mention",(req,res)=>{
  var username = req.query.username;
  // var us=username.substring(1);
  var sql2 ="SELECT `id`, `username` ,`profile_photo` , `bio` FROM users WHERE username REGEXP '[a-z 0-9].["+username+"]'";
 // var sql = "SELECT `id`, `username` ,`profile_photo`  FROM users WHERE id LIKE '%"+us+"%'";
  con.query(sql2,(err,row)=>{
    res.send(row);
   // console.log(row);
  });

});

app.get("/serch_mention2",(req,res)=>{
  var username = req.query.username;
  var id = req.query.id;
  var results = [];
  var sql2 ="SELECT `id`, `username` ,`profile_photo` , `bio` FROM users WHERE username =?";
  con.query(sql2,[username],(err,rowing)=>{
    for (let index = 0; index < rowing.length; index++) {

    if(rowing[index].id==id){
      results.push({username:rowing[index].username,profile_photo:rowing[index].profile_photo,bio:rowing[index].bio,id:rowing[index].id,myid:true});
    }else{
      results.push({username:rowing[index].username,profile_photo:rowing[index].profile_photo,bio:rowing[index].bio,id:rowing[index].id,myid:false});
    }

    }
    res.send(results);
    
   // console.log(row);
  });

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
    "SELECT id, profile_photo ,username FROM users WHERE username LIKE '"+username+"%'";

  con.query(sq, (err, row) => {
  
    res.send(row);
  });
});

app.get("/serch2", (req, res) => {
  var username = req.query.username;
  var id = req.query.id;
  
    con.query("SELECT id, profile_photo ,username FROM users WHERE username LIKE '"+username+"%' AND id !=?",[id], (err, rows)  => {
  
      res.send(rows);
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
