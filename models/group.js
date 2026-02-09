const mongoose = require('../database');
const bcrypt = require('bcrypt');

const GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    teams: [{
        team_id: String,
        mp: String,
        w: String,
        l: String,
        d: String,
        pts: String,
        gf: String,
        ga: String,
        gd: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Group = mongoose.model('Group', GroupSchema);

module.exports = Group;