
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { toPath } = require("lodash");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');


mongoose.connect("mongodb+srv://uday-kiran:uday-kiran@cluster0.rxvxt.mongodb.net/to_do_DB");

const titleSchema = new mongoose.Schema({
    name:String
});

const titleModel = new mongoose.model("title",titleSchema);

const _1stline = new titleModel({
    name:"to add list enter title below"
});
const _2ndline = new titleModel({
    name:"<== click to delete existing"
});

const default_items = [_1stline,_2ndline];

app.get("/",function(req,res){
    titleModel.find({},function(err,data){
        if(err){
            console.log(err);
        }
        else{
            if(data.length===0){
                titleModel.insertMany(default_items,function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("sucessfully instered titles in DB");
                    }
                });
                res.redirect("/");
            }
            else{
                res.render("home",{title:"time",titles:data});
            }
        }
    });
});

app.post("/",function(req,res){
    const newtitle = new titleModel({
        name:req.body.reqList
    })
    newtitle.save();
    res.redirect("/");
});

app.post("/delete",function(req,res){
    titleModel.deleteOne({name:req.body.checkbox},function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("deleted "+req.body.checkbox + " sucessfully");
        }
    });
    listModel.deleteOne({name:req.body.checkbox},function(err){
        if(err){
            console.log(err);
        }
        else{
            console.log("deleted "+req.body.checkbox + " sucessfully");
        }
    });
    res.redirect("/");
});

const listSchema = new mongoose.Schema({
    name:"String",
    items: [titleSchema]
});

const listModel = new mongoose.model("list",listSchema);

app.get("/:listname",function(req,res){
    const req_list=req.params.listname;
    listModel.findOne({name:req_list},function(err,data){
        if(err){
            console.log(err);
        }
        else{
            if(!data){
                const listitems = new listModel({
                    name:req_list,
                    items:default_items
                })
                listitems.save();
                res.redirect("/"+req_list);
            }
            else{
                res.render("lists",{title:req_list,titles:data.items});
            }
        }
    });
});

app.post("/:listname",function(req,res){
    const req_list=req.params.listname;
    listModel.findOne({name:req_list},function(err,data){
        if(err){
            console.log(err);
        }
        else{
            const newItem = new titleModel({
                name:req.body.reqList
            })
            data.items.push(newItem);
            listModel.updateOne({name:req_list},{items:data.items},function(err){
                if(err){
                    throw err;
                }
            })
            res.redirect("/"+req_list);
        }
    });
});

app.post("/:listname/delete",function(req,res){
    const req_list=req.params.listname;
    console.log("came here");
    listModel.findOneAndUpdate({name:req_list},{$pull:{items:{name:req.body.checkbox}}},function(err,foundList){
        if(!err){
            
            res.redirect("/"+req_list);
        }
        else{
            console.log(req.body.checkbox);
        }
    }
);
    // res.redirect("/"+req_list);
});



app.listen(process.env.PORT || 3000,function(){
    console.log("server started on localhost:3000")
})
