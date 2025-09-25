// src/components/AnimatedPage.jsx

import { motion } from 'framer-motion';

// Definimos as animações de página
const pageVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

const AnimatedPage = ({ children, isLoading }) => {
    return (
        <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            // Adicionamos um estilo para esconder o conteúdo se estiver carregando
            // e animar sua entrada quando isLoading for false
            style={{ opacity: isLoading ? 0 : 1 }} 
        >
            {children}
        </motion.div>
    );
};

export default AnimatedPage;