// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './Auth.module.css';


export default function LoginPage() {
    // ...toda a sua lógica de login continua a mesma...
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);



const handleLogin = async (e) => {
    e.preventDefault();
    console.log('--- Iniciando tentativa de login ---'); // Log 1
    setLoading(true);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        console.log('Resposta do Supabase ao login:', { data, error }); // Log 2

        if (error) {
            console.error('Erro retornado pelo Supabase:', error); // Log 3
            throw error;
        }

        console.log('Login bem-sucedido, aguardando redirecionamento...'); // Log 4

    } catch (error) {
        alert(error.error_description || error.message);
    } finally {
        setLoading(false);
    }
};

// ... (resto do componente)

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container + ' ' + styles.animatedLoginBox}>
                <div className={styles.emoji} aria-hidden="true" style={{fontSize: '2.5rem', marginBottom: 8}}>👋</div>
                <h1 className={styles.header}>Bem-vindo de volta!</h1>
                <div className={styles.subheader}>Acesse sua conta para controlar suas finanças de forma simples e moderna.</div>
                <form onSubmit={handleLogin} className={styles.form}>
                    <input className={styles.input} type="email" placeholder="Seu email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className={styles.input} type="password" placeholder="Sua senha" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" disabled={loading} className={styles.button}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <p className={styles.linkText}>
                    Não tem uma conta? <Link to="/signup">Cadastre-se</Link>
                </p>
            </div>
        </div>
    );
}