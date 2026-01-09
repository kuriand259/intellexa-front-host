import axios from "axios";

const CHATBOT_API_URL = `${import.meta.env.VITE_API_URL}/api/v1/rag/ask`;

/**
 * Sends a question to the chatbot API.
 * @param {string} question - The user's question.
 * @param {string} industryFilter - Optional industry filter.
 * @returns {Promise<Object>} - The API response containing answer and sources.
 */
export const askChatbot = async (question, industryFilter = "") => {
    try {
        const response = await axios.post(CHATBOT_API_URL, {
            question,
            top_k: 3,
            industry_filter: industryFilter,
        });
        return response.data;
    } catch (error) {
        console.error("Error asking chatbot:", error);
        throw error;
    }
};

/**
 * Sends a question to the Agentic chatbot API.
 * @param {string} question - The user's question.
 * @param {number} maxIterations - Max iterations for the agent.
 * @param {boolean} useKnowledgeBase - Whether to use the knowledge base.
 * @returns {Promise<Object>} - The API response.
 */
export const askAgentic = async (question, maxIterations = 5, useKnowledgeBase = true) => {
    const url = `${import.meta.env.VITE_API_URL}/api/v1/rag/ask-agentic`;
    try {
        const response = await axios.post(url, {
            question,
            max_iterations: maxIterations,
            use_knowledge_base: useKnowledgeBase
        });
        return response.data;
    } catch (error) {
        console.error("Error asking Agentic chatbot:", error);
        throw error;
    }
};
