var mySQL = require("mysql");
var inquirer = require("inquirer");
var fs = require("fs");

var connection = mySQL.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon_db"
});

connection.connect(function(err) {
    if (err) throw err;
    //console.log("connected as id: " + connection.threadId);
    initialize();
});

function initialize() {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        productChoice = [];
        howMany = [];
        stockArr = [];
        console.log("--------------------------");
        console.log("ID"+ " | " +"Product Name"+ " | " +"$Price$")
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].price);
        }
        console.log("--------------------------");
        buy();
    });
}
var productChoice = [];
function buy() {
    inquirer
        .prompt({
            name: "product",
            type: "input",
            message: "Enter the itemID of the product you wish to buy."
        })
        .then(function(answer) {
            if (answer.product >=1 && answer.product <=10) {
                productChoice.push(answer.product);
                //console.log(productChoice);
                units();
            }else{
                console.log("--------------------------");
                console.log("Invalid entry.. Try entering one of the itemID's from the table.");
                console.log("--------------------------");
                initialize();
            }
        });
}

var howMany = [];
function units() {
    inquirer
        .prompt({
            name: "units",
            type: "input",
            message: "How many units do you wish to buy?",
            validate: function(value) {
                if(isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        })
        .then(function(answer) {
            howMany.push(answer.units);
            //console.log(howMany);
            verify();
        });
}

var stockArr = [];
function verify() {
    connection.query("SELECT * FROM products WHERE item_id=?", [productChoice], function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            //console.log(res[i].stock);
            if (parseInt(howMany) <= res[i].stock) {
                stockArr.push(res[i].stock);
                //console.log(stockArr);
                update();
                purchase();
            }else{
                console.log("Insufficent Quantity! We may be out of stock or don't have enough stock. try a lesser value.")
                initialize();
        }
    }
    });
}

function update() {
    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock: parseInt(stockArr) - parseInt(howMany)
            },
            {
                item_id: parseInt(productChoice)
            }
        ],
        function(err, res) {
            //console.log(res.affectedRows)
        }
    );
    //console.log(query.sql);
}

function purchase() {
    connection.query("SELECT * FROM products WHERE item_id=?", [productChoice], function(err, res) {
        for (var i = 0; i < res.length; i++) {
          var cost = res[i].price * parseInt(howMany);
          console.log("The total of your current purchase is $" + cost + ". Thank you for shopping at Bamazon.");
          again();
        }
    });
}

function again() {
inquirer
    .prompt({
        name: "again",
        type: "checkbox",
        message: "Would you like to continue shopping?",
        choices: ["YES!", "HECK NO!"]
    })
    .then(function(answer) {
        if (answer.again[0] == "YES!") {
            initialize();
        }else if(answer.again[0] == "HECK NO!") {
            console.log("Have a great day! :)");
            connection.end();
        }
    });
}