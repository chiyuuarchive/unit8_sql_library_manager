// Import express module
const express = require('express');
const router = express.Router();

// Implicitly declare the operator
const { Op } = require("sequelize");

// Import the book model
const { Book } = require("../models");

// The library holds 10 books per page
const booksPerPage = 10;

// Async handler
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      res.redirect("/page-not-found")
    }
  }
}

/* GET Home route */
router.get("/", (req, res) => {
  res.redirect("/books");
})

/* GET Books route. */
router.get("/books", asyncHandler(async (req, res, next) => {
  // Declare initial viewing page
  let page = 0;
  // Retrieve the page query parameter
  let currentPage = parseInt(req.query.page);

  if (Number.isInteger(currentPage) && currentPage !== page) {
    page = currentPage;
  }

  // Retrieve all books from the database (consider pagination!)
  const books = await Book.findAndCountAll({
    limit: booksPerPage,
    offset: page*booksPerPage
  });

  // The total number of books in the database
  const { count } = books;
  // The array of book objects to be displayed
  const booksArray = books.rows.map(book => book.toJSON());
  // Calculate number of pages
  const pageNumbers = Math.ceil(count/booksPerPage);

  if (books) {
    res.render("index", {booksArray, pageNumbers});
  }
  else {
    res.redirect("/page-not-found");
  }
}));

/* GET Search Book route */
router.get("/books/search", asyncHandler(async (req, res) => {
  // Declare initial viewing page
  let page = 0;
  // Retrieve the page query parameter
  let currentPage = parseInt(req.query.page);
  
  if (Number.isInteger(currentPage) && currentPage !== page) {
    page = currentPage;
  }

  // Retrieve the query parameters assigned to "search"
  let search = req.query.search;

  // SELECT * FROM Book WHERE title LIKE `%${search}%` OR author LIKE `%${search}%`... (and so on).
  const books = await Book.findAndCountAll({
    limit: booksPerPage,
    offset: page*booksPerPage,
    where: {
      [Op.or]: {
        title: {
          [Op.substring]: `%${search}%`
        },
        author: {
          [Op.like]: `%${search}%`
        },
        genre: {
          [Op.like]: `%${search}%`
        },
        year: {
          [Op.like]: `%${search}%`
        }
      } 
    }
  });

  // The total number of books in the database
  const { count } = books;
  // The array of book objects to be displayed
  const booksArray = books.rows.map(book => book.toJSON());
  // Calculate number of pages
  const pageNumbers = Math.ceil(count/booksPerPage);

  if(books) {
    res.render("index", { booksArray, pageNumbers, search}); 
  }
  else {
    res.redirect("/page-not-found");
  }
}));

/* GET New Book Form route */
router.get("/books/new", (req, res) =>{
  res.render("new-book", {book: {}});
});

/* POST New Book Form route */
router.post("/books/new", asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/books");
  }
  catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("new-book", {book, errors: error.errors})
    }
    else {
      throw error;
    }
  }
}));

/* GET Custom 500 Error route */
router.get("/books/noroute", (req, res, next) => {
  res.redirect("/noroute");
});

/* GET Custom 500 Error route */
router.get("/noroute", (req, res, next) => {
  const err = new Error();
  err.message = "Custom Error"
  err.status = 500;
  next(err);
});

/* GET Custom "404 Page Not Found" page. */
router.get("/page-not-found", (req, res, next) => {
  const err = new Error();
  err.message = "Page Not Found";
  err.status = 404;
  next(err);
});

/* POST Delete Book route */
router.post("/books/:id/delete", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy()
    res.redirect("/books");
  }
  else {
    res.redirect("/page-not-found");
  }
}))

/* GET Book Detail Update Form route */
router.get("/books/:id", asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render("update-book", {book})
  }
  else {
    res.redirect("/page-not-found");
  }
}))

/* POST Book Detail Update Form route */
router.post("/books/:id", asyncHandler(async (req, res) => {
  let book;
  try {
    let book = await Book.findByPk(req.params.id);
    await book.update(req.body);
    res.redirect("/books");
  }
  catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render("update-book", {book, errors: error.errors})
    }
    else {
      throw error;
    }
  }
}));

module.exports = router;