// src/pages/SignUpPage.jsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './Auth.module.css';

export default function SignUpPage() {
    // 1. ADICIONAMOS ESTADOS PARA OS NOVOS CAMPOS
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            // 3. ATUALIZAMOS A CHAMADA PARA ENVIAR OS DADOS EXTRAS
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phone,
                    }
                }
            });

            if (error) throw error;
            
            alert('Cadastro realizado com sucesso!');
            navigate('/login'); // Redireciona para a página de login após o sucesso
        } catch (error) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.container}>
                <h1 className={styles.header}>Crie sua Conta</h1>
                <form onSubmit={handleSignUp} className={styles.form}>
                    {/* 2. ADICIONAMOS OS INPUTS NO FORMULÁRIO */}
                    <input className={styles.input} type="text" placeholder="Nome Completo" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    <input className={styles.input} type="tel" placeholder="Telefone (opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <input className={styles.input} type="email" placeholder="Seu email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className={styles.input} type="password" placeholder="Crie uma senha (mín. 6 caracteres)" required value={password} onChange={(e) => setPassword(e.target.value)} />
                    
                    <button type="submit" disabled={loading} className={`${styles.button} ${styles.signUpButton}`}>
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
                <p className={styles.linkText}>
                    Já tem uma conta? <Link to="/login">Faça o login</Link>
                </p>
            </div>
        </div>
    );
}