// API Service

// Helper functions for common API tasks
const getHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Subject APIs
const subjectAPI = {
    getAll: async () => {
        const response = await fetch('/subjects', {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch subjects');
        return response.json();
    },

    create: async (subject) => {
        const response = await fetch('/create_subject', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(subject)
        });
        if (!response.ok) throw new Error('Failed to create subject');
        return response.json();
    },

    update: async (id, subject) => {
        const response = await fetch(`/update_subject/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(subject)
        });
        if (!response.ok) throw new Error('Failed to update subject');
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`/delete_subject/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete subject');
        return response.json();
    }
};

// Chapter APIs
const chapterAPI = {
    getOne: async (chapterID) => {
        const response = await fetch(`/chapter/${chapterID}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error(`Failed to get chapter`);
        return response.json();
    },
    getAll: async (subjectId) => {
        const response = await fetch(`/chapters/${subjectId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch chapters');
        return response.json();
    },

    create: async (chapter) => {
        const response = await fetch('/create_chapter', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(chapter)
        });
        if (!response.ok) throw new Error('Failed to create chapter');
        return response.json();
    },

    update: async (id, chapter) => {
        const response = await fetch(`/update_chapter/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(chapter)
        });
        if (!response.ok) throw new Error('Failed to update chapter');
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`/delete_chapter/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete chapter');
        return response.json();
    }
};

// Quiz APIs
const quizAPI = {
    getAll: async (chapterId) => {
        const response = await fetch(`/quizzes/${chapterId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch quizzes');
        return response.json();
    },

    create: async (quiz) => {
        const response = await fetch('/create_quiz', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(quiz)
        });
        if (!response.ok) throw new Error('Failed to create quiz');
        return response.json();
    },

    update: async (id, quiz) => {
        const response = await fetch(`/update_quiz/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(quiz)
        });
        if (!response.ok) throw new Error('Failed to update quiz');
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`/delete_quiz/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete quiz');
        return response.json();
    },

    getOne: async (id) => {
        const response = await fetch(`/get_quiz/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch quiz');
        return response.json();
    },

    getAttempts: async () => {
        const response = await fetch('/get_attempts', {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch attempts');
        return response.json();
    }
};

// Question APIs
const questionAPI = {
    getAll: async (quizId) => {
        const response = await fetch(`/get_ques/${quizId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch questions');
        return response.json();
    },

    create: async (quizId, question) => {
        const response = await fetch(`/add_que/${quizId}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(question)
        });
        if (!response.ok) throw new Error('Failed to create question');
        return response.json();
    },

    update: async (id, question) => {
        const response = await fetch(`/update_que/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(question)
        });
        if (!response.ok) throw new Error('Failed to update question');
        return response.json();
    },

    delete: async (id) => {
        const response = await fetch(`/delete_que/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete question');
        return response.json();
    }
};

// Auth APIs
const authAPI = {
    login: async (credentials) => {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    },

    register: async (userData) => {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Registration failed');
        return response.json();
    },

    getActiveUsers: async () => {
        const response = await fetch('/activeusers', {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch active users');
        return response.json();
    },
    getAllUsers: async () => {
        const response = await fetch('/users', {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    }
};

// User APIs
const userAPI = {
    getSummary: async () => {
        const response = await fetch('/user/summary', {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch user summary');
        return response.json();
    }
};

export const api = {
    subject: subjectAPI,
    chapter: chapterAPI,
    quiz: quizAPI,
    question: questionAPI,
    auth: authAPI,
    user: userAPI
};