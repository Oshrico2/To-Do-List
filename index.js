import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();
// var listToday = [];
// var listWork = [];
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
//enter your details:
mongoose.connect("mongodb+srv://Username:Password@cluster0.2yb6sz3.mongodb.net/todolistDB");
const itemsSchema = new mongoose.Schema({
    name:{
        type: String,
    }
});
const listsSchema = new mongoose.Schema({
    name:String,
    items: [itemsSchema]
});

const Item = mongoose.model("Item",itemsSchema);
const List = mongoose.model("List",listsSchema);

const item1 = new Item({
    name:"Wolcome to your to do list!"
});
const item2 = new Item({
    name:"Hit the + button to add a new item."
});
const item3 = new Item({
    name:"<--- Hit this to delete an item. "
});

const defaultItems = [item1,item2,item3];
// Item.insertMany(defaultItems);
app.get("/",(req,res)=>{
    List.find({},'name').then(names=>{
        const nameofLists = names.map(value=>value.name);
        console.log(nameofLists);
        res.render("choose.ejs",{listNames:nameofLists});
    });
    console.log("1");
    
    
});


    

app.get("/today",(req,res)=>{

    
    Item.find({})
    .then(itemsFound => {
    if(itemsFound.length===0)
    {
        Item.insertMany(defaultItems);
        res.redirect("/");
    }else{
        res.render("today.ejs", { list: itemsFound });

    }
    })
    .catch(error => {
      console.error(error);
    });
    console.log("2");

});



app.get("/:paramName",(req,res)=>{
    const customListName = _.capitalize(req.params.paramName);
    if(customListName != "today")
{
    List.findOne({name:customListName})
    .then(listName => {
    if(listName)
    {
        res.render("list.ejs", { listTitle: listName.name,list:listName.items});
    }else{
        const list = new List({
        name:customListName,
        items:defaultItems
    });
    list.save();
    res.redirect("/" + customListName);
    }
    })
    .catch(error => {
      console.error(error);
    });
}
console.log("3");


});

app.post("/",(req,res)=>{
    const buttonValue = req.body.list;
    const textValue = req.body.newItem;

    const item = new Item({
        name:textValue
    });

    if(buttonValue === "Today"){
        item.save();
        res.redirect("/today");
    }
    else{
     List.findOne({name:buttonValue})
     .then(listName=>{
        listName.items.push(item);
        listName.save();
        res.redirect("/" + buttonValue);
     }).catch(error => {
        console.error(error);
      });
    }
    console.log("4");

});

app.post("/delete",(req,res)=>{
    const itemChecked = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndDelete(itemChecked)
    .then(deletedItem => {
      console.log('Deleted item:', deletedItem);
    })
    .catch(error => {
      console.error(error);
    });
    res.redirect("/today");
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id : itemChecked}}})
        .then(itemsFound=>{
            console.log('Deleted item:', itemsFound);
            res.redirect("/" + listName);
        }).catch(err=>{
            console.error(err);
        })
    }
    console.log("5");

});

app.post("/add-list",(req,res)=>{
    const newItem = _.capitalize(req.body.newItem);
    List.findOne({name:newItem})
    .then(value =>{
        if(!value){
            const list = new List({
                name:newItem,
                items:defaultItems
            });
            list.save();
        }
    }).catch(err=>{
        console.error(err);
    });

    console.log("6");

    

    res.redirect("/");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
