const mongoose = require("mongoose");

const missionSchema = new mongoose.Schema({
  representative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Representative",
    required: true,
  },

  market: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Market",
    required : true,
  },
  manger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "manger",
    required : true
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
      },
    },
  ],
  complete: {
    type: Boolean,
    required: true,
  },
  approved: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps:true
});
const Mission = mongoose.model('Mission', missionSchema)
module.exports = Mission
