const express = require('express')
const router = express.Router();
var moment = require("moment");
require('dotenv').config();
var mysql = require("mysql2");

var connection = mysql.createConnection({
    host : process.env.host, //127.0.0.1
    port : process.env.port,
    user : process.env.user, 
    password : process.env.password,
    database : process.env.database
});

  router.get("/", function(req, res, next){
      console.log(req.session)
      if(!req.session.logged){
          res.redirect("/")
      }else{
        connection.query(
            `select * from board`,
            function(err, result){
                if(err){
                    console.log(err);
                    res.send("select Error")
                }else{
                    //   console.log(result);
                    //   console.log(result.length);
                    //   res.send(result);
                    res.render('index', {
                        content : result,
                        name : req.session.logged.name
                    })
                }
            }
        )
      }
  })

  router.get("/add", function(req, res, next){
      if(!req.session.logged){
          res.redirect("/")
      }else{
        res.render('add',{
            name : req.session.logged.name
        });
      }
  })

  router.post("/add_2", function(req, res, next){
      var title = req.body.title;
      var content = req.body.content;
      var img = req.body.img;
      var date = moment().format("YYYYMMDD");
      var time = moment().format("HHmmss");
      console.log(title, content);
      if(!req.session.logged){
          res.redirect("/")
      }else{
        var author = req.session.logged.name;
        var post_id = req.session.logged.post_id;
        connection.query(
            `insert into board(title, content, img, date, time, author, post_id) values (?, ?, ?, ?, ?, ?, ?)`,
            [title, content, img, date, time, author, post_id],
            function(err, result){
                if(err){
                    console.log(err);
                    res.send("add insert Error")
                }else{
                    res.redirect("/board")
                }
            }
        )
      }
  })

  router.get("/info", function(req, res, next){
    var no = req.query.no;
    // console.log(no);
    if(!req.session.logged){
        res.redirect("/")
    }else{
        connection.query(
            `select * from board where No = ?`,
            [no],
            function(err, result){
                if(err){
                    console.log(err)
                    res.send("info select Error")
                }else{
                    connection.query(
                        `select * from comment where parent_num = ?`,
                        [no], function(err2, result2){
                            if(err2){
                                console.log(err2)
                                res.render("error",{
                                    message : "댓글 불러오기 오류"
                                })
                            }else{
                                // console.log(req.session.logged.post_id);
                                res.render('info', {
                                    content : result,
                                    post_id : req.session.logged.post_id,
                                    name : req.session.logged.name,
                                    comment : result2
                                });
                            }
                        }
                    );
                }
            }
        );
    }
  });

  router.get("")

  router.get("/del", function(req, res, next){
      var no = req.query.no;
      console.log(no);
      if(!req.session.logged){
          res.redirect("/")
      }else{
        connection.query(
            `delete from board where No = ?`,
            [no],
            function(err, result){
                if(err){
                    console.log(err);
                    res.send("delete Error")
                }else{
                    res.redirect("/board",{
                        name : req.session.logged.name
                    })
                }
            }
        )
      }
  })

  router.get("/update", function(req, res, next){
      var no = req.query.no;
      console.log(no);
      if(!req.session.logged){
          res.redirect("/")
      }else{
        connection.query(
            `select * from board where No = ?`,
            [no],
            function(err, result){
                if(err){
                    console.log(err);
                    res.send("update select Error")
                }else{
                    console.log(result) ;
                    res.render('update', {                        
                        content : result,
                        name : req.session.logged.name
                    })
                }
            }
        )
      }
  })

  router.post("/update_2", function(req, res, next){
      var no = req.body.no;
      var post_id = req.body.post_id
      var title = req.body.title;
      var content = req.body.content;
      console.log(no, title, content);
      if(!req.session.logged){
          res.redirect("/")
      }else{
        if(post_id == req.session.logged.post_id){
            connection.query(
                `update board set title = ?, content = ? where No = ?`,
                [title, content, no],
                function(err, result){
                    if(err){
                        console.log(err);
                        res.send("update_2 update Error")
                    }else{
                        res.redirect("/board")
                    }
                }
            )
        }else{
            res.send("작성자와 로그인한 아이디가 같지 않습니다.")
        }
      }
  })

  router.post("/add_comment", function(req, res, next){
      if(!req.session.logged){
          res.redirect() ;
      }
      var no = req.body.no ;
      var opinion = req.body.opinion ;
      var post_id = req.session.logged.post_id ;
      var name = req.session.logged.name ;
      var date = moment().format("YYYYMMDD") ;
      var time = moment().format("HHmmss") ;
    //   console.log(no, opinion, post_id, name, date, time) ;
      connection.query(
          `insert into comment (parent_num, opinion, post_id, name, date, time)
          values (?, ?, ?, ?, ?, ?)`,
          [no, opinion, post_id, name, date, time],function(err,result){
              if(err){
                  console.log(err) ;
                  res.render("error",{
                      message : "댓추실",
                  })
                }else{
                    res.redirect("/board/info?no="+no)
                }
              }
        )
  })

  router.get("/comment_del/:no/:parent_num",function(req, res, next){
      var no = req.params.no ;
      var parent_num = req.params.parent_num ;
      connection.querry(
          `delete where no = ? and parent_num = ?`,
          [no,parent_num],function(err,result){
              if (err){
                  console.log(err) ;
                  res.render("error",{
                      message : "댓삭실",
                  })
              }else{
                  res.redirect("/board/info?no="+no)
              }
          }
      )
  })

  router.get("/comment_update/:no/:parent_num",function(req, res, next){
    var no = req.params.no ;
    var parent_num = req.params.parent_num ;
    connection.querry(
        `update where no = ? and parent_num = ?`,
        [no,parent_num],function(err,result){
            if (err){
                console.log(err) ;
                res.render("error",{
                    message : "댓삭실",
                })
            }else{
                res.redirect("/board/info?no="+no)
            }
        }
    )
})

router.get("/comment_like", function(req, res, next){
    var no = req.query.No ;
    var parent_num = req.query.parent_num ;
    var recommend = ++parseInt(req.query.recommend) ;

    console.log(parent_num, recommend) ;
    connection.query(
        `update comment set recommend = ? where No = ?`,
        [recommend, no], function(err,result){
            // console.log(err) ;
            if(err){
                res.render("error",{
                    message : "좋아요 추가 에러"
                })
            }else{
                res.redirect("/board/info?no="+parent_num) ;
            }      
        }
    ) ;
}) ;

router.get("/comment_hate", function(req, res, next){
    var no = req.query.No ;
    var parent_num = req.query.parent_num ;
    var disrecommend = parseInt(req.query.disrecommend) + 1;

    console.log(parent_num, disrecommend) ;
    connection.query(
        `update comment set disrecommend = ? where No = ?`,
        [disrecommend, no], function(err,result){
            // console.log(err) ;
            if(err){
                res.render("error",{
                    message : "좋아요 추가 에러"
                })
            }else{
                res.redirect("/board/info?no="+parent_num) ;
            }      
        }
    ) ;
}) ;

  module.exports = router;