// src/components/Header/Header.jsx
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 
import styles from './Header.module.css';

// O Header recebe o nome do usuário como uma "prop"
export default function Header({ profile }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logo}>DinDin</Link>

            <nav className={styles.navLinks}>
                {/* NavLink tem uma propriedade especial para saber se o link está ativo */}
                <NavLink to="/" className={({ isActive }) => isActive ? styles.active : ''}>
                    Dashboard
                </NavLink>
                <NavLink to="/transactions" className={({ isActive }) => isActive ? styles.active : ''}>
                    Transações
                </NavLink>
            </nav>

            <div className={styles.userMenu}>
                <span className={styles.userName}>
                    {profile?.full_name}
                </span>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Sair
                </button>
            </div>
        </header>
    );
}