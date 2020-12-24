const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
const {logger} = require('../../startup/logger');

async function verifyUserEmail(userEmail, userName) {

    const salt = await bcrypt.genSalt(10);
    const hashedEmail = await bcrypt.hash(userEmail, salt);

    sgMail.setApiKey(process.env.TRAIL_SENDGRID_API_KEY);
    const msg = {
        from: { email: 'support@trail.com', name: 'Trail Support'},
        template_id: process.env.TRAIL_SENDGRID_VERIFY_EMAIL_TEMPLATE_ID,
        personalizations: [
            {
                to: [{ email: userEmail }],
                dynamic_template_data: {
                    subject: 'Email verification',
                    userName: `${userName}`,
                    button_url: `${process.env.TRAIL_FE_HOST_DOMAIN}/verify?email=${hashedEmail}`
                }
            }
        ],
    };
    
    return sgMail.send(msg).then(() => logger.info(`Verification email sent to ${userEmail}`));
}

module.exports.verifyUserEmail = verifyUserEmail;