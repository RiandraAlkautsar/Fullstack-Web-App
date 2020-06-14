module.exports = function (app, passport, db) {

  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  app.get('/profile', isLoggedIn, function (req, res) {
    db.collection('foods').find().toArray((err, result) => {
      if (err) return console.log(err)
      // console.log(req.user, 'this is req')
      // console.log(res, 'this is RES')
      // console.log(result, 'this is RESULT')
      res.render('profile.ejs', {
        user: req.user,
        messages: result
      })
    })
  });

  app.get('/profilesAll', isLoggedIn, function (req, res) {
    db.collection('foods').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('allProfiles.ejs', {
        user: req.user,
        messages: result
      })
    })
  });

  app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  app.post('/messages', (req, res) => {
    db.collection('foods').save({ name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown: 0 }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })

  app.put('/messages', (req, res) => {
    db.collection('foods')
      .findOneAndUpdate({ name: req.body.name, msg: req.body.msg }, {
        $set: {
          thumbUp: req.body.thumbUp + 1
        }
      }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  app.put('/thumbDown', (req, res) => {
    db.collection('foods')
      .findOneAndUpdate({ name: req.body.name, msg: req.body.msg }, {
        $set: {
          thumbUp: req.body.thumbUp - 1,

        }
      }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })


  app.delete('/messages', (req, res) => {
    db.collection('foods').findOneAndDelete({ name: req.body.name, msg: req.body.msg }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })


  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });


  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));


  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });


  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));


  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
