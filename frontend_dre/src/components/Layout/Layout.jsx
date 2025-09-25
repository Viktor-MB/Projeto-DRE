// src/components/Layout/Layout.jsx
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import Header from '../Header.jsx'; // Importa o Header

export default function Layout() {
    const [profile, setProfile] = useState(null);
    const location = useLocation(); // Hook para saber a rota atual

    useEffect(() => {
        // O Layout agora é responsável por buscar o perfil para o Header
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();
                setProfile(profileData);
            }
        };
        fetchProfile();
    }, []);

    return (
        <div>
            {/* O HEADER FICA FORA DA ANIMAÇÃO */}
            <Header profile={profile} />

            <main>
                <AnimatePresence mode="wait">
                    {/* A "mágica" está aqui. Apenas o conteúdo que muda (Outlet) é animado */}
                    <motion.div
                        key={location.pathname} // A 'key' diz ao AnimatePresence quando a página muda
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet /> {/* O Outlet é o placeholder para a sua página (HomePage, etc) */}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}