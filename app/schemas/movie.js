var mongoose = require('mongoose')
var Schema = mongoose.Schema        //每个Schema都会配置ObjectId这个属性
var ObjectId = Schema.Types.ObjectId     //What is it?  ObjectId

var MovieSchema = new Schema({
  doctor: String,
  title: String,
  language: String,
  country: String,
  summary: String,
  flash: String,
  poster: String,
  year: Number,
  category: {
    type: ObjectId,
    ref: 'Category'
  },
  meta: {
    creatAt:{
      type:Date,
      default: Date.now()
    },
    updateAt:{
      type:Date,
      default: Date.now()
    }
  }
})

MovieSchema.pre('save',function(next) {
  if (this.isNew) {
    this.meta.creatAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  // 调用next方法，让存储流程走下去
  next()
})

MovieSchema.statics = {
  fetch: function(cb){   //取出目前数据库所有的数据
    return this
      .find({})
      .sort('meta.updateAt')             //排序
      .exec(cb)
  },
  findById: function(id, cb) {   //用来查询单条数据
    return this
      .findOne({_id: id})
      .exec(cb)
  }
}

module.exports = MovieSchema
