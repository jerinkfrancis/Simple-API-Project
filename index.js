const express = require("express");
var bodyParser = require("body-parser");

// Database

const database = require("./database");

// Intialise Express

const booky = express();

booky.use(bodyParser.urlencoded({extended: true}));
booky.use(bodyParser.json());


/*
Route            /
Description      Get all the books
Access           PUBLIC
Parameter        NONE
Methods          GET
*/

booky.get("/",(req,res) => {
    return res.json({books: database.books});
});

/*
Route            /is
Description      Get specific book on ISBN
Access           PUBLIC
Parameter        isbn
Methods          GET
*/

booky.get("/is/:isbn",(req,res) => {

    const getSpecificBook = database.books.filter((book) => book.ISBN === req.params.isbn);
    
      if(getSpecificBook.length === 0) {
        return res.json({error: `No book found for the ISBN of ${req.params.isbn}`});
      }
    
      return res.json({book: getSpecificBook});
    });

/*
Route            /c
Description      Get specific book on category
Access           PUBLIC
Parameter        category
Methods          GET
*/

booky.get("/c/:category",(req,res) => {
    const getSpecificBook = database.books.filter((book) => book.category.includes(req.params.category))   
  
      if(getSpecificBook.length === 0) {
        return res.json({error: `No book found for the category of ${req.params.category}`});
      }
  
      return res.json({book: getSpecificBook});
  });

/*
Route            /lang
Description      Get books based on language
Access           PUBLIC
Parameter        language
Methods          GET
*/

booky.get("/lang/:language",(req,res) => {
    const getBooksByLanguage = database.books.filter((book) => book.language === req.params.language);
  
    if(getBooksByLanguage.length === 0) {
      return res.json({error: `No books found for the language ${req.params.language}`});
    }
  
    return res.json({books: getBooksByLanguage});
});


/*
Route            /author
Description      Get all authors
Access           PUBLIC
Parameter        NONE
Methods          GET
*/
  
booky.get("/author",(req,res) => {
    return res.json({authors: database.author});
  });

/*
Route            /author/:id
Description      Get specific author based on ID
Access           PUBLIC
Parameter        id (Author ID)
Methods          GET
*/

booky.get("/author/:id",(req,res) => {
    const authorId = req.params.id;
    const getSpecificAuthor = database.author.find((author) => author.id === authorId);
  
    if(!getSpecificAuthor) {
      return res.json({error: `No author found for the ID ${authorId}`});
    }
  
    return res.json({author: getSpecificAuthor});
});


/*
Route            /author/book
Description      Get all authors based on books
Access           PUBLIC
Parameter        isbn
Methods          GET
*/

booky.get("/author/book/:isbn", (req,res) => {
    const getSpecificAuthor = database.author.filter(
      (author) => author.books.includes(req.params.isbn)
    );
  
    if(getSpecificAuthor.length === 0){
      return res.json({
        error: `No author found for the book of ${req.params.isbn}`
      });
    }
    return res.json({authors: getSpecificAuthor});
  });


/*
Route            /publications
Description      Get all publications
Access           PUBLIC
Parameter        NONE
Methods          GET
*/

booky.get("/publications",(req,res) => {
    return res.json({publications: database.publication});
  })
  
  /*
Route            /publication/:id
Description      Get specific publication based on ID
Access           PUBLIC
Parameter        id (Publication ID)
Methods          GET
*/

booky.get("/publication/:id", (req, res) => {
    const publicationId = req.params.id;
    const getSpecificPublication = database.publication.find((publication) => publication.id === publicationId);
  
    if (!getSpecificPublication) {
      return res.json({ error: `No publication found for the ID ${publicationId}` });
    }
  
    return res.json({ publication: getSpecificPublication });
});

/*
Route            /publications/book/:isbn
Description      Get publications based on book's ISBN
Access           PUBLIC
Parameter        isbn (Book's ISBN)
Methods          GET
*/

booky.get("/publications/book/:isbn", (req, res) => {
    const { isbn } = req.params;
    const getPublications = database.publications.filter((publication) => publication.books.includes(isbn));
  
    if (getPublications.length === 0) {
      return res.json({ error: `No publications found for the book with ISBN ${isbn}` });
    }
  
    return res.json({ publications: getPublications });
});

//POST

/*
Route            /book/new
Description      Add new books
Access           PUBLIC
Parameter        NONE
Methods          POST
*/

booky.post("/book/new",async (req,res) => {
    const newBook = req.body;
    database.books.push(newBook);
    return res.json({updatedBooks: database.books});
  });

  /*
Route            /author/new
Description      Add new authors
Access           PUBLIC
Parameter        NONE
Methods          POST
*/

