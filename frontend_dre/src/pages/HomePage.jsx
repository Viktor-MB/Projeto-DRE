// src/pages/HomePage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './HomePage.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
// REMOVEMOS A IMPORTAÇÃO DO HEADER DAQUI - Isso é intencional, o Layout o renderiza.

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function HomePage() {
    // REMOVEMOS O ESTADO E A BUSCA DO 'profile' DAQUI - Isso é intencional, o Layout o renderiza.
    const [summary, setSummary] = useState({ total_income: 0, total_expense: 0 });
    // Dados para o gráfico de barras
    const chartData = [
        { name: 'Receitas', valor: summary.total_income },
        { name: 'Despesas', valor: summary.total_expense }
    ];
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: summaryData, error: summaryError } = await supabase.rpc('get_monthly_summary');
            if (summaryError) {
                console.error('Erro ao buscar resumo:', summaryError);
                setSummary({ total_income: 0, total_expense: 0 }); // Garante valores padrão em caso de erro
            } else if (summaryData) {
                setSummary(summaryData[0]);
            }

            const { data: transactionsData, error: transactionsError } = await supabase
                .from('transactions')
                .select('*')
                .order('transaction_date', { ascending: false })
                .limit(5);

            if (transactionsError) {
                console.error('Erro ao buscar transações recentes:', transactionsError);
                setRecentTransactions([]); // Garante array vazio em caso de erro
            } else {
                setRecentTransactions(transactionsData || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const saldoDoMes = summary.total_income - summary.total_expense;

    if (loading) return <div className="page-center"><p>Carregando dashboard...</p></div>;

    return (
        <div className="page-center">
            <div className={styles.container}>
                {/* === INÍCIO: CARDS DE RESUMO (KPIs) === */}
                <section className={styles.summaryCards}>
                    <div className={styles.card}>
                        <h3>Receitas (Mês)</h3>
                        <p className={styles.income}>+ {formatCurrency(summary.total_income)}</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Despesas (Mês)</h3>
                        <p className={styles.expense}>- {formatCurrency(summary.total_expense)}</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Saldo (Mês)</h3>
                        <p style={{ color: saldoDoMes >= 0 ? '#2ecc71' : '#e74c3c' }}>
                            {formatCurrency(saldoDoMes)}
                        </p>
                    </div>
                </section>
                {/* === FIM: CARDS DE RESUMO (KPIs) === */}
                
                {/* Botão de Adicionar Nova Transação */}
                <Link to="/transactions" className={styles.addButton}>
                    Adicionar Nova Transação
                </Link>

                                {/* === GRÁFICO + ÚLTIMAS TRANSAÇÕES === */}
                                <div className={styles.dashboardRow}>
                                    <section className={styles.dashboardChart}>
                                        <h2 style={{textAlign: 'center'}}>Análise Financeira</h2>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="valor" fill="#3498db" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </section>
                                    <section className={styles.dashboardTransactions}>
                                        <h2>Últimas Transações</h2>
                                        <ul className={styles.transactionList}>
                                            {recentTransactions.length > 0 ? recentTransactions.map(t => (
                                                <li key={t.id} className={styles.transactionItem}>
                                                    <span>
                                                        <strong>{t.description}</strong><br/>
                                                        <small>{t.category} - {new Date(t.transaction_date).toLocaleDateString()}</small>
                                                    </span>
                                                    <strong className={t.type === 'income' ? styles.income : styles.expense}>
                                                        {t.type === 'expense' && '- '}
                                                        {formatCurrency(t.amount)}
                                                    </strong>
                                                </li>
                                            )) : <p>Nenhuma transação registrada ainda.</p>}
                                        </ul>
                                    </section>
                                </div>

            </div>
        </div>
    );
}