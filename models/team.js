const mongoose = require('../database');

const TeamSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name_en: {
        type: String,
        required: true
    },
    name_fa: {
        type: String,
        required: true
    },
    flag: {
        type: String,
        default: ''
    },
    fifa_code: {
        type: String,
        required: true
    },
    iso2: {
        type: String,
        required: true
    },
    groups: {
        type: String,
        required: true,
        index: true
    }
});

// Create indexes for better query performance
TeamSchema.index({ id: 1 });
TeamSchema.index({ groups: 1 });

const Team = mongoose.model('Team', TeamSchema);

module.exports = Team;