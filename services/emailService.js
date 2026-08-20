const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendInvitationEmail = async ({
  guestName,
  guestEmail,
  coupleNames,
  invitationLink,
}) => {
  await transporter.sendMail({
    from: `"Wedding Event Manager" <${process.env.EMAIL_USER}>`,
    to: guestEmail,
    subject: `💍 You're Invited to ${coupleNames}'s Wedding`,
    html: `
      <div style="
        max-width: 600px;
        margin: auto;
        padding: 40px;
        font-family: Arial, sans-serif;
        background: #fff7f9;
        color: #333;
        text-align: center;
      ">
        
        <h1 style="color: #e11d48;">
          💍 You're Invited!
        </h1>

        <p style="font-size: 18px;">
          Dear ${guestName},
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          You are warmly invited to celebrate the wedding of
          <strong>${coupleNames}</strong>.
        </p>

        <p style="font-size: 16px; line-height: 1.6;">
          We would love to have you join us on this beautiful day.
        </p>

        <a
          href="${invitationLink}"
          style="
            display: inline-block;
            margin-top: 20px;
            padding: 15px 30px;
            background: #e11d48;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
          "
        >
          Accept Invitation 💌
        </a>

        <p style="
          margin-top: 30px;
          font-size: 13px;
          color: #777;
        ">
          Please click the button above to accept your invitation
          and create your guest account.
        </p>

        <p style="
          margin-top: 30px;
          font-size: 14px;
          color: #999;
        ">
          Wedding Event Manager
        </p>

      </div>
    `,
  });
};

module.exports = {
  sendInvitationEmail,
};
