// Vuex Store
export const store = Vuex.createStore({
    state() {
        return {
            logged: !!localStorage.getItem('access_token'),
            role: localStorage.getItem('role'),
            email: localStorage.getItem('email'),
            username: localStorage.getItem('username'),
            access_token: localStorage.getItem('access_token'),
            uid: localStorage.getItem('id'),
            activeUsers: 0,
            subjects: [],
            chapters: {},
            quizzes: {},
        };
    },
    mutations: {
        setChapters(state, { subjectId, chapters }) {
            state.chapters = {
                ...state.chapters,
                [subjectId]: chapters
            };
        },
        addChapter(state, { subjectId, chapter }) {
            if (!state.chapters[subjectId]) {
                state.chapters[subjectId] = [];
            }
            state.chapters[subjectId].push(chapter);
        },
        updateChapter(state, { subjectId, chapter }) {
            const chapters = state.chapters[subjectId];
            const index = chapters.findIndex(c => c.id === chapter.id);
            if (index !== -1) {
                chapters[index] = chapter;
            }
        },
        deleteChapter(state, { subjectId, chapterId }) {
            const chapters = state.chapters[subjectId];
            if (chapters) {
                state.chapters[subjectId] = chapters.filter(c => c.id !== chapterId);
            }
        },
        setSubjects(state, subjects) {
            console.log('Setting Subjects:', subjects['subjects']);
            state.subjects = Array.isArray(subjects['subjects']) ? subjects : []; 
        },
        addSubject() {
            this.dispatch('subjects');
        },
        updateSubject(state, subject) {
            const index = state.subjects.findIndex(s => s.id === subject.id);
            if (index !== -1) {
                state.subjects[index] = { ...state.subjects[index], ...subject };
            }
        },
        deleteSubject(state, subjectId) {
            state.subjects['subjects'] = state.subjects['subjects'].filter(s => s.id !== subjectId);
            delete state.chapters[subjectId];
        },
        setActiveUsers(state, activeUsers) {
            state.activeUsers = activeUsers || 0; 
        },
        setLogged(state, logged) {
            state.logged = logged;
        },
        setQuizzes(state, { chapterId, quizzes }) {
            state.quizzes = {
                ...state.quizzes,
                [chapterId]: quizzes
            };
        },
        addQuiz(state, { chapterId, quiz }) {
            if (!state.quizzes[chapterId]) {
                state.quizzes[chapterId] = [];
            }
            state.quizzes[chapterId].push(quiz);
        },
        updateQuiz(state, { chapterId, quiz }) {
            const quizzes = state.quizzes[chapterId];
            if (quizzes) {
                const index = quizzes.findIndex(q => q.id === quiz.id);
                if (index !== -1) {
                    quizzes[index] = quiz;
                }
            }
        },
        deleteQuiz(state, { chapterId, quizId }) {
            const quizzes = state.quizzes[chapterId];
            if (quizzes) {
                state.quizzes[chapterId] = quizzes.filter(q => q.id !== quizId);
            }
        }
    },
    actions: {
        async chapters({ commit }, subjectId) {
            try {
                const response = await fetch(`${window.API_URL}/chapters/${subjectId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch chapters');
                }
                const data = await response.json();
                commit('setChapters', { subjectId, chapters: data.chapters });
                return data.chapters;
            } catch (error) {
                console.error('Error fetching chapters:', error);
                commit('setChapters', { subjectId, chapters: [] });
                return [];
            }
        },
        async activeUsers({ commit }) {
            try {
                const response = await fetch(`${window.API_URL}/activeusers`);
                if (!response.ok) {
                    throw new Error('Failed to fetch active users');
                }
    
                const data = await response.json();
                console.log('Active users:', data.active_users);
                commit('setActiveUsers', data.active_users || 0);
            }
            catch (error) {
                console.error('Error fetching active users:', error);
                commit('setActiveUsers', 0);
            }
        },
        async subjects({ commit }) {
            try {
                const response = await fetch(`${window.API_URL}/subjects`);
                if (!response.ok) {
                    throw new Error('Failed to fetch subjects');
                }
                const data = await response.json();
                console.log('Fetching Subjects:', data);
                commit('setSubjects', data);
            } catch (error) {
                console.error('Error fetching subjects:', error);
                commit('setSubjects', []);
            }
        },
        async quizzes({ commit }, chapterId) {
            try {
                const response = await fetch(`${window.API_URL}/quizzes/${chapterId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch quizzes');
                }
                const data = await response.json();
                commit('setQuizzes', { chapterId, quizzes: data.quizzes });
                return data.quizzes;
            } catch (error) {
                console.error('Error fetching quizzes:', error);
                commit('setQuizzes', { chapterId, quizzes: [] });
                return [];
            }
        }
    },
    getters: {
        getChapters: (state) => (subjectId) => {
            return state.chapters[subjectId] || [];
        },
        subjects(state) {
            console.log('getting subject:',state.subjects)
            return state.subjects;
        },
        logged(state) {
            return state.logged;
        },
        active_users(state) {
            return state.activeUsers;
        },
        isLoggedIn(state) {
            return !!localStorage.getItem('access_token');
        },
        role(state) {
            return state.role;
        },
        username(state){
            return state.username
        },
        departments(state) {
            return state.departments;
        },
        finances(state) {
            return state.finances;
        },
        applications(state) {
            return state.applications;
        },
        getChapter: (state) => (chapterId) => {
            // Search through all subjects' chapters to find the one with matching ID
            for (const subjectChapters of Object.values(state.chapters)) {
                const chapter = subjectChapters.find(c => c.id === Number(chapterId));
                if (chapter) return chapter;
            }
            return null;
        },
        getQuizzes: (state) => (chapterId) => {
            return state.quizzes[chapterId] || [];
        }
    }
});