
const verify = require('../email/verify')
const sgMail = require('@sendgrid/mail');

describe('verify user email', () => {
    verify.verifyUserEmail('a', 'b');

    it('should not send an email if template_id is invalid', () => {
        sgMail.send = function mockSgMail(mockMsg){}
        const msg = { template_id: 'apikey' }
        expect(()=> mockSgMail(msg)).toThrow();
    })
})
