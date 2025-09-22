const express = require('express');
const { protect } = require('../middleware/auth');
const Team = require('../models/Team');
const User = require('../models/User');
const { logger } = require('../utils/logger');

const router = express.Router();

router.use(protect);

// Create a new team
router.post('/teams', async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // Check if user already has a team
    const existingTeam = await Team.findOne({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    });

    if (existingTeam) {
      return res.status(400).json({ error: 'You already belong to a team' });
    }

    const team = await Team.create({
      name,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: 'admin',
          joinedAt: new Date(),
        },
      ],
    });

    // Update user's team reference
    await User.findByIdAndUpdate(req.user._id, {
      team: team._id,
      isTeamAdmin: true,
    });

    res.status(201).json({
      status: 'success',
      data: { team },
    });
  } catch (error) {
    next(error);
  }
});

// Get user's team
router.get('/teams/my', async (req, res, next) => {
  try {
    const team = await Team.findOne({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    }).populate('members.user', 'email tier');

    if (!team) {
      return res.status(404).json({ error: 'No team found' });
    }

    res.status(200).json({
      status: 'success',
      data: { team },
    });
  } catch (error) {
    next(error);
  }
});

// Invite user to team
router.post('/teams/invite', async (req, res, next) => {
  try {
    const { email } = req.body;

    const team = await Team.findOne({ owner: req.user._id });
    if (!team) {
      return res.status(404).json({ error: 'You are not a team owner' });
    }

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (
      team.members.some(
        (m) => m.user.toString() === userToInvite._id.toString()
      )
    ) {
      return res.status(400).json({ error: 'User is already in the team' });
    }

    if (team.members.length >= team.settings.maxMembers) {
      return res.status(400).json({ error: 'Team member limit reached' });
    }

    // Add user to team
    team.members.push({
      user: userToInvite._id,
      role: 'member',
      joinedAt: new Date(),
    });

    await team.save();

    // Update user's team reference
    await User.findByIdAndUpdate(userToInvite._id, {
      team: team._id,
      isTeamAdmin: false,
    });

    res.status(200).json({
      status: 'success',
      message: 'User added to team successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
