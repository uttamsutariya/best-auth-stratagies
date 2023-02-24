require("dotenv").config();
const path = require("node:path");
const express = require("express");
const helmet = require("helmet");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const cookieSession = require("cookie-session");

const PORT = 3000;

const app = express();

const config = {
	CLIENT_ID: process.env.CLIENT_ID,
	CLIENT_SECRET: process.env.CLIENT_SECRET,
	COOKIE_KEY1: process.env.COOKIE_KEY1,
	COOKIE_KEY2: process.env.COOKIE_KEY2,
};

const AUTH_OPTIONS = {
	callbackURL: "/auth/google/callback",
	clientID: config.CLIENT_ID,
	clientSecret: config.CLIENT_SECRET,
};

function verifyCallback(accessToken, refreshToken, profile, next) {
	console.log("access token", accessToken);
	console.log("google profile", profile);
	next(null, profile);
}

// save session to the cookie
passport.serializeUser((user, done) => {
	done(null, user);
});

// read the session from the cookie
passport.deserializeUser((obj, done) => {
	done(null, obj);
});

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));
app.use(helmet());
app.use(
	cookieSession({
		name: "session",
		maxAge: 24 * 60 * 60 * 1000,
		keys: [config.COOKIE_KEY1, config.COOKIE_KEY2],
	})
);
app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIn(req, res, next) {
	// req.user
	const isLoggedIn = true; // todo
	if (!isLoggedIn) {
		return res.status(401).json({
			error: "You are not logged in",
		});
	}
	return next();
}

app.get(
	"/auth/google",
	passport.authenticate("google", {
		scope: ["email"],
	})
);

app.get(
	"/auth/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/failure",
		successRedirect: "/",
	})
);

app.get("/auth/logout", (req, res) => {});

app.get("/secret", checkLoggedIn, (req, res) => {
	res.send("secret route");
});

app.get("/failure", (req, res) => {
	res.send("failed to login");
});

app.get("/*", (req, res) => {
	res.sendFile(path.join(__dirname, "./public/index.html"));
});

app.listen(PORT, () => console.log(`app listening on port ${PORT}...`));
