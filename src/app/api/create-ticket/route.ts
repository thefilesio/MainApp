// supabase/functions/create-ticket/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Ambil data dari body request
    const { name, email, subject, message } = await req.json()

    // 2. Ambil secrets yang sudah kita set
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const destinationEmail = Deno.env.get('DESTINATION_EMAIL')

    if (!resendApiKey || !destinationEmail) {
      throw new Error('Missing environment variables')
    }

    // 3. Kirim request ke API Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Support Ticket <onboarding@resend.dev>', // Email 'from' harus dari domain terverifikasi di Resend (atau default ini untuk testing)
        to: destinationEmail,
        subject: `New Ticket: ${subject}`,
        html: `
          <h1>New Support Ticket Received</h1>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr>
          <h2>Message:</h2>
          <p>${message}</p>
        `,
        reply_to: email, // Memudahkan Anda untuk membalas langsung ke email pengguna
      }),
    })

    if (!resendResponse.ok) {
      const errorData = await resendResponse.json()
      throw new Error(JSON.stringify(errorData))
    }

    // 4. Kirim response sukses kembali ke frontend
    return new Response(JSON.stringify({ message: 'Ticket created successfully!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // Kirim response error kembali ke frontend
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})