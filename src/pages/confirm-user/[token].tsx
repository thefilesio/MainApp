import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ConfirmUser() {
  const router = useRouter();
  const { token } = router.query;

  const [statusMessage, setStatusMessage] = useState('Verifying your email...');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    
    if (token) {
      const tokenStr = Array.isArray(token) ? token[0] : token;
      if (!tokenStr) {
        setStatusMessage('Token invalid or missing.');
        setIsError(true);
        return;
      }
      const verifyUserToken = async () => {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenStr,
          type: 'signup',
        });

        if (error) {
          // Jika ada error dari Supabase (misal: token tidak valid atau kedaluwarsa)
          setStatusMessage(`Verification failed: ${error.message}`);
          setIsError(true);
        } else if (data.user) {
          // Jika berhasil, user akan otomatis login dan mendapatkan session
          setStatusMessage('Verification Successful! You can now log in.');
          setIsError(false);
          setTimeout(() => {
            router.push('/'); 
          }, 1000); 
        }
      };

      verifyUserToken();
    }
  }, [token, router]); 

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-black">
        <div className="bg-white dark:bg-main-dark dark:text-white p-6 rounded shadow-md w-full max-w-md
            text-center">
            <h1 className="text-2xl font-bold mb-4">Confirmasi Email</h1>
            <p className={`text-lg ${isError ? 'text-red-500' : 'text-green-500'}`}>
              {statusMessage}
            </p>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                If you have any issues, please contact support.
              </p>
              <button
                onClick={() => router.push('/')}
                className=" px-4 py-2 mt-4 bg-primary text-white rounded hover:bg-blue-600 transition-colors"
              >
                Back to Home
              </button>
            </div>
        </div>
    </div>
  );
}