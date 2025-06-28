import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import users from '../../mock/users/index.json'; 
import Swal from 'sweetalert2';
import LanguageSwitcher from '../language-switcher';

const Login = () => {
    const { t } = useTranslation('common');
    const [nupkt, setNupkt] = useState('');
    const [password, setPassword] = useState('');
  
    const handleLogin = (event) => { 
      event.preventDefault();
      const user = users.find(user => user.NUPTK === nupkt && user.Password === password);
      if (user) {
        localStorage.setItem('nupkt', nupkt);
        localStorage.setItem('password', password);
        Swal.fire({
          title: t('login.success.title'),
          text: user.pria ? t('login.success.welcomeMale', { name: user.Nama }) : t('login.success.welcomeFemale', { name: user.Nama }),
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => window.location.reload());
      } else {
        Swal.fire({ 
          title: t('login.error.title'),
          text: t('login.error.message'),
          icon: 'error',
          confirmButtonText: t('login.error.tryAgain')
        });
      }
    };

    return (
        <section className="bg-gray-50">
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div className="flex items-center justify-between w-full max-w-md mb-6">
                    <a href="#" className="flex items-center text-2xl font-semibold text-gray-900">
                        <img className="w-[200px]" src="/math.png" alt="logo" />
                    </a>
                    <LanguageSwitcher />
                </div>
                <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8 w-full">
                        <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                            {t('login.title')}
                        </h1>
                        <form onSubmit={handleLogin} className="flex flex-col items-center w-full gap-4">
                            <div className='w-full'>
                                <label htmlFor="nuptk" className="block mb-2 text-sm font-medium text-gray-900">{t('login.nuptk')}</label>
                                <input 
                                    type="text" 
                                    name="nuptk" 
                                    id="nuptk" 
                                    value={nupkt} 
                                    onChange={(e)=>setNupkt(e.target.value)} 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                    placeholder={t('login.nuptkPlaceholder')} 
                                    required 
                                />
                            </div>
                            <div className='w-full'>
                                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">{t('login.password')}</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    id="password" 
                                    value={password} 
                                    onChange={(e)=>setPassword(e.target.value)} 
                                    placeholder={t('login.passwordPlaceholder')} 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                                    required 
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="w-full mt-4 text-white bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                                {t('login.loginButton')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;
