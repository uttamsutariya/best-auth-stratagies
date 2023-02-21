require("dotenv").config();
const path = require("node:path");
const express = require("express");
const helmet = require("helmet");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");

const PORT = 3000;

const app = express();

const config = {
	CLIENT_ID: process.env.CLIENT_ID,
	CLIENT_SECRET: process.env.CLIENT_SECRET,
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

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));
app.use(helmet());
app.use(passport.initialize());

function checkLoggedIn(req, res, next) {
	const isLoggedIn = true;
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
		session: false,
	}),
	(req, res) => {
		console.log("google called us back");
	}
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
