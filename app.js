const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const nodemailer=require('nodemailer');
require('dotenv').config()
const mysql = require('mysql');


const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "blogusers"
});


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
});

let gemail="";
let gpass="";
let gcode=0;

function sendMail(reciever,code){
    let mailOptions = {
        from: 'koreantunnel@gmail.com',
        to: reciever,
        subject: 'Verification Code',
        text: code
    };
    console.log('pop--'+reciever);
    transporter.sendMail(mailOptions, function(err, data) {
        if (err) {
          console.log("Error " + err);
          return 0;
        } else {
          console.log("Email sent successfully");
          return 1;
        }
      });

}

app.post('/two-factor',function(req,res){
    var sql = "select code from users where code="+req.body.twoFactorCode;
    con.query(sql, function (err, result) {
      if (err) throw err
      else if(!result.length) 
      res.redirect('/signup')
        res.redirect('dashboard')
      });
})



app.post('/signup',function(req,res){
    let code=''+Math.floor(100000 + Math.random() * 900000);
    let email=req.body.email;
    let password=req.body.password;
    
    if(!sendMail(email,code)){
        var sql = "INSERT INTO users (email, password,code,role) VALUES ('"+email+"','"+password+"','"+code+"','"+"user"+"')";
        con.query(sql, function (err, result) {
            if (err) throw err;
            console.log("1 record inserted");
        });
        res.render('two-factor')
    }else
    res.render('signup')
})

app.post('/signin',function(req,res){
    
    let email=req.body.email;
    let password=req.body.password;
    let code=''+Math.floor(100000 + Math.random() * 900000);
 
    var sql="select email,password from users where email='"+email+"' && password='"+password+"'";
    con.query(sql,function(err,results){
        if (results.length===0)
        res.redirect('signin')
        else 
        {
            if(!sendMail(email,code)){
                var sql = "update users set code='"+code+"' where email='"+email+"'";
                con.query(sql,function(err,result){
                    if(err)throw err;
                    else
                        res.redirect('two-factor')
                })
            }else 
            res.redirect('signin')
        }
    })
})












app.get('/two-factor',function(req,res){
    res.render('two-factor')
})

app.get('/dashboard',function(req,res){
    res.render('dashboard')
})

app.get('/signup',function(req,res){
    res.render('signup')
})

app.get('/signin',function(req,res){
    res.render('signin')
})






app.listen(3000,function(req,res){
    console.log('Port Active: 3000');
})