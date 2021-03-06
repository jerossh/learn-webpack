var Movie = require('../models/movie')
var Comment = require('../models/comment')
var Category = require('../models/category')
var _ = require('underscore')
var fs = require('fs')
var path = require('path')

// detail
exports.detail = function (req, res) {
  var id = req.params.id

  Movie.update({_id: id}, {$inc: {pv: 1}}, function(err) {  // NOTE: 写法很想mongo里的
    if (err) {
      console.log(err)
    }
  })

  Movie.findById(id, function(err,movie){
    Comment
      .find({movie: id})   //movie: id 这是什么意思
      .populate('from','name')
      .populate('reply.from reply.to', 'name')
      .exec(function(err, comments) {
        console.log(comments)
        res.render('detail',{
          title:'imooc详情页',
          movie: movie,
          comments: comments
        })
      })
  })
}

// admin new page
exports.new = function(req, res) {
  Category.find({}, function(err, categories) {
    res.render('admin', {
      title: 'imooc 后台录入页',
      categories: categories,
      movie: {}
    })
  })
}

// admin update movie
exports.update = function(req, res){
  var id = req.params.id
  if(id){
    Movie.findById(id, function(err, movie) {
      Category.find({}, function(err, categories) {
        res.render('admin', {
          title: 'imooc 后台更新',
          movie: movie,
          categories: categories
        })
      })
    })
  }
}

// NOTE: post the poster
exports.savePoster = function (req, res, next){
  var posterData = req.files.uploadPoster
  var filePath = posterData.path
  var originalFilename = posterData.originalFilename

  console.log(req.files);

  if (originalFilename) {
    fs.readFile(filePath, function(err, data) {
      var timestamp = Date.now()   //时间戳
      var type = posterData.type.split('/')[1]  //格式
      var poster = timestamp + '.' + type
      var newPath = path.join(__dirname, '../../', '/public/upload/' + poster)

      fs.writeFile(newPath, data, function(err){
        req.poster = poster    //这段看不懂
        next()
      })
    })
  }
  else {
    next()
  }
}

//amdin post movie
exports.save = function(req, res){
  var id = req.body.movie._id
  var movieObj = req.body.movie           //这个movie怎么得到的？
  var _movie

  if (req.poster) {
    movieObj.poster = req.poster
  }

  if (id) {                              //为什么要这样改，原来的 if(id !=='undefined')
    Movie.findById(id, function(err, movie) {
      if (err) {
        console.log(err)
      }

      _movie = _.extend(movie, movieObj)
      _movie.save(function(err, movie) {
        if (err) {
          console.log(err)
        }

        res.redirect('/movie/' + movie._id)
      })
    })
  }
    else {
      _movie = new Movie(movieObj)

      var categoryId = movieObj.category
      var categoryName = movieObj.categoryName

      _movie.save(function(err, movie) {
        if (err) {
          console.log(err)
        }
        if (categoryId){
          Category.findById(categoryId, function(err, category) {
            category.movies.push(movie._id)

            category.save(function(err, category) {
              res.redirect('/movie/' + movie._id)
            })
          })
        }
        else if (categoryName) {
        var category = new Category({
          name: categoryName,
          movies: [movie._id]
        })
            category.save(function(err, category) {
            movie.category = category._id
            movie.save(function(err, movie) {
              res.redirect('/movie/' + movie._id)
            })
          })
        }
      })
    }
}

// list page
exports.list = function(req, res) {
  Movie.fetch(function(err,movies){
    if(err){
      console.log(err)
    }
    res.render('list',{
      title:'imooc 列表页',
      movies: movies              //这个movie怎么来的
    })
  })
}

//删除电影
exports.del = function(req, res) {   //怎么写还是不懂呢
  var id = req.query.id

  if (id) {
    Movie.remove({_id: id}, function(err, movie) {
      if (err) {
        console.log(err)
        res.json({success: 0})
      }
      else {
        res.json({success: 1})
      }
    })
  }
}
