# Collabomate

An easy to use collaboration platform to encourage coders of every level to start contributing to other coders projects or get help with one of their own.

## Usage

Enter the following command to start the dev app:

```bash 
$ npm run gulp
```

This will start browsersync in a new window with nodemon to restart the server node-sass to compile the scss.

## Project structure

```
.
├── README.md
├── app.js
├── bin
│   └── www
├── config
│   └── passport.js
├── gulpfile.js
├── models
│   └── User.js
├── package.json
├── public
│   ├── css
│   │   └── main.css
│   ├── images
│   ├── js
│   │   └── main.js
│   └── sass
│       ├── _layout.scss
│       ├── _profile.scss
│       ├── _projects.scss
│       ├── _readme.scss
│       ├── _typography.scss
│       ├── flexboxgrid.scss
│       ├── main.scss
│       └── normalize.scss
├── routes
│   ├── api.js
│   ├── index.js
│   └── users.js
└── views
    ├── error.pug
    ├── home.pug
    ├── layout.pug
    ├── partials
    │   └── header.pug
    ├── profile.pug
    └── signup.pug


