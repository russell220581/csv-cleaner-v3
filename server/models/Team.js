const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    stripeSubscriptionId: String,
    subscriptionStatus: {
      type: String,
      default: 'inactive',
    },
    settings: {
      maxMembers: {
        type: Number,
        default: 10,
      },
      allowApiAccess: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Get team members count
teamSchema.virtual('memberCount').get(function () {
  return this.members.length;
});

// Check if user is member
teamSchema.methods.isMember = function (userId) {
  return this.members.some(
    (member) => member.user.toString() === userId.toString()
  );
};

// Check if user is admin
teamSchema.methods.isAdmin = function (userId) {
  const member = this.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  return member && member.role === 'admin';
};

module.exports = mongoose.model('Team', teamSchema);
