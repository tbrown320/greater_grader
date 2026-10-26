const ObjectId = require('mongodb').ObjectId
// need the conversation for ObjectId to update and delete routes
module.exports = function (app, passport, db) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    console.log('filtering by user:', req.user._id)
    db.collection('assignments').find({ userId: req.user._id }).toArray((err, result) => {
      if (err) return console.log(err)
      //current grade needs a value to first start out
      //letter grade is an empty string
      let currentGrade = null
      let letterGrade = ''
      if (result.length > 0) {
        //for loop to get total grade number
        // for (let i = 0; i < result.length; i++) {
        //   total = total + result[i].grade
        // }
        //use reduce to get sum of array of grades
        let total = result.reduce((sum, a) => sum + a.grade, 0)
        //get current grade by dividing the sum of grades by the number of assignments
        currentGrade = Math.round((total / result.length) * 10) / 10
        if (currentGrade >= 90) {
          letterGrade = 'A'
        } else if (currentGrade >= 80) {
          letterGrade = 'B'
        } else if (currentGrade >= 70) {
          letterGrade = 'C'
        } else if (currentGrade >= 60) {
          letterGrade = 'D'
        } else {
          letterGrade = 'F'
        }
      }
      res.render('profile.ejs', {
        user: req.user,
        assignments: result,
        currentGrade: currentGrade,
        letterGrade: letterGrade
      })
    })
  });

  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // message board routes ===============================================================

  app.post('/assignments', (req, res) => {
    db.collection('assignments').insertOne({
      assignment: req.body.assignment,
      grade: Number(req.body.grade),
      userId: req.user._id
    }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })

  app.put('/assignments', (req, res) => {
    db.collection('assignments')
      //we get the _id because two entries can look alike but their id's cant
      .findOneAndUpdate({
        _id: ObjectId(req.body.id),
        userId: req.user._id
      }, {
        $set: {
          grade: Number(req.body.grade)
        }
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  app.delete('/assignments', (req, res) => {
    db.collection('assignments').findOneAndDelete(
      {
        //delete by objectId to get rid of specific 
        _id: ObjectId(req.body.id),
        userId: req.user._id
      }, (err, result) => {
        if (err) return res.send(err)
        res.send('Assignment deleted!')
      })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