booky.post("/author/new",async (req,res) => {
    const newAuthor = req.body;
    database.author.push(newAuthor);
      return res.json(database.author);
    });

/*
Route            /publication/new
Description      Add new publications
Access           PUBLIC
Parameter        NONE
Methods          POST
*/

booky.post("/publication/new", (req,res) => {
    const newPublication = req.body;
    database.publication.push(newPublication);
    return res.json(database.publication);
  });


  /*
Route            /publication/update/book
Description      Update /add new publication
Access           PUBLIC
Parameter        isbn
Methods          PUT
*/

booky.put("/publication/update/book/:isbn", (req,res) => {
    //Update the publication database
    database.publication.forEach((pub) => {
      if(pub.id === req.body.pubId) {
        return pub.books.push(req.params.isbn);
      }
    });
  
    //Update the book database
    database.books.forEach((book) => {
      if(book.ISBN === req.params.isbn) {
        book.publications = req.body.pubId;
        return;
      }
    });
  
    return res.json(
      {
        books: database.books,
        publications: database.publication,
        message: "Successfully updated publications"
      }
    );
  });

  /****DELETE*****/
/*
Route            /book/delete
Description      Delete a book
Access           PUBLIC
Parameter        isbn
Methods          DELETE
*/

booky.delete("/book/delete/:isbn", async (req,res) => {
    //Whichever book that doesnot match with the isbn , just send it to an updatedBookDatabase array
    //and rest will be filtered out
  
    const updatedBookDatabase = database.books.filter((book) => book.ISBN !== req.params.isbn)

    database.books = updatedBookDatabase;

    return res.json({books: database.books});
  });

/*
Route            /book/delete/author
Description      Delete an author from a book and vice versa
Access           PUBLIC
Parameter        isbn, authorId
Methods          DELETE
*/

booky.delete("/book/delete/author/:isbn/:authorId", (req,res) => {
    //Update the book database
     database.books.forEach((book)=>{
       if(book.ISBN === req.params.isbn) {
         const newAuthorList = book.author.filter(
           (eachAuthor) => eachAuthor !== parseInt(req.params.authorId)
         );
         book.author = newAuthorList;
         return;
       }
     });
  
  
    //Update the author database
    database.author.forEach((eachAuthor) => {
      if(eachAuthor.id === parseInt(req.params.authorId)) {
        const newBookList = eachAuthor.books.filter(
          (book) => book !== req.params.isbn
        );
        eachAuthor.books = newBookList;
        return;
      }
    });
  
    return res.json({
      book: database.books,
      author: database.author,
      message: "Author was deleted!!!!"
    });
  });


  /*
Route            /book/delete/author
Description      Delete an author from a book and vice versa
Access           PUBLIC
Parameter        isbn, authorId
Methods          DELETE
*/

booky.delete("/book/delete/author/:isbn/:authorId", (req,res) => {
    //Update the book database
     database.books.forEach((book)=>{
       if(book.ISBN === req.params.isbn) {
         const newAuthorList = book.author.filter(
           (eachAuthor) => eachAuthor !== parseInt(req.params.authorId)
         );
         book.author = newAuthorList;
         return;
       }
     });
  
  
    //Update the author database
    database.author.forEach((eachAuthor) => {
      if(eachAuthor.id === parseInt(req.params.authorId)) {
        const newBookList = eachAuthor.books.filter(
          (book) => book !== req.params.isbn
        );
        eachAuthor.books = newBookList;
        return;
      }
    });
  
    return res.json({
      book: database.books,
      author: database.author,
      message: "Author was deleted!!!!"
    });
  });

  /*
Route            /book/delete/author
Description      Delete an author from a book and vice versa
Access           PUBLIC
Parameter        isbn, authorId
Methods          DELETE
*/

booky.delete("/book/delete/author/:isbn/:authorId", (req, res) => {
    const { isbn, authorId } = req.params;

    // Update the book database
    database.books.forEach((book) => {
        if (book.ISBN === isbn) {
            // Remove the author from the book's author list
            book.author = book.author.filter((eachAuthor) => eachAuthor !== parseInt(authorId));
            return;
        }
    });

    // Update the author database
    database.author.forEach((eachAuthor) => {
        if (eachAuthor.id === parseInt(authorId)) {
            // Remove the book from the author's book list
            eachAuthor.books = eachAuthor.books.filter((book) => book !== isbn);
            return;
        }
    });

    return res.json({
        message: `Author ${authorId} was deleted from book ${isbn}`,
        books: database.books,
        authors: database.author,
    });
});


booky.listen(3000,() => {
    console.log("Server is up and running");
});