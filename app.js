//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require('lodash');

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Using DB
const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://fahadkhan:fahadfaraz10@cluster0.gv3eye4.mongodb.net/todolistDB");
//mongodb+srv://fahadkhan:fahadfaraz10@cluster0.gv3eye4.mongodb.net/?retryWrites=true&w=majority
//mongodb://localhost:27017/todolistDB

// const Schema = mongoose.Schema;
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "EAT",
});

const item2 = new Item({
  name: "SLEEP",
});

const item3 = new Item({
  name: "CODE",
});

const item4 = new Item({
  name: "REPEAT",
});
const defaultItems = [item1, item2, item3, item4];

//List Schema
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);

//Without DB
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function (req, res) {
  // const day = date.getDate();

  // Finding and Logging Items
  Item.find({}, function (err, resultsArray) {
    //inserting items if array is emtpy
    if (resultsArray.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted");
          res.redirect("/");
        }
      });
    } else {
      res.render("list", { listTitle: "Today", newListItems: resultsArray });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

//Delete Request
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted Successfully");
        res.redirect("/");
      }
    });
  } else {
    List.findByIdAndRemove(checkedItemId, function (err) {
      if (err) {
        console.log(err);
      } else {
        List.findOneAndUpdate(
          { name: listName },
          { $pull: { items: { _id: checkedItemId } } },
          function (err, result) {
            if (err) {
              console.log(err);
            } else {
              res.redirect("/" + listName);
            }
          }
        );
      }
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName) ;

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (foundList) {
        res.render("list", {
          listTitle: customListName,
          newListItems: foundList.items,
        });
      } else {
        //Create
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      }
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
