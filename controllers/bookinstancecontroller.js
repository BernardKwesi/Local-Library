let BookInstance = require('../models/bookinstance');
let {body,validationResult} = require('express-validator');
let Book = require('../models/book');
var async = require('async');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {

    BookInstance.find()
      .populate('book')
      .exec(function (err, list_bookinstances) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
      });
  
  };
  

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {

  BookInstance.findById(req.params.id)
  .populate('book')
  .exec(function (err, bookinstance) {
    if (err) { return next(err); }
    if (bookinstance==null) { // No results.
        var err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
    // Successful, so render.
    res.render('bookinstance_detail', { title: 'Copy: '+bookinstance.book.title, bookinstance:  bookinstance});
  })

};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
 
  var status =['Maintenance','Available','Loaned','Reserved'];
  //res.json({status : status})

  //Return All the books created
  Book.find({},'title')
  .exec(function (err, books) {
    if (err) { return next(err); }
    // Successful, so render.
    
    res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books,statuses: status});
  }); 

};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

  // Validate and sanitise fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
  body('status').escape(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a BookInstance object with escaped and trimmed data.
      var bookinstance = new BookInstance(
        { book: req.body.book,
          imprint: req.body.imprint,
          status: req.body.status,
          due_back: req.body.due_back
         });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values and error messages.
          Book.find({},'title')
              .exec(function (err, books) {
                  if (err) { return next(err); }
                  // Successful, so render.
                  res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance });
          });
          return;
      }
      else {
          // Data from form is valid.
          bookinstance.save(function (err) {
              if (err) { return next(err); }
                 // Successful - redirect to new record.
                 res.redirect(bookinstance.url);
              });
      }
  }
];

exports.bookinstance_delete_get =(req, res,next)=>{
    async.parallel({
      bookInstance: function(callback) {
        BookInstance.findById(req.params.id).populate('book').exec(callback);
      }
    },function(err, results){
      if(err) { return next(err)}
      if(results.bookInstance==null){
        res.redirect('/catalog/bookinstances');
      }
     
      res.render('bookinstance_delete',{ title:"Book Instance Delete", bookinstance:results.bookInstance});
    })
}


exports.bookinstance_delete_post =(req, res,next)=>{
async.parallel({
  bookInstance: function(callback) {
    BookInstance.findById(req.body.bookinstance_id).exec(callback);
  }
},function(err, results){
  if(err) { return next(err)}

  BookInstance.findByIdAndDelete(req.body.bookinstance_id,function(err){
    if(err) { return next(err)}

    res.redirect('/catalog/bookinstances');
  })
})

}
exports.bookinstance_update_get=(req, res,next)=>{
      async.parallel({
            bookinstance : function(callback){
              BookInstance.findById(req.params.id).exec(callback);
            },
            books: function(callback){
              Book.find(callback);
            }
      },function(err,results){
        if(err){return next(err);}
        if(results.bookinstance == null){//If the book instance not found
          var err = new Error('Book Instance Not Found');
          err.status =404;
          return next(err);
        }
        let status =['Maintenance','Available','Loaned','Reserved'];
        res.render('bookinstance_form',{title:'Update BookInstance',bookinstance: results.bookinstance, book_list : results.books, statuses:status});
      }
      )
}
exports.bookinstance_update_post=[
  
  // Validate and sanitise fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
  body('status').escape(),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a BookInstance object with escaped and trimmed data.
      var bookinstance = new BookInstance(
        { book: req.body.book,
          imprint: req.body.imprint,
          status: req.body.status,
          due_back: req.body.due_back
         });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values and error messages.
          Book.find({},'title')
              .exec(function (err, books) {
                  if (err) { return next(err); }
                  // Successful, so render.
                  res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance });
          });
          return;
      }
      else {
        BookInstance.findByIdAndUpdate(req.params.id,bookinstance,{},function(err,updatedBookInstance){
          if(err) return next(err);

          res.redirect(updatedBookInstance.url);
        })
      }
    }
]
    
