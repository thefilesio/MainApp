// import { NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';

// // Inisialisasi Resend dengan API Key
// const resend = new Resend(process.env.RESEND_API_KEY);

// // Inisialisasi Supabase client untuk server-side
// // Gunakan Service Role Key agar bisa menulis ke database dari API Route
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );

// // Konfigurasi email
// const TO_EMAIL = process.env.TO_EMAIL as string;
// const FROM_EMAIL = process.env.FROM_EMAIL as string;

// export async function POST(req: Request) {  
//     try {
//         // 1. Ambil dan validasi data dari body request
//         const { name, email, message } = await req.json();

//         if (!name || !email || !message) {
//             return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//         }

//         // 2. BARU: Simpan data ke database Supabase
//         const { error: supabaseError } = await supabase
//             .from('contact_submissions') // Nama tabel Anda di Supabase
//             .insert([
//                 { name, email, message },
//             ]);

//         // Jika gagal menyimpan ke database, hentikan proses dan kirim error
//         if (supabaseError) {
//             console.error("Supabase insert error:", supabaseError);
//             return NextResponse.json({ error: 'Failed to save submission.', detail: supabaseError }, { status: 500 });
//         }

//         // 3. Kirim notifikasi email menggunakan Resend
//         const { data, error: resendError } = await resend.emails.send({
//             from: `Form Kontak Situs <${FROM_EMAIL}>`,
//             to: [TO_EMAIL],
//             subject: `Pesan Baru dari ${name}`,
//             reply_to: email,
//             html: `
//                 <h1>Pesan Baru dari Form Kontak</h1>
//                 <p><strong>Nama:</strong> ${name}</p>
//                 <p><strong>Email:</strong> ${email}</p>
//                 <hr />
//                 <p><strong>Pesan:</strong></p>
//                 <p>${message.replace(/\n/g, '<br>')}</p>
//                 <br>
//                 <p><em>Pesan ini telah disimpan di database Supabase Anda.</em></p>
//             `,
//         });

//         if (resendError) {
//             console.error("Resend API error:", resendError);
//             // Meskipun email gagal terkirim, data sudah tersimpan di database
//             return NextResponse.json({ error: 'Failed to send email, but submission was saved.', detail: resendError }, { status: 500 });
//         }
      
//         // 4. Kirim balasan sukses
//         return NextResponse.json({ message: "Submission saved and email sent successfully!", data: data }, { status: 200 });

//     } catch (error: any) {
//         console.error("API Route error:", error);
//         return NextResponse.json(
//             { error: "Internal server error", detail: error.message },
//             { status: 500 }
//         );
//     }
// }