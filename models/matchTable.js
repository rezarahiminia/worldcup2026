const mongoose = require('../database');

const MatchTableSchema = new mongoose.Schema({
    group: {
        type: String,
        required: true,
        uppercase: true,
        ref: 'Group'
    },
    teams: [{
        team_id: {
            type: String,
            required: true
        },
        mp: {
            type: Number,
            default: 0
        },
        w: {
            type: Number,
            default: 0
        },
        l: {
            type: Number,
            default: 0
        },
        d: {
            type: Number,
            default: 0
        },
        pts: {
            type: Number,
            default: 0
        },
        gf: {
            type: Number,
            default: 0
        },
        ga: {
            type: Number,
            default: 0
        },
        gd: {
            type: Number,
            default: 0
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
MatchTableSchema.index({ group: 1 }, { unique: true });

const MatchTable = mongoose.model('MatchTable', MatchTableSchema);

module.exports = MatchTable;
