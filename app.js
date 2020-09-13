function Hash() {
    this.length = 0;
    this.items = new Array();
    this.keys = new Array();
    for (var i = 0, argsL = arguments.length; i < argsL; i += 2) {
        if (typeof (arguments[i + 1]) != 'undefined') {
            this.items[arguments[i]] = arguments[i + 1];
            this.keys.push(arguments[i]);
            this.length++;
        }
    }

    this.removeItem = function(in_key) {
        var tmp_previous;
        if (typeof (this.items[in_key]) != 'undefined') {
            this.length--;
            var tmp_previous = this.items[in_key];
            delete this.items[in_key];
            var keyIndex = this.hasKey(in_key);
            if (keyIndex != undefined)
                this.keys.splice(keyIndex, 1);
        }
        return tmp_previous;
    }

    this.getItem = function(in_key) {
        return this.items[in_key];
    }

    this.setItem = function(in_key, in_value) {
        var tmp_previous;
        if (typeof (in_value) != 'undefined') {
            if (typeof (this.items[in_key]) == 'undefined')
                this.length++;
            else
                tmp_previous = this.items[in_key];

            this.items[in_key] = in_value;
            if (this.hasKey(in_key) == undefined) {
                this.keys.push(in_key);
            }
        }

        return tmp_previous;
    }

    this.hasItem = function(in_key) {
        return typeof (this.items[in_key]) != 'undefined';
    }

    this.hasKey = function(keyValue) {
        for (var ki = 0, keysL = this.keys.length; ki < keysL; ki++) {
            if (this.keys[ki] == keyValue) {
                return ki;
            }
        }
        return undefined;
    }

    this.clear = function() {
        this.keys.splice(0, this.keys.length);
        this.items.splice(0, this.items.length);

        this.length = 0;
    }
} 
var mset=new Set();
var mobileHash=new Hash();

var itemsToFind = [];
const express = require( "express" );
const bodyparser = require("body-parser");
const Grid = require("gridfs-stream"); 
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const mongoose = require("mongoose");
const fileUpload = require('express-fileupload') 
const nodemailer = require('nodemailer');
const mongodb = require('mongodb')
const flash = require('req-flash')
const ejs = require("ejs")
const binary = mongodb.Binary

// const async = require('async');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto')

//Hash set code moved to hash.txt
Grid.mongo = mongoose.mongo;

var transporter = nodemailer.createTransport({
 service: 'gmail',
 auth: {
        user: 'openlab31@gmail.com',			//email ID
	    pass: 'Chandu313'				//Password 
    }
});

function sendMail(email , otp){
	var details = {
	from: 'openlab31@gmail.com', // sender address same as above
	to: email, 					// Receiver's email id
	subject: 'Your demo OTP is ', // Subject of the mail.
	html: otp					// Sending OTP 
	};
	transporter.sendMail(details, function (error, data) {
	if(error)
	console.log(error+" hioi")
	else
	console.log(data);
	});
	}
	
	// var email = "lakshmanlucky024@gmail.com";
	// var otp = "123456";

	//sendMail(email,otp);


const app = express();
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set("view engine", "ejs");

//passport must be placed here only
app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());
app.use(flash());

