import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './HomePage.module.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';


const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export default function HomePage() {
    const [summary, setSummary] = useState({ total_income: 0, total_expense: 0 });
    // Dados para o gráfico de barras
    const chartData = [
        { name: 'Receitas', valor: summary.total_income },
        { name: 'Despesas', valor: summary.total_expense }
    ];
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Resumo do mês
            const { data: summaryData, error: summaryError } = await supabase.rpc('get_monthly_summary');
            if (summaryError) {
                console.error('Erro ao buscar resumo:', summaryError);
                setSummary({ total_income: 0, total_expense: 0 });
            } else if (summaryData) {
                setSummary(summaryData[0]);
            }

            // Últimas transações
            const { data: transactionsData, error: transactionsError } = await supabase
                .from('transactions')
                .select('*')
                .order('transaction_date', { ascending: false })
                .limit(5);
            if (transactionsError) {
                console.error('Erro ao buscar transações recentes:', transactionsError);
                setRecentTransactions([]);
            } else {
                setRecentTransactions(transactionsData || []);
            }

            // Dados mensais para gráfico de linha
            const { data: monthly, error: monthlyError } = await supabase.rpc('get_income_expense_by_month');
            if (monthlyError) {
                console.error('Erro ao buscar dados mensais:', monthlyError);
                setMonthlyData([]);
            } else {
                setMonthlyData(monthly || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const saldoDoMes = summary.total_income - summary.total_expense;

    if (loading) return <div className="page-center"><p>Carregando dashboard...</p></div>;

    // Dados para o gráfico de pizza
    const pieData = [
        { name: 'Receitas', value: summary.total_income },
        { name: 'Despesas', value: summary.total_expense }
    ];
    // Cores suaves e modernas
    const pieColors = ['#6ee7b7', '#fca5a5'];

    return (
        <div className="page-center">
            <div className={styles.container}>
                {/* Logo e título mobile first */}
                <div className={styles.logoHeader}>
                    <h1 className={styles.mobileTitle}>Dashboard Financeiro</h1>
                </div>
                {/* === INÍCIO: CARDS DE RESUMO (KPIs) === */}
                <section className={styles.summaryCards}>
                    <div className={styles.card}>
                        <h3>Receitas (Mês)</h3>
                        <p className={styles.income}>+ {formatarMoeda(summary.total_income)}</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Despesas (Mês)</h3>
                        <p className={styles.expense}>- {formatarMoeda(summary.total_expense)}</p>
                    </div>
                    <div className={styles.card}>
                        <h3>Saldo (Mês)</h3>
                        <p style={{ color: saldoDoMes >= 0 ? '#2ecc71' : '#e74c3c' }}>
                            {formatarMoeda(saldoDoMes)}
                        </p>
                    </div>
                </section>
                {/* === FIM: CARDS DE RESUMO (KPIs) === */}
                

                {/* Botão de Adicionar Nova Transação */}
                <Link to="/transactions" className={styles.addButton}>
                    Adicionar Nova Transação
                </Link>

                <Link to="/relatorio" className={styles.reportButton}>
                                    Ver Relatórios Mensais
                </Link>


                {/* === GRÁFICOS + ÚLTIMAS TRANSAÇÕES === */}
                <div className={styles.dashboardRow}>
                    <section className={styles.dashboardChart}>
                        <h2 className={styles.sectionTitle}>Análise Financeira</h2>
                        <div className={styles.chartsWrapper}>
                            {/* Gráfico de Linha: Receita e Despesa por mês */}
                            <div className={styles.lineChartBox}>
                                <ResponsiveContainer width="100%" height={180}>
                                    <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={formatarMoeda} />
                                        <Tooltip formatter={formatarMoeda} />
                                        <Line type="monotone" dataKey="income" stroke="#6ee7b7" name="Receitas" strokeWidth={2} dot={{ r: 3 }} />
                                        <Line type="monotone" dataKey="expense" stroke="#fca5a5" name="Despesas" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Gráfico de Barras */}
                            <div className={styles.barChartBox}>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis hide />
                                        <Tooltip />
                                        <Bar dataKey="valor" fill="#3498db" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>
                    <section className={styles.dashboardTransactions}>
                        <h2 className={styles.sectionTitle}>Últimas Transações</h2>
                        <ul className={styles.transactionList}>
                            {recentTransactions.length > 0 ? recentTransactions.map(t => (
                                <li key={t.id} className={styles.transactionItem}>
                                    <span>
                                        <strong>{t.description}</strong><br/>
                                        <small>{t.category} - {new Date(t.transaction_date).toLocaleDateString()}</small>
                                    </span>
                                    <strong className={t.type === 'income' ? styles.income : styles.expense}>
                                        {t.type === 'expense' && '- '}
                                        {formatarMoeda(t.amount)}
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