// src/App.jsx

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

import Layout from './components/Layout/Layout.jsx';
import LoginPage from './pages/PaginasAutenticacao/LoginPage.jsx';
import SignUpPage from './pages/PaginasAutenticacao/SignUpPage.jsx';
import HomePage from './pages/Home/HomePage.jsx';
import TransactionsPage from './pages/Transactions/TransactionsPage.jsx';
import RelatorioMensal from './pages/RelatorioMensal/RelatorioMensal.jsx';

/**
 * O controle da sessão agora foi movido para o componente principal 'App'.
 * Este componente 'ProtectedRoutes' agora apenas recebe a sessão como prop
 * e decide se renderiza o Layout (e suas páginas filhas) ou redireciona para o login.
 */
function ProtectedRoutes({ session }) {
    if (!session) {
        return <Navigate to="/login" />;
    }
    return <Layout />;
}

function App() {
    // 1. O ESTADO DA SESSÃO AGORA VIVE NO COMPONENTE 'App' (nível mais alto)
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Busca a sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // O "ouvinte" de autenticação também vive aqui agora
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('EVENTO DE AUTENTICAÇÃO NO APP:', { event: _event, session }); // Log de depuração
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return <div>Carregando...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* As rotas públicas agora verificam a sessão diretamente do App */}
                <Route path="/login" element={!session ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/signup" element={!session ? <SignUpPage /> : <Navigate to="/" />} />

                {/* A rota "pai" agora passa a sessão para o componente de proteção */}
                <Route element={<ProtectedRoutes session={session} />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/relatorio" element={<RelatorioMensal />} />
                    {/* Adicione outras rotas protegidas aqui */}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;