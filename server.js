if(process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

//Importing Libraries
const express = require("express")
const app = express() 
const bcrypt = require("bcrypt")
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )

const users = []

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false, //Wont resave the session variable if nothing is changed
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/home-page",
    failureRedirect: "/login",
    failureFlash: true
}))

// Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        const hassedpassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hassedpassword
        })
        console.log(users); //displaying new users
        res.redirect("/login")
    }
    catch (e) {
        console.log(e);
        res.redirect("/register")
    }
})

// Routes
app.get('/home-page', checkAuthenticated, (req, res) => {
    res.render("index.ejs", {name: req.user.name})
})

app.get("/login", checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get("/register", checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})
// End Routes

app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/login")
    })
    
})

function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return res.redirect("/home-page")
    }
    next()
}

app.listen(3000)  