mongoose.connect("mongodb://localhost/paytm",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.set("useCreateIndex",true);

var use={};
var uid;
var ucard=[];
var price=0;
var username="";
var ph=0;
var address;
var password="";
var flag=0;
var ab=3;
var fname="";
var lname="";

const itemSchema = new mongoose.Schema({
    name:String,
    price:String,
    instock:Boolean,
    description:String,
    img:String,
    quantity:Number
});

const Item = new mongoose.model("Item",itemSchema);

var cardSchema = new mongoose.Schema({
	cardNumber: Number,
	Expiry: String,
	cvv:Number
})

const movieSchema = new mongoose.Schema({  
	name:String,
	img:String,
	theatres:[{
		name:String,
		ticket:Number,
		seats:[String]
	}]
})


const userSchema = new mongoose.Schema({
	username: {type:String,unique:true,required:true},
	name: {type:String,unique:true,required:true},
	ph_no: Number,
	dob:String,
	password: String,
	mobilebill: [{
		
		phone: Number,
		amount: Number
	}],
	mobileBillDue: {
		type:Boolean,
		default:true
	},
	address: String,
	balance: Number,
	card: [cardSchema],
	itemids:[{
        itemId:mongoose.Schema.Types.ObjectId,
        quantity:Number
	}],
	documents:[{
		filename:String,
		file:Buffer
	}],
	preferences: [],
	resetPasswordToken:String,
	resetPasswordExpires:Date
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);



let billSet = new Set();
var Card = new mongoose.model("card", cardSchema);
var User = new mongoose.model("user", userSchema);
var Movie = new mongoose.model("movie",movieSchema);

passport.use(User.createStrategy());
passport.serializeUser((user,done)=>{
	done(null,user.id);
})
passport.deserializeUser((id,done) => {
	User.findById(id,(error,user)=>{
		done(error,user);
	});
});

//Item list declaration
app.get('/movielist',(req, res)=>{
	Movie.find({},(err,ml)=>{
		if(err) console.log(JSON.stringify(err));
		else{
			console.log(ml);
			res.render('movielist',{movies:ml});
		}
	});
})

app.get('/mobileRecharge',(req, res)=>{
	res.render('mobilerecharge')
})

app.get('/',(req, res)=>{
	res.render('login',{flag:flag})
})
app.get('/home',(req, res)=>{
	res.render('index')
})
app.get("/signup",(req, res)=>{
	res.render("signup");
});

app.get("/menupage",(req, res)=>{
	res.render("profilecard");
});

app.get("/movie",(req, res)=>{
	// Theatre.findOne({movies:[{name:"Game of Thrones"}]},(err, foundTheatre)=>{
	// 	if(err) console.log(JSON.stringify(err));
	// 	else{
	// 		console.log(foundTheatre);
	// 		res.render("movie");
	// 	}
	// });
	res.render("movie",{list:list});
})

// if(req.isAuthenticated()){
// 	console.log(ab+" balance")
	
// }else{
// 	res.redirect("/");
// }

var originalOTP=0;
var sotp=" ";

app.get("/otp",(req, res)=>{
	originalOTP=Math.floor(Math.random()*1000000);
	sotp=originalOTP.toString();
	sendMail(username,sotp);
	res.render("otp");
});

app.get("/wallet",(req, res)=>{
	res.render("wallet",{ab:ab});
});

app.post("/otpcheck",(req, res)=>{
	var newotp=req.body.otp;
	console.log(newotp+" "+sotp);
	if(newotp.localeCompare(sotp)===0)
	{
		res.redirect("/home");
	}else{
		res.redirect("/otp");
	}
});

const movieName="";



app.post("/tomovies",(req, res)=>{
	const movieName=req.body.movieName;
	Movie.findOne({name:movieName},(err,foundTheatres)=>{
		if(err) console.log(JSON.stringify(err));
		else{
		  res.render("theatrelist",{movieName:movieName,theatres:foundTheatres.theatres});	
		}
	});
});

app.post("/cartbill",(req, res)=>{
	var gbill=req.body.cbill;
	User.find({username:username},(err, foundUser)=>{
		if(err) console.log(JSON.stringify(err));
		else{
			foundUser = foundUser[0];
			if (foundUser.balance >= gbill ){
				foundUser.balance = foundUser.balance - gbill;
				ab = foundUser.balance;
				foundUser.save((err)=>{
				if(err) console.log(JSON.stringify(err));
				//req.flash("Mobile bill has been paid.");
				res.render("placed");
			});
		}else{
			let diff = gbill - ab;
			console.log(diff+" hii "+gbill+" "+ab);
			res.render("cards",{savedCards:ucard,price:diff});
		}
		}
	
	})
});

app.post("/book",(req, res)=>{
	const movieName=req.body.movieName;
	const theatreName=req.body.theatreName;
	//const listString = ["A1","A3"].join("-");
	var seats = [];
	var cost = 0;
	Movie.findOne({name:movieName},(err,foundTheatres)=>{
		if(err) console.log(JSON.stringify(err));
		else{
			foundTheatres.theatres.forEach( theatre=>{
				if(theatre.name.localeCompare(theatreName)===0){
					seats = theatre.seats;
					cost = theatre.ticket;
				}
			})
		res.render("movie",{movieName:movieName,theatreName:theatreName,list:seats,cost:cost});
	    }
	});
	console.log(movieName+" "+theatreName);
});
	

app.post("/moviebill",(req, res)=>{
	const movieName = req.body.movieName;
	const theatreName = req.body.theatreName;
	var seatList = req.body.seatList;
	var cost=req.body.cost;
	var s = req.body.seatList.split("-");
	var bill=cost*s.length;
	res.render("moviebill",{movieName:movieName,theatreName:theatreName,seatList:seatList,cost:cost,bill:bill})
});



app.post("/moviebooking",(req, res)=>{
	console.log("heee");
    const movieName = req.body.movieName;
	const theatreName = req.body.theatreName;
	var seats = req.body.seatList.split("-");
	var gbill=req.body.cost*seats.length;
	var promo=req.body.promocode;
	if(promo.localeCompare("MOVIE25")===0)
	{
		gbill=gbill-(gbill*25)/100;
		gbill=Math.floor(gbill);
	}else if(promo.localeCompare("MOVIE150")===0){
		gbill=gbill-150;
	}
	console.log(gbill+" idig");
	User.find({username:username},(err, foundUser)=>{
		if(err) console.log(JSON.stringify(err));
		else{
			foundUser = foundUser[0];
			if (foundUser.balance >= gbill ){
				foundUser.balance = foundUser.balance - gbill;
				ab = foundUser.balance;
				foundUser.save((err)=>{
				if(err) console.log(JSON.stringify(err));
				//req.flash("Mobile bill has been paid.");
				Movie.findOne({name:movieName},(err,found)=>{
					if(err) console.log(JSON.stringify(err));
					else{
						found.theatres.forEach( theatre=>{
							if (theatre.name.localeCompare(theatreName)===0){
							theatre.seats.push(...seats);
							}
							});
							found.save(()=>{
							res.render("booked",{seats:seats,movieName:movieName,theatreName:theatreName,gbill:gbill})	
							// console.log("Your seats have been booked.");
							// res.redirect("/home");
						});
					}
				});
			});
		}else{
			let diff = gbill - ab;
			res.render("cards",{savedCards:ucard,price:diff});
		}
		}
	})
	console.log(movieName+" "+theatreName+" "+seats+" hoo");
	
});


app.post("/payment",(req, res)=>{
	const cvv=req.body.cvv;
	const price=req.body.price;
	console.log("cvv is "+cvv);
	res.render("payment",{cvv:cvv,price:price});
});

//req.user.username
app.post("/gateway",(req, res)=>{
	const cvv=req.body.cvv;
	const price=req.body.price;
	const x=req.body.x;

	if(x==cvv*10)
	{
		console.log(price);
		User.findOne({username:username},(err, resultList)=>{
			if(err){
				console.log(JSON.stringify(err));
			}else{
				resultList.balance=parseInt(resultList.balance,10)+parseInt(price,10);
				ab=resultList.balance;
				resultList.save();
				console.log(resultList);
			}
		})
		res.redirect("/wallet");
	}
	else
	console.log(cvv+" Invalid "+x);
});


// if(req.isAuthenticated()){
		
// }else{
// 	res.redirect("/");
// }

// app.get("/cards",(req, res)=>{
// 	//console.log(req.user.username);
	
	
// });

// if(req.isAuthenticated()){
			
// }else{
// 	res.redirect("/");
// }
app.post("/money",(req, res)=>{
	price=req.body.price;
	console.log(price);
	res.render("cards",{savedCards:ucard,price:price});
	//res.redirect("/cards");
});

app.post("/creditcard",(req, res)=>{
	// User.find({_id:uid},(err, fi)=>{
    //     if(err){
    //         console.log(JSON.stringify(err));
    //     }else{
	// 		console.log(fi[0]);
	// 		ucard=fi[0].card;
	// 		uid=fi[0]._id;
	// 		console.log(ucard);
    //         res.render("wallet");
    //     }
	// });
	var axis = {
		cardNumber: req.body.ccardNumber,
		Expiry: req.body.cExpiry,
		cvv:req.body.CCVV
	};
	ucard.push(axis);
	console.log(ucard+"ucard  axis"+axis);
	User.findOne({username:username},(err, resultList)=>{
        if(err){
            console.log(JSON.stringify(err));
        }else{
            resultList.card.push(axis);
            resultList.save();
        }
    })
	res.render("cards",{savedCards:ucard,price:price});
});

// if(req.isAuthenticated()){
		
// }else{
// 	res.redirect("/");
// }

app.get("/addmoney",(req, res)=>{
	res.render("addmoney",{ab:ab});
});

// const user = new User({
// 	username:req.body.username,
// 	password:req.body.password,
// })
// req.login(user,(err)=>{
// 	if(err){
// 		console.log(JSON.stringify(err));
// 	}else{
// 		// console.log(user);
// 		// flag=0;
// 		// ucard=user.card;
// 		// uid=user._id;
// 		// ab=user.balance;
// 		// console.log(user.balance+" balance")
// 		// use=user;
// 		passport.authenticate("local")(req, res, (err)=>{
// 			// flag=0;
// 			// ucard=user.card;
// 			// uid=user._id;
// 			// ab=user.balance;
// 			// console.log(user.balance+" balance")
// 			// use=user;
// 			res.redirect("/wallet")
// 		});
// 	}
// });
			
app.post("/auth", function(req,res){
	
	console.log("hi")
	User.find({username:req.body.username,password:req.body.password},(err, fi)=>{
	if(err){
	alert("Invalid Password");
		}
		else if(fi.length==0)
		{
			flag=1;
			console.log(fi)
			res.redirect("/");
		}
		else{
			flag=0;
			console.log(fi[0]);
			username=fi[0].username,
			password=fi[0].password,
			ucard=fi[0].card;
			uid=fi[0]._id;
			ab=fi[0].balance;
			use=fi[0];
			console.log(ucard+" hii");
	        res.redirect("wallet");
	}
	});
});


app.get("/logout",(req,res) => {
	req.logout();
	res.redirect("/");
});

app.post("/upload", (req, res) => {
	let file = { name: req.body.name, file: binary(req.files.uploadedFile.data) }
	User.findOne({_id:uid},(err, foundUser)=>{
        if(err){
            console.log(JSON.stringify(err));
        }else{
			console.log("This is a file : ",file);
			
			foundUser.documents.push(file);
			foundUser.save();
			res.redirect("/wallet");
        }
    })
})

// BUG
app.post("/edituser", (req, res) => {
	User.findOne({username:req.user.username},(err, foundUser)=>{
        if(err){
            console.log(JSON.stringify(err));
        }else{
			foundUser.name=req.body.username;
			foundUser.dob=String(req.body.dob);
			foundUser.ph_no=req.body.ph;
			foundUser.address=req.body.address;
			foundUser.save(()=>{
				use=foundUser;
				console.log(foundUser);
				res.redirect("/profile");
			});
        }
    })
})
// email=req.body.email
// username=req.body.username
// password=req.body.password
// address=req.body.address
// ph=req.body.contact
// User.register({username:req.body.username},req.body.password,(err)=>{
// 	if(err){
// 		console.log(JSON.stringify(err));
// 		res.redirect("/signup");
// 	}
// 	else{
		
// 		passport.authenticate("local")(req, res,()=>{
// 			res.redirect("/");
// 		});
// 	}
// })

	app.post("/auth2", function(req,res){
		username=req.body.email;
		const user = new User({
			username: req.body.email,
			name: req.body.fname+req.body.lname,
			ph_no: req.body.contact,
			password: req.body.password,
			address: req.body.address,
			balance: 0,
			documents: [],
			preferences: []
		});
		user.save((err,result)=>{
			if(err)
			{
				console.log("something went wrong");
			}else
			{
				console.log(result.username+" hi")
				console.log(result+" emo mari ")
			}
			res.redirect("/otp");
		})
	})
		
		
//Shopping Cart
app.get("/shop",(req, res)=>{
    Item.find({},(err, foundItems)=>{
        if(err){
            console.log(JSON.stringify(err));
        }else{
            res.render("shop",{items:foundItems});
        }
    }).limit(8);
});

app.get("/shoppingCart",(req, res)=>{
    res.render("shoppingcart");
});

//checkout
app.get("/checkout",(req, res)=>{
    res.render("checkout.ejs");
});
//categories
app.get("/categories",(req, res)=>{
    Item.find({},(err, foundItems)=>{
        if(err){
            console.log(JSON.stringify(err));
        }else{
            res.render("categories.ejs",{items:foundItems});
        }
    })
});

//cart
app.get("/cart",(req, res)=>{
	var itemDict = {};
	var finalList = [];
	itemsToFind.forEach( item =>{
		itemDict[item.itemId] = item.quantity;
	});
	Item.find({_id:{$in:Object.keys(itemDict)}},(err, foundItems)=>{
		
		foundItems.forEach( item =>{
			item.quantity = itemDict[item._id];
			finalList.push(item);
		});
		res.render("cart",{items:finalList});
	});
});
//product
app.get("/product/:id",(req, res)=>{
    var relatedItems=[];
    Item.find({},(err, relitems)=>{
        if(err){console.log(JSON.stringify(err));}
        else{
            relatedItems = relitems;
        }
    }).limit(4);
    Item.find({_id:req.params.id},(err, fi)=>{
        if(err){
            console.log(JSON.stringify(err));
        }else{
            console.log(fi);
            res.render("product",{item:fi[0],ritems:relatedItems});
        }
    });
});
//payment
app.get("/paymentCart",(req, res)=>{
    res.render("paymentCart");
});
//contact
app.get("/contact",(req, res)=>{
    res.render("contact");
});

app.get("/recharge",(req, res)=>{
    res.render("mobileRecharge");
});

app.get("/front",(req, res)=>{
    res.render("front");
});

app.get("/profile",(req, res)=>{
    res.render("profilecard",{use:use});
});



app.post("/rechargemobile",(req, res)=>{
    var mobile=req.body.mobilenumber;
	console.log("agadu");
	console.log("ledu");
	if(!mset.has(mobile))
	{
		var bill=mobile%2000;
		res.render("mobilebill",{bill:bill,mobile:mobile});
	}else{
		console.log("There are no over dues");
		res.redirect("/home")
	}
	
});

// if(mobileHash.hasKey(mobile)){
// 		if(!billSet.has(mobile))
// 			res.render("mobilebill",{bill:mobileHash.getItem(mobile),mobile:mobile});
// 		else
// 			console.log("There are no overdues");
// 	}else{
// 		console.log("ledu");
// 		var bill=Math.floor(Math.random()*2000);
// 		mobileHash.setItem(mobile,bill);
// 		res.render("mobilebill",{bill:bill,mobile:mobile})
// }

app.post("/paybill",(req, res)=>{
    var gbill=req.body.bill;
	var promo=req.body.promocode;
	console.log(gbill+" "+promo);
	if(promo.localeCompare("GRABON20")===0)
	{
		gbill=gbill-(gbill*20)/100;
		gbill=Math.floor(gbill);
	}else if(promo.localeCompare("GRABON100")===0){
		gbill=gbill-100;
	}
	var mobile=req.body.mnumber;
	User.find({username:username},(err, foundUser)=>{
		if(err) console.log(JSON.stringify(err));
		else{
			foundUser = foundUser[0];
			if (foundUser.balance >= gbill ){
				foundUser.balance = foundUser.balance - gbill;
				ab = foundUser.balance;
				const bill = {
					mobile: foundUser.ph_no,
					amount: gbill
				};
				mset.add(mobile);
				foundUser.mobilebill.push(bill);
				foundUser.mobileBillDue = false;
				foundUser.save((err)=>{
				if(err) console.log(JSON.stringify(err));
				//req.flash("Mobile bill has been paid.");
				console.log("Successfully paid your bill");
				res.render("paidbill",{gbill:gbill});
			});
		}else{
			let diff = gbill - ab;
			console.log(diff+" hii "+gbill+" "+ab);
			
			res.render("cards",{savedCards:ucard,price:diff});
		}
		}
	})
	// if(ab>=gbill)
	// {
	// 	ab=ab-gbill;
	// 	billSet.add(mobile);
	// 	console.log("Successfully paid your bill");
	// 	res.redirect("/home");
	// }else{
	// 	var diff=gbill-ab;
	// 	res.render("cards",{savedCards:ucard,price:diff});
	// }
})


//     POST REQUESTS
app.post("/paymentPortal",(req, res)=>{
    console.log(req.body.n1);
    console.log("Working");
});

app.post("/addToCart",(req, res)=>{
	
	var flag = 0;
	
	itemsToFind.forEach( item => {
		if(item.itemId.toString()===req.body.objid){
			item.quantity += parseInt(req.body.item_quantity);
			flag = 1;
		}
	});
	if(flag===0){
		itemsToFind.push({
		itemId:mongoose.Types.ObjectId(req.body.objid),
		quantity:parseInt(req.body.item_quantity)
	});
	}
    res.redirect("/cart");
});

app.listen(7000, function(){
	console.log("Payment has initialised");
});

//Reset Password
app.get("/forgot",(req, res)=>{
	res.render("forgot");
});
