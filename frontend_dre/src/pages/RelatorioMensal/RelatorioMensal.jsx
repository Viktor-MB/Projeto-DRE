// src/pages/RelatorioMensal.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import styles from './RelatorioMensal.module.css'; // AQUI ESTÁ A MUDANÇA PRINCIPAL



const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

export default function RelatorioMensal() {
    const navigate = useNavigate();
    const [dataSelecionada, setDataSelecionada] = useState(() => {
        const hoje = new Date();
        return { mes: hoje.getMonth() + 1, ano: hoje.getFullYear() };
    });
    const [resumo, setResumo] = useState({ total_receitas: 0, total_despesas: 0 });
    const [transacoes, setTransacoes] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        const buscarDadosDoRelatorio = async () => {
            setCarregando(true);
            setErro('');
            const { ano, mes } = dataSelecionada;

            const { data: dadosResumo, error: erroResumo } = await supabase.rpc('obter_resumo_do_mes', {
                ano_selecionado: ano, mes_selecionado: mes,
            });

            if (erroResumo) {
                console.error('Erro ao buscar resumo:', erroResumo);
                setErro('Não foi possível carregar o resumo.');
            } else {
                setResumo(dadosResumo[0] || { total_receitas: 0, total_despesas: 0 });
            }

            const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
            const dataFim = new Date(ano, mes, 1).toISOString().split('T')[0];

            const { data: dadosTransacoes, error: erroTransacoes } = await supabase
                .from('transactions')
                .select('*, categories(name)')
                .gte('transaction_date', dataInicio)
                .lt('transaction_date', dataFim)
                .order('transaction_date', { ascending: false });

            if (erroTransacoes) {
                console.error('Erro ao buscar transações:', erroTransacoes);
                setErro(prev => prev + ' Não foi possível carregar as transações.');
            } else {
                setTransacoes(dadosTransacoes || []);
            }

            setCarregando(false);
        };

        buscarDadosDoRelatorio();
    }, [dataSelecionada]);

    const saldoDoMes = resumo.total_receitas - resumo.total_despesas;
    const anosDisponiveis = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
    const mesesDisponiveis = Array.from({ length: 12 }, (_, i) => ({
        valor: i + 1,
        nome: new Date(0, i).toLocaleString('pt-BR', { month: 'long' }),
    }));

    return (
        <div className="page-center">
            <div className={styles.container}>
                <div className={styles.backButtonRow}>
                    <button type="button" onClick={() => navigate("/")} className={styles.backButton}>
                        <span style={{ fontSize: '1.2em', marginRight: 6, verticalAlign: 'middle' }}>←</span>
                        <span className={styles.backButtonText}>Dashboard</span>
                    </button>
                </div>


                <h1 className={styles.header}>Relatório Mensal</h1>

                <div className={styles.seletoresRelatorio}>
                    <select
                        name="mes"
                        value={dataSelecionada.mes}
                        onChange={(e) => setDataSelecionada(d => ({ ...d, mes: parseInt(e.target.value) }))}
                    >
                        {mesesDisponiveis.map(m => <option key={m.valor} value={m.valor}>{m.nome}</option>)}
                    </select>
                    <select
                        name="ano"
                        value={dataSelecionada.ano}
                        onChange={(e) => setDataSelecionada(d => ({ ...d, ano: parseInt(e.target.value) }))}
                    >
                        {anosDisponiveis.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                {carregando ? ( <p>Carregando dados do relatório...</p> ) : 
                 erro ? ( <p style={{ color: 'red' }}>{erro}</p> ) : 
                 (
                    <>
                        <section className={styles.summaryCards}>
                            <div className={styles.card}>
                                <h3>Receitas</h3>
                                <p className={styles.income}>+ {formatarMoeda(resumo.total_receitas)}</p>
                            </div>
                            <div className={styles.card}>
                                <h3>Despesas</h3>
                                <p className={styles.expense}>- {formatarMoeda(resumo.total_despesas)}</p>
                            </div>
                            <div className={styles.card}>
                                <h3>Saldo</h3>
                                <p style={{ color: saldoDoMes >= 0 ? '#2ecc71' : '#e74c3c' }}>
                                    {formatarMoeda(saldoDoMes)}
                                </p>
                            </div>
                        </section>

                        <h2>Transações do Mês</h2>
                        {transacoes.length > 0 ? (
                            <ul className={styles.transactionList}>
                                {transacoes.map(t => (
                                    <li key={t.id} className={`${styles.transactionItem} ${t.type === 'income' ? styles.incomeBorder : styles.expenseBorder}`}>
                                        <span>
                                            <strong>{t.description}</strong><br />
                                            <small>{t.categories?.name || 'Sem Categoria'} - {new Date(t.transaction_date).toLocaleDateString()}</small>
                                        </span>
                                        <strong className={t.type === 'income' ? styles.income : styles.expense}>
                                            {t.type === 'expense' && '- '}
                                            {formatarMoeda(t.amount)}
                                        </strong>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhuma transação encontrada para este período.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}