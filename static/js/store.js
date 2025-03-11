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
        udid:localStorage.getItem('department_id'),
        udept:localStorage.getItem('department_name'),
        departments: [],
        finances: [],
        applications: [], // State to store applications
        activeUsers: 0  // Ensure this is initialized to 0
      };
    },
    mutations: {
      setActiveUsers(state, activeUsers) {
        state.activeUsers = activeUsers || 0;  // Ensure we never set undefined
      },
      setLogged(state, logged) {
        state.logged = logged;
      },
      setDepartments(state, departments) {
        state.departments = departments;
      },
      setFinances(state, finances) {
        state.finances = finances;
      },
      setApplications(state, applications) {
        state.applications = applications;
      }
    },
    actions: {
      async activeUsers({ commit }) {
        try {
          const response = await fetch(`${window.API_URL}/activeusers`);
          if (!response.ok) {
            throw new Error('Failed to fetch active users');
          }
  
          const data = await response.json();
          console.log('Active users:', data.active_users);
          commit('setActiveUsers', data.active_users || 0);  // Default to 0 if undefined
        }
        catch (error) {
          console.error('Error fetching active users:', error);
          commit('setActiveUsers', 0);  // Set to 0 on error
        }
      },
      async fetchDepartments({ commit }) {
        try {
          const response = await fetch(`${window.API_URL}/departments`);
          if (!response.ok) {
            throw new Error('Failed to fetch departments');
          }
          const data = await response.json();
          commit('setDepartments', data);
        } catch (error) {
          console.error('Error fetching departments:', error);
        }
      },
      async fetchFinances({ commit }) {
        try {
          const response = await fetch(`${window.API_URL}/finances`);
          if (!response.ok) {
            throw new Error('Failed to fetch finances');
          }
          const data = await response.json();
          commit('setFinances', data);
        } catch (error) {
          console.error('Error fetching finances:', error);
        }
      },
      async fetchApplications({ commit }) {
        try {
          const response = await fetch(`${window.API_URL}/applications`);
          if (!response.ok) {
            throw new Error('Failed to fetch applications');
          }
          const data = await response.json();
          commit('setApplications', data);
        } catch (error) {
          console.error('Error fetching applications:', error);
        }
      },
      // async createApplication({ dispatch }, application) {
      //   try {
      //     const response = await fetch('http://127.0.0.1:5000/applications', {
      //       method: 'POST',
      //       headers: {
      //         'Content-Type': 'application/json'
      //       },
      //       body: JSON.stringify(application)
      //     });
      //     if (!response.ok) {
      //       throw new Error('Failed to create application');
      //     }
      //     await dispatch('fetchApplications');
      //   } catch (error) {
      //     console.error('Error creating application:', error);
      //   }
      // },
      // async updateApplication({ dispatch }, { id, application }) {
      //   try {
      //     const response = await fetch(`http://127.0.0.1:5000/applications/${id}`, {
      //       method: 'PUT',
      //       headers: {
      //         'Content-Type': 'application/json'
      //       },
      //       body: JSON.stringify(application)
      //     });
      //     if (!response.ok) {
      //       throw new Error('Failed to update application');
      //     }
      //     await dispatch('fetchApplications');
      //   } catch (error) {
      //     console.error('Error updating application:', error);
      //   }
      // },
      // async deleteApplication({ dispatch }, id) {
      //   try {
      //     const response = await fetch(`http://127.0.0.1:5000/${id}`, {
      //       method: 'DELETE'
      //     });
      //     if (!response.ok) {
      //       throw new Error('Failed to delete application');
      //     }
      //     await dispatch('fetchApplications');
      //   } catch (error) {
      //     console.error('Error deleting application:', error);
      //   }
      // }
    },
    getters: {
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
      }
    }
  });