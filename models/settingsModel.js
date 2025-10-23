const mongoose = require('mongoose');

// Inga namma app-oda ella settings-ayum ore collection-la vechikalam
const settingsSchema = mongoose.Schema({
    // 'attendance' or 'general' maari setting peru
    settingName: {
        type: String,
        required: true,
        unique: true,
        default: 'attendance'
    },
    // Andha setting-oda value
    value: {
        type: Object,
        required: true,
        default: {
            startTime: '18:00', // Default check-in start time
            endTime: '18:30'   // Default check-in end time
        }
    }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
