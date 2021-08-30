require("dotenv").config();
const express= require("express");
const ejs= require("ejs");
const bodyParser= require("body-parser");
const app= express();
var axios = require('axios').default;
const mongoose = require("mongoose");
var users;
const challenge= 1;
app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/leaderDB", { useUnifiedTopology: true, useNewUrlParser: true });

const memberSchema=new mongoose.Schema( {
  username: String, // codechef username
  L_Score: Number, //leaderboard score
  L_rank: Number, // leaderboard rank
  division: Number
});
const Members = mongoose.model("Member", memberSchema);

var options = {
  method: 'POST',
  url: 'https://api.codechef.com/oauth/token',
  headers: {'content-type': 'application/json'},
  data: {
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: 'public',
    redirect_uri: 'http://127.0.0.1:3000/result'
  }
};

axios.request(options).then(function (response) {
  //console.log(response.data.result.data.access_token);
  access_token= response.data.result.data.access_token;
  axios.request({
    method: 'GET',
   url: 'https://api.codechef.com/rankings/LTIME99C?fields=username,totalScore&institution=Mugneeram%20Bangur%20Memorial%20Engineering%20College%2C%20Jodhpur',
   headers: {'content-type': 'application/json', authorization: 'Bearer '+access_token}
 }).then(function (res) {
    //console.log(res.data.result.data.content);
    users= res.data.result.data.content;
    users.forEach(function(user){
      Members.findOne({username: user.username}, function(err, result){
        if(err)
        console.log(err);
        else{
          if(result)
          {
            console.log(parseInt(user.totalScore));
            result.L_Score=parseInt(user.totalScore);
            result.L_rank= parseInt(user.rank);
            result.division= 5;
            result.save(function(err){
            });
            //console.log(result);

          }
          else{
            const newItem= new Members({
              username:user.username,
              L_Score: parseInt(user.totalScore),
              L_rank: parseInt(user.rank),
              division: 3

            });
            newItem.save();

          }
        }
      });
    });






  }).catch(function (error) {
    console.error(error);
  });
}).catch(function (error) {
  console.error(error);




});




app.get("/",function(req,res){
  res.render("index.ejs",{data: users});
});

app.listen(3000,function(req,res){
  console.log("server started at port 3000");
});
