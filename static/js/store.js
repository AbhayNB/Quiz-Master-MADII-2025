import { api } from './services/api.js';

// Vuex Store
export const store = Vuex.createStore({
    state() {
        return {
            subjects: [],
            chapters: {},  // Organized by subjectId
            quizzes: {},  // Organized by chapterId
            questions: {}, // Organized by quizId
            users: [],
            activeUsers: 0,
            logged: false
        }
    },
    mutations: {
        setUsers(state,users){
            state.users=users;
        },
        setChapters(state, { subjectId, chapters }) {
            state.chapters[subjectId] = chapters;
        },
        addChapter(state, { subjectId, chapter }) {
            if (!state.chapters[subjectId]) {
                state.chapters[subjectId] = [];
            }
            state.chapters[subjectId].push(chapter);
        },
        updateChapter(state, { subjectId, chapter }) {
            const index = state.chapters[subjectId].findIndex(c => c.id === chapter.id);
            if (index !== -1) {
                state.chapters[subjectId].splice(index, 1, chapter);
            }
        },
        deleteChapter(state, { subjectId, chapterId }) {
            const index = state.chapters[subjectId].findIndex(c => c.id === chapterId);
            if (index !== -1) {
                state.chapters[subjectId].splice(index, 1);
            }
            delete state.quizzes[chapterId];
        },
        setSubjects(state, subjects) {
            state.subjects = subjects;
        },
        addSubject(state, subject) {
            state.subjects.push(subject);
        },
        updateSubject(state, subject) {
            const index = state.subjects.findIndex(s => s.id === subject.id);
            if (index !== -1) {
                state.subjects.splice(index, 1, subject);
            }
        },
        deleteSubject(state, subjectId) {
            const index = state.subjects.findIndex(s => s.id === subjectId);
            if (index !== -1) {
                state.subjects.splice(index, 1);
            }
            delete state.chapters[subjectId];
        },
        setQuizzes(state, { chapterId, quizzes }) {
            state.quizzes[chapterId] = quizzes;
        },
        addQuiz(state, { chapterId, quiz }) {
            if (!state.quizzes[chapterId]) {
                state.quizzes[chapterId] = [];
            }
            state.quizzes[chapterId].push(quiz);
        },
        updateQuiz(state, { chapterId, quiz }) {
            const index = state.quizzes[chapterId].findIndex(q => q.id === quiz.id);
            if (index !== -1) {
                state.quizzes[chapterId].splice(index, 1, quiz);
            }
        },
        deleteQuiz(state, { chapterId, quizId }) {
            const index = state.quizzes[chapterId].findIndex(q => q.id === quizId);
            if (index !== -1) {
                state.quizzes[chapterId].splice(index, 1);
            }
            delete state.questions[quizId];
        },
        setQuestions(state, { quizId, questions }) {
            state.questions[quizId] = questions;
        },
        addQuestion(state, { quizId, question }) {
            if (!state.questions[quizId]) {
                state.questions[quizId] = [];
            }
            state.questions[quizId].push(question);
        },
        updateQuestion(state, { quizId, question }) {
            const index = state.questions[quizId].findIndex(q => q.id === question.id);
            if (index !== -1) {
                state.questions[quizId].splice(index, 1, question);
            }
        },
        deleteQuestion(state, { quizId, questionId }) {
            const index = state.questions[quizId].findIndex(q => q.id === questionId);
            if (index !== -1) {
                state.questions[quizId].splice(index, 1);
            }
        },
        setActiveUsers(state, count) {
            state.activeUsers = count;
        },
        setLogged(state, status) {
            state.logged = status;
        }
    },
    actions: {
        // Fetching users
        async fetchUsers({commit}) {
            const data= await api.auth.getAllUsers();
            commit('setUsers',data.users)
        },
        // Subject actions
        async fetchSubjects({ commit }) {
            try {
                const response = await fetch('/subjects');
                const data = await response.json();
                if (data && data.subjects) {
                    commit('setSubjects', data.subjects);
                } else {
                    console.error('Invalid response format from fetchSubjects:', data);
                    throw new Error('Invalid response format from server');
                }
            } catch (error) {
                console.error('Error fetching subjects:', error);
                throw error;
            }
        },
        async createSubject({ commit }, subject) {
            try {
                const data = await api.subject.create(subject);
                commit('addSubject', data.subject);
                return data.subject;
            } catch (error) {
                console.error('Error creating subject:', error);
                throw error;
            }
        },
        async updateSubject({ commit }, { id, subject }) {
            try {
                const data = await api.subject.update(id, subject);
                commit('updateSubject', data.subject);
                return data.subject;
            } catch (error) {
                console.error('Error updating subject:', error);
                throw error;
            }
        },
        async deleteSubject({ commit }, id) {
            try {
                await api.subject.delete(id);
                commit('deleteSubject', id);
            } catch (error) {
                console.error('Error deleting subject:', error);
                throw error;
            }
        },

        // Chapter actions
        async fetchChapters({ commit }, subjectId) {
            try {
                const response = await fetch(`/chapters/${subjectId}`);
                const data = await response.json();
                commit('setChapters', { subjectId, chapters: data.chapters });
            } catch (error) {
                console.error('Error fetching chapters:', error);
                throw error;
            }
        },
        async createChapter({ commit }, chapter) {
            try {
                const data = await api.chapter.create(chapter);
                commit('addChapter', { 
                    subjectId: chapter.subject_id, 
                    chapter: data.chapter 
                });
                return data.chapter;
            } catch (error) {
                console.error('Error creating chapter:', error);
                throw error;
            }
        },
        async updateChapter({ commit }, { id, chapter, subjectId }) {
            try {
                const data = await api.chapter.update(id, chapter);
                commit('updateChapter', { 
                    subjectId, 
                    chapter: data.chapter 
                });
                return data.chapter;
            } catch (error) {
                console.error('Error updating chapter:', error);
                throw error;
            }
        },
        async deleteChapter({ commit }, { id, subjectId }) {
            try {
                await api.chapter.delete(id);
                commit('deleteChapter', { subjectId, chapterId: id });
            } catch (error) {
                console.error('Error deleting chapter:', error);
                throw error;
            }
        },

        // Quiz actions
        async fetchQuizzes({ commit }, chapterId) {
            try {
                const response = await fetch(`/quizzes/${chapterId}`);
                const data = await response.json();
                commit('setQuizzes', { chapterId, quizzes: data.quizzes });
            } catch (error) {
                console.error('Error fetching quizzes:', error);
                throw error;
            }
        },
        async fetchQuiz({ commit }, id) {
            try {
                if (!id || isNaN(id)) {
                    throw new Error('Invalid quiz ID');
                }
                const data = await api.quiz.getOne(id);
                if (!data) {
                    throw new Error('Quiz not found');
                }
                return data;
            } catch (error) {
                console.error('Error fetching quiz:', error);
                throw error;
            }
        },
        async createQuiz({ commit }, quiz) {
            try {
                const data = await api.quiz.create(quiz);
                commit('addQuiz', { 
                    chapterId: quiz.chapter_id, 
                    quiz: data.quiz 
                });
                return data.quiz;
            } catch (error) {
                console.error('Error creating quiz:', error);
                throw error;
            }
        },
        async updateQuiz({ commit }, { id, quiz, chapterId }) {
            try {
                const data = await api.quiz.update(id, quiz);
                commit('updateQuiz', { 
                    chapterId, 
                    quiz: data.quiz 
                });
                return data.quiz;
            } catch (error) {
                console.error('Error updating quiz:', error);
                throw error;
            }
        },
        async deleteQuiz({ commit }, { id, chapterId }) {
            try {
                await api.quiz.delete(id);
                commit('deleteQuiz', { chapterId, quizId: id });
            } catch (error) {
                console.error('Error deleting quiz:', error);
                throw error;
            }
        },

        // Question actions
        async fetchQuestions({ commit }, quizId) {
            try {
                const data = await api.question.getAll(quizId);
                commit('setQuestions', { quizId, questions: data.questions });
            } catch (error) {
                console.error('Error fetching questions:', error);
                throw error;
            }
        },
        async createQuestion({ commit }, { quizId, question }) {
            try {
                const data = await api.question.create(quizId, question);
                commit('addQuestion', { 
                    quizId, 
                    question: data.question 
                });
                return data.question;
            } catch (error) {
                console.error('Error creating question:', error);
                throw error;
            }
        },
        async updateQuestion({ commit }, { id, question, quizId }) {
            try {
                const data = await api.question.update(id, question);
                commit('updateQuestion', { 
                    quizId, 
                    question: data.question 
                });
                return data.question;
            } catch (error) {
                console.error('Error updating question:', error);
                throw error;
            }
        },
        async deleteQuestion({ commit }, { id, quizId }) {
            try {
                await api.question.delete(id);
                commit('deleteQuestion', { quizId, questionId: id });
            } catch (error) {
                console.error('Error deleting question:', error);
                throw error;
            }
        },

        // Quiz Progress actions
        async submitQuiz({ commit }, submission) {
            try {
                const response = await api.quiz.submit(submission);
                return response;
            } catch (error) {
                console.error('Error submitting quiz:', error);
                throw error;
            }
        },
        async fetchQuizHistory({ commit }) {
            try {
                const response = await api.quiz.getAttempts();
                return response;
            } catch (error) {
                console.error('Error fetching quiz attempts:', error);
                throw error;
            }
        },
        async fetchUserSummary({ commit }) {
            try {
                const response = await api.user.getSummary();
                return response;
            } catch (error) {
                console.error('Error fetching user summary:', error);
                throw error;
            }
        },

        // User actions
        async fetchActiveUsers({ commit }) {
            try {
                const response = await fetch('/active_users');
                const data = await response.json();
                commit('setActiveUsers', data.count);
            } catch (error) {
                console.error('Error fetching active users:', error);
                throw error;
            }
        }
    },
    getters: {
        users: state => state.users,
        subjects: state => state.subjects,
        chapters: state => subjectId => state.chapters[subjectId] || [],
        quizzes: state => chapterId => state.quizzes[chapterId] || [],
        questions: state => quizId => state.questions[quizId] || [],
        activeUsers: state => state.activeUsers,
        logged: state => state.logged
    }
});