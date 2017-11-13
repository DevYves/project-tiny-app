## Project Tiny App

Tiny App is a full stack web application built with and utilizing Node and Express. The application allows users to
transform URLS into shorter more accesible URLS for use on venues where space is at a premium, such as Twitter.


## Final Product

!["Screenshot of the urls page"](https://github.com/DevYves/project-tiny-app/blob/master/docs/TIny_App_URL_List.png)
!["Screenshot of the Registraion page"](https://github.com/DevYves/project-tiny-app/blob/master/docs/Tiny_App_Registration.png)

## Dependencies
- bcrypt
- body-parser
- cookie-session
- EJS
- Express
- Node.js

## Getting Started
- Clone project into working directory using `git clone git@github.com:DevYves/project-tiny-app.git`
- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express.server.js` command.
- visit localhost:8080/ in your browser to view app

## Features and Functionality

The server features encrypted registration and cookies using Bcrypt and Cookie Sessions allowing users to create and store a database of shortened
links. There is a

After registering an account, users can create short urls that will be associated with their account. These urls can be shared anywhere.

Client-side session management (implemented using cookie-sessions) makes the application stateful without compromising security. Bcrypt is used for password encryption to ensure the protection of user information.