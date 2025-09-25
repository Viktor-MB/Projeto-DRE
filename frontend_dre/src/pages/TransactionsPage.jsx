// src/pages/TransactionsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './TransactionsPage.module.css';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function TransactionsPage() {
    const navigate = useNavigate();
    // Estados existentes
    const [step, setStep] = useState(1); // 1: Descrição/Valor, 2: Tipo, 3: Categoria/Data, 4: Confirmação
    // Funções de navegação entre etapas
    const nextStep = () => setStep((s) => Math.min(s + 1, 4));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense');
    const [categoryId, setCategoryId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isManageModalOpen, setManageModalOpen] = useState(false);

    useEffect(() => {
        // A busca de dados agora não precisa mais buscar o perfil
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const [categoriesRes, transactionsRes] = await Promise.all([
                    supabase.from('categories').select('*').order('name'),
                    supabase.from('transactions').select('*, categories(name)').order('transaction_date', { ascending: false })
                ]);
                setCategories(categoriesRes.data || []);
                setTransactions(transactionsRes.data || []);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !categoryId) {
            alert('Por favor, selecione uma categoria.');
            return;
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert([{ description, amount, type, transaction_date: date, user_id: user.id, category_id: categoryId }])
            .select('*, categories(name)')
            .single();

        if (error) {
            alert('Erro: ' + error.message);
        } else {
            setTransactions([data, ...transactions]);
            setDescription(''); setAmount(''); setCategoryId('');
            setStep(1);
        }
    };

    const handleSaveCategory = async (e) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !newCategoryName.trim()) return;

        const { data, error } = await supabase
            .from('categories')
            .insert([{ name: newCategoryName, type: type, user_id: user.id }])
            .select()
            .single();

        if (error) {
            alert('Erro ao criar categoria: ' + error.message);
        } else {
            setCategories(prevCategories => [...prevCategories, data].sort((a,b) => a.name.localeCompare(b.name)));
            setCategoryId(data.id);
            setNewCategoryName('');
            setCategoryModalOpen(false);
        }
    };
    
    const handleDeleteCategory = async (categoryToDelete) => {
        const isConfirmed = window.confirm(`Tem certeza que quer apagar a categoria "${categoryToDelete.name}"?`);
        if (isConfirmed) {
            const { error } = await supabase.from('categories').delete().eq('id', categoryToDelete.id);
            if (error) {
                alert('Erro ao apagar categoria: ' + error.message);
            } else {
                setCategories(prevCategories => prevCategories.filter(c => c.id !== categoryToDelete.id));
                alert('Categoria apagada com sucesso!');
            }
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    return (
        // O Header não é mais renderizado aqui
        <div className="page-center">
            <div className={styles.container}>
                <div className={styles.backButtonRow}>
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className={styles.backButton}
                        aria-label="Voltar para Dashboard"
                    >
                        <span style={{fontSize: '1.2em', marginRight: 6, verticalAlign: 'middle'}}>←</span>
                        <span className={styles.backButtonText}>Dashboard</span>
                    </button>
                </div>
                <h1 className={styles.header}>Adicionar Transações</h1>
                <form onSubmit={handleAddTransaction} className={styles.form}>
                    {/* Indicador de etapas */}
                    <div className={styles.stepIndicator} style={{marginBottom: 18}}>
                        {[1,2,3,4].map((n) => (
                            <div key={n} className={styles.step + ' ' + (step === n ? styles.activeStep : step > n ? styles.completedStep : '')}>
                                {n}
                            </div>
                        ))}
                    </div>
                    {/* Etapa 1: Descrição e Valor */}
                    {step === 1 && (
                        <>
                            <label className={styles.inputLabel} htmlFor="descricao-input">Descrição</label>
                            <input
                                id="descricao-input"
                                className={styles.input}
                                type="text"
                                placeholder="Descrição (ex: Supermercado)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                            <label className={styles.inputLabel} htmlFor="valor-input">Valor</label>
                            <input
                                id="valor-input"
                                className={styles.input}
                                type="number"
                                step="0.01"
                                placeholder="Valor (ex: 150.75)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                            <button type="button" className={styles.addButtonDynamic} onClick={nextStep} disabled={!description || !amount}>Próximo</button>
                        </>
                    )}
                    {/* Etapa 2: Tipo */}
                    {step === 2 && (
                        <>
                            <div className={styles.inputTypeRadio}>
                                <button
                                    type="button"
                                    className={`${styles.typeButton} ${type === 'expense' ? styles.expense : ''}`}
                                    onClick={() => { setType('expense'); setCategoryId(''); }}
                                >
                                    Despesa
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.typeButton} ${type === 'income' ? styles.income : ''}`}
                                    onClick={() => { setType('income'); setCategoryId(''); }}
                                >
                                    Receita
                                </button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                <button type="button" className={styles.buttonSecondary} onClick={prevStep}>Voltar</button>
                                <button type="button" className={styles.addButtonDynamic} onClick={nextStep}>Próximo</button>
                            </div>
                        </>
                    )}
                    {/* Etapa 3: Categoria e Data */}
                    {step === 3 && (
                        <>
                            <div className={styles.categoryHeader}>
                                <label>Categoria</label>
                                <button type="button" onClick={() => setManageModalOpen(true)} className={styles.manageButton}>Gerenciar</button>
                            </div>
                            <div className={styles.categoryGroup}>
                                <select className={styles.input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                                    <option value="" disabled>Selecione uma categoria</option>
                                    {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button type="button" onClick={() => setCategoryModalOpen(true)} className={styles.addButtonSmall}>+</button>
                            </div>
                            <input className={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                <button type="button" className={styles.buttonSecondary} onClick={prevStep}>Voltar</button>
                                <button type="button" className={styles.addButtonDynamic} onClick={nextStep} disabled={!categoryId || !date}>Próximo</button>
                            </div>
                        </>
                    )}
                    {/* Etapa 4: Confirmação */}
                    {step === 4 && (
                        <>
                            <div className={styles.confirmationBox}>
                                <div className={styles.confirmationTitle}>Confirme os dados</div>
                                <div className={styles.confirmationList}>
                                    <div><span>Descrição:</span> <strong>{description}</strong></div>
                                    <div><span>Valor:</span> <strong>{amount}</strong></div>
                                    <div><span>Tipo:</span> <strong>{type === 'income' ? 'Receita' : 'Despesa'}</strong></div>
                                    <div><span>Categoria:</span> <strong>{categories.find(c => String(c.id) === String(categoryId))?.name || '-'}</strong></div>
                                    <div><span>Data:</span> <strong>{date}</strong></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 16 }}>
                                <button type="button" className={styles.buttonSecondary} onClick={prevStep}>Voltar</button>
                                <button type="submit" className={styles.addButtonDynamic}>Adicionar</button>
                            </div>
                        </>
                    )}
                </form>

                <h2>Histórico de Transações</h2>
                {loading ? <p>Carregando...</p> : (
                    <ul className={styles.transactionList}>
                        {transactions.map(t => (
                            <li key={t.id} className={styles.transactionItem}>
                                <span>
                                    <strong>{t.description}</strong><br/>
                                    <small>{t.categories?.name || 'Sem Categoria'} - {new Date(t.transaction_date).toLocaleDateString()}</small>
                                </span>
                                <strong className={t.type === 'income' ? styles.income : styles.expense}>
                                    {t.type === 'expense' && '- '}
                                    {formatCurrency(t.amount)}
                                </strong>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modal de ADICIONAR categoria */}
            {isCategoryModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>Criar Nova Categoria</h2>
                        <form onSubmit={handleSaveCategory}>
                            <p>Tipo: <strong>{type === 'income' ? 'Receita' : 'Despesa'}</strong></p>
                            <input
                                className={styles.input}
                                type="text"
                                placeholder="Nome da Categoria (ex: Lazer)"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                required
                            />
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setCategoryModalOpen(false)} className={styles.buttonSecondary}>Cancelar</button>
                                <button type="submit" className={styles.button}>Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de GERENCIAR categorias */}
            {isManageModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2>Gerenciar Categorias</h2>
                        <ul className={styles.categoryManageList}>
                            {categories.map(cat => (
                                <li key={cat.id} className={styles.categoryManageItem}>
                                    <span>{cat.name} ({cat.type === 'income' ? 'Receita' : 'Despesa'})</span>
                                    <button onClick={() => handleDeleteCategory(cat)} className={styles.deleteButton}>
                                        Apagar
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.modalActions}>
                            <button onClick={() => setManageModalOpen(false)} className={styles.cancelButton}>Voltar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}