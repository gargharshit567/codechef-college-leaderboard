require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const app = express();
var axios = require('axios').default;
const mongoose = require("mongoose");
var users = [];
const challenge = 1;
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://localhost:27017/leaderDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const memberSchema = new mongoose.Schema({
  username: String, // codechef username
  L_Score: Number, //leaderboard score
  L_rank: Number, // leaderboard rank
  division: Number,
  rating:Number,
  problem_solved: Number,
  //old_rank: Number,
  old_score:Number,
  old_problems: Number
});
const Members = mongoose.model("Member", memberSchema);
var total_st; //new
var sorted_members=[];
var options = {
  method: 'POST',
  url: 'https://api.codechef.com/oauth/token',
  headers: {
    'content-type': 'application/json'
  },
  data: {
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    scope: 'public',
    redirect_uri: 'http://127.0.0.1:3000/result'
  }
};
app.post("/", function(req, res) {
  const contestCode = req.body.contestCode;
  const div = req.body.division;
  //console.log(contestCode);
  const cn = parseInt(req.body.contestNumber);
  const url = "https://api.codechef.com/rankings/" + contestCode + "?fields=username,totalScore,rating,problemScore&institution=Mugneeram%20Bangur%20Memorial%20Engineering%20College%2C%20Jodhpur";
  //  'https://api.codechef.com/rankings/LTIME99C?fields=username,totalScore&institution=Mugneeram%20Bangur%20Memorial%20Engineering%20College%2C%20Jodhpur',
  const weightage = [[15,30,30,25],[25,20,20,35]];
  const sendRequest = async () => {
    try {
        const nothing = await axios.request(options).then(function(response) {
          console.log("coming in axios 1st....");
          //console.log(response.data.result.data.access_token);
          access_token = response.data.result.data.access_token;
          console.log("access_token :"+access_token);
          axios.request({
            method: 'GET',
            url: url,
            headers: {
              'content-type': 'application/json',
              authorization: 'Bearer ' + access_token
            }
          }).then(function(result) {
            //console.log(result.data.result.data.content);
            users = result.data.result.data.content;
            //console.log("users : ");
            //console.log(users);
            var cnt=1;
            var rank= users[0].rank;
            var top_score= parseFloat(users[0].totalScore);
             total_st= users.length; //new
            users.forEach(function(user){
               if(user.rank == rank)user.rank= cnt;
               else
               {
                 cnt++;
                 rank= user.rank;
                 user.rank=cnt;
               }
               user['problem_solved']= Math.floor(parseInt(user.totalScore/100));
               user.totalScore = parseInt(((parseFloat(user.totalScore )* weightage[div-2][cn-1])/(top_score* Math.pow(user.rank,(1.0 / total_st)))*100.0));
              //if(user.username==="piyush_482000")console.log(user);
              //if(user.username==="harsshar14")console.log(user);
            });
            var debug=0;
            if(cn!=1){
             const each= Members.deleteMany({}).exec();
             each.then();
           }
            each.then(function(resu){
                //console.log(resu);
                if(cn==1){
                  resu.forEach(function(result){
                    result.old_score= result.L_Score;
                    result.L_Score=0;
                  });

                }

            });



          }).catch(function(error) {
            console.error(error);
          });
        }).catch(function(error) {
          console.error(error);

        });
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
}

sendRequest();

res.redirect("/");
  console.log("coming in main....")


});


app.get("/admin_only", function(req, res) {
  res.render("admin_only");
});

app.get("/", function(req, res) {
//console.log(req.query);
//console.log(Object.keys(req.query).length);
//console.log(sorted_members);

//async function run() {


  // Clear the database every time. This is for the sake of example only,
  // don't do this in prod :)
  var sorted_members =[];
  const query = Members.find({division:3}).sort({L_Score:-1}).lean().exec();
  // found = found.toArray();
  //  console.log(found);
  query.then(function(docs){
    //console.log(docs);
  var found1= docs;
  //var found1= [];
  // found.forEach(function(item){
  //   found1.push(item);
  // });

  //console.log(sorted_members);
  var count=1;
    var last= found1[0].L_Score;
    for(var i=1; i<=found1.length ;i++) {
      //const item= found[i-1];

       if (last!==found1[i-1].L_Score) {
         count=count+1;
        last= found1[i-1].L_Score;
       }
    found1[i-1].L_rank=count;

  }
  sorted_members= found1;
  var limit= 20,page=1;
  var queries= req.query;
  if(queries.hasOwnProperty("limit")){
    limit= parseInt(queries.limit);
  }
  if(queries.hasOwnProperty("page"))page= parseInt(queries.page);
  //const tmp_arr= sorted_members.slice((page-1)*limit,page*limit);
  //console.log("length :"+tmp_arr.length);
  const pages= Math.ceil(sorted_members.length/limit);
  console.log("length :"+ sorted_members.length );
  const paras= {
    pages:pages,
    limit:limit,
    page:page,

  };
  res.render("index", {data: sorted_members, paras:paras});
//}
//run().catch(error => console.log(error.stack));

console.log("home route...");

   // new
});
});

app.listen(3000, function(req, res) {
  console.log("server started at port 3000");
});
