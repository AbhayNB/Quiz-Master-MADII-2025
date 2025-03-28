// API Service

// Helper functions for common API tasks
const getHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Helper function to handle retries with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fn();
            // Check if response is not ok before trying to parse JSON
            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                // Only try to parse JSON if the content-type is application/json
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    if (response.status === 429) {
                        if (retries < maxRetries - 1) {
                            const retryAfter = parseInt(response.headers.get('Retry-After')) || 
                                             parseInt(errorData.retry_after) || 
                                             initialDelay * Math.pow(2, retries);
                            console.log(`Rate limited, retrying in ${retryAfter}ms...`);
                            await new Promise(resolve => setTimeout(resolve, retryAfter));
                            retries++;
                            continue;
                        }
                    }
                    throw new Error(errorData.msg || 'API request failed');
                } else {
                    throw new Error('API request failed');
                }
            }
            return response.json();
        } catch (error) {
            if (retries === maxRetries - 1) {
                throw error;
            }
            const delay = initialDelay * Math.pow(2, retries);
            console.log(`Request failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retries++;
        }
    }
};

// Subject APIs
const subjectAPI = {
    getAll: async () => {
        return retryWithBackoff(async () => {
            const response = await fetch('/subjects', {
                headers: getHeaders()
            });
            return response;
        });
    },

    create: async (subject) => {
        return retryWithBackoff(async () => {
            const response = await fetch('/create_subject', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(subject)
            });
            return response;
        });
    },

    update: async (id, subject) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/update_subject/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(subject)
            });
            return response;
        });
    },

    delete: async (id) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/delete_subject/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return response;
        });
    }
};

// Chapter APIs
const chapterAPI = {
    getOne: async (chapterID) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/chapter/${chapterID}`, {
                headers: getHeaders()
            });
            return response;
        });
    },
    getAll: async (subjectId) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/chapters/${subjectId}`, {
                headers: getHeaders()
            });
            return response;
        });
    },

    create: async (chapter) => {
        return retryWithBackoff(async () => {
            const response = await fetch('/create_chapter', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(chapter)
            });
            return response;
        });
    },

    update: async (id, chapter) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/update_chapter/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(chapter)
            });
            return response;
        });
    },

    delete: async (id) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/delete_chapter/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return response;
        });
    }
};

// Quiz APIs
const quizAPI = {
    getAll: async (chapterId) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/quizzes/${chapterId}`, {
                headers: getHeaders()
            });
            return response;
        });
    },

    create: async (quiz) => {
        return retryWithBackoff(async () => {
            const response = await fetch('/create_quiz', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(quiz)
            });
            return response;
        });
    },

    update: async (id, quiz) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/update_quiz/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(quiz)
            });
            return response;
        });
    },

    delete: async (id) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/delete_quiz/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return response;
        });
    },

    getOne: async (id) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/quiz/${id}`, {
                headers: getHeaders()
            });
            return response;
        });
    },

    getAttempts: async () => {
        return retryWithBackoff(async () => {
            const response = await fetch('/get_attempts', {
                headers: getHeaders()
            });
            return response;
        });
    }
};

// Question APIs
const questionAPI = {
    getAll: async (quizId) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/get_ques/${quizId}`, {
                headers: getHeaders()
            });
            return response;
        });
    },

    create: async (quizId, question) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/add_que/${quizId}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(question)
            });
            return response;
        });
    },

    update: async (id, question) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/update_que/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(question)
            });
            return response;
        });
    },

    delete: async (id) => {
        return retryWithBackoff(async () => {
            const response = await fetch(`/delete_que/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return response;
        });
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
        return retryWithBackoff(async () => {
            const response = await fetch('/activeusers', {
                headers: getHeaders()
            });
            return response;
        });
    },
    getAllUsers: async () => {
        return retryWithBackoff(async () => {
            const response = await fetch('/users', {
                headers: getHeaders()
            });
            return response;
        });
    }
};

// User APIs
const userAPI = {
    getSummary: async () => {
        return retryWithBackoff(async () => {
            const response = await fetch('/user/summary', {
                headers: getHeaders()
            });
            return response;
        });
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