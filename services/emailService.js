// const { Resend } = require("resend");

// console.log("RESEND KEY EXISTS:", !!process.env.RESEND_API_KEY);

// const resend = new Resend(process.env.RESEND_API_KEY);

// const sendInvitationEmail = async ({
//   guestName,
//   guestEmail,
//   coupleNames,
//   invitationLink,
// }) => {
//   const { data, error } = await resend.emails.send({
//     from: "Wedding Event Manager <onboarding@resend.dev>",
//     to: [guestEmail],
//     subject: `💍 You're Invited to ${coupleNames}'s Wedding`,
//     html: `
//       <div style="
//         max-width: 600px;
//         margin: auto;
//         padding: 40px;
//         font-family: Arial, sans-serif;
//         background: #fff7f9;
//         color: #333;
//         text-align: center;
//       ">
        
//         <h1 style="color: #e11d48;">
//           💍 You're Invited!
//         </h1>

//         <p style="font-size: 18px;">
//           Dear ${guestName},
//         </p>

//         <p style="font-size: 16px; line-height: 1.6;">
//           You are warmly invited to celebrate the wedding of
//           <strong>${coupleNames}</strong>.
//         </p>

//         <p style="font-size: 16px; line-height: 1.6;">
//           We would love to have you join us on this beautiful day.
//         </p>

//         <a
//           href="${invitationLink}"
//           style="
//             display: inline-block;
//             margin-top: 20px;
//             padding: 15px 30px;
//             background: #e11d48;
//             color: white;
//             text-decoration: none;
//             border-radius: 10px;
//             font-weight: bold;
//           "
//         >
//           Accept Invitation 💌
//         </a>

//         <p style="
//           margin-top: 30px;
//           font-size: 13px;
//           color: #777;
//         ">
//           Please click the button above to accept your invitation
//           and create your guest account.
//         </p>

//         <p style="
//           margin-top: 30px;
//           font-size: 14px;
//           color: #999;
//         ">
//           Wedding Event Manager
//         </p>

//       </div>
//     `,
//   });

//   if (error) {
//     console.error("RESEND EMAIL ERROR:", error);
//     throw new Error(error.message);
//   }

//   console.log("INVITATION EMAIL SENT:", data);
// };

// module.exports = {
//   sendInvitationEmail,
// };
const axios = require("axios");

const sendInvitationEmail = async ({
  guestName,
  guestEmail,
  coupleNames,
  invitationLink,
}) => {
  try {
    const response = await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,

        template_params: {
          guest_email: guestEmail,
          guest_name: guestName,
          couple_names: coupleNames,
          invitation_link: invitationLink,
        },
      }
    );

    console.log("INVITATION EMAIL SENT:", response.data);

    return response.data;
  } catch (error) {
    console.error(
      "EMAILJS ERROR:",
      error.response?.data || error.message
    );

    throw error;
  }
};

module.exports = {
  sendInvitationEmail,
};