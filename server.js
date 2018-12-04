const express = require("express");

const morgan = require('morgan');

const app = express();
app.use(morgan("common"));
app.use(express.json()); //to parse body


const blogPostRouter = require('./blogPostRouter'); //closed it in curly


app.use('/blog-posts', blogPostRouter);

app.listen(process.env.PORT || 8080, () => {
    console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
})
    
