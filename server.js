require('dotenv').config();
const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Config
const ADMIN_EMAIL = process.env.EMAIL_USER;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

app.use(bodyParser.json());
app.use(express.static('public'));

// Save signature
app.post('/sign', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Champs obligatwa!' });

    const entry = { name, email, date: new Date().toISOString() };
    const data = fs.existsSync('signatures.json') ? JSON.parse(fs.readFileSync('signatures.json')) : [];
    data.push(entry);
    fs.writeFileSync('signatures.json', JSON.stringify(data, null, 2));

    sendEmailNotification(entry);
    res.json({ message: 'Mèsi! Siyati ou anrejistre.' });
});

// Admin login
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const data = fs.existsSync('signatures.json') ? JSON.parse(fs.readFileSync('signatures.json')) : [];
        res.json({ success: true, signatures: data });
    } else {
        res.status(403).json({ success: false, message: 'Modpas pa kòrèk.' });
    }
});

function sendEmailNotification(entry) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: 'Petisyon <' + process.env.EMAIL_USER + '>',
        to: ADMIN_EMAIL,
        subject: 'Nouvo Siyati sou Petisyon an',
        text: `Nouvo siyati: ${entry.name} (${entry.email})`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error('Erè imèl:', err);
        else console.log('Imèl voye:', info.response);
    });
}

app.listen(PORT, () => {
    console.log('Sit petisyon an ap kouri sou http://localhost:' + PORT);
});
