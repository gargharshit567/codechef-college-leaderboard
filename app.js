app.post("/", function(req,res){
  const contestCode = req.body.contestCode;
  const offset = req.body.offset;
  const cn= req.body.contestNumber;
  const url="https://api.codechef.com/rankings/"+contestCode+"?fields=username,totalScore&institution=Mugneeram%20Bangur%20Memorial%20Engineering%20College%2C%20Jodhpur&offset="+offset+"&sortBy=rank";"

});

app.get("/login", function(req,res){
  res.render("login");
});
app.post("/login",function(req,res){
  if(req.body.admin_name === "CodeChefMBM2021" && req.body.admin_password === process.env.SECRET)
  {
    res.render("admin_only");
  }
  else{
    res.redirect("/login")
  }
});
