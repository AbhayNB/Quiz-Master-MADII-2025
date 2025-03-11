export const Navbar = {
    props: {
      brandName: {
        type: String,
        required: true,
        default: "",
      },
      links: {
        type: Array,
        required: true,
        validator: (value) => {
          return value.every(link =>
            ('name' in link && 'path' in link && 'icon' in link) || 
            ('name' in link && 'action' in link && typeof link.action === 'function') ||
            ('name' in link && 'children' in link)
          );
        }
      },
      theme: {
        type: String,
        default: "dark", // Can be "dark" or "light"
      },
    },
    methods: {
      handleClick(link, event) {
        event.preventDefault(); // Prevent the default link behavior
  
        if (link.action && typeof link.action === 'function') {
          link.action();
        } else if (link.path) {
          window.location.href = link.path;
        }
      },
    },
    template: `
      <nav :class="'navbar navbar-expand-lg bg-primary navbar-' + theme" data-bs-theme="dark">
        <div class="container">
          <!-- Brand -->
          <a class="navbar-brand fw-bold text-white" href="#">
            Kn<i class="bi bi-lightbulb-fill"></i>lympics {{ brandName }}
          </a>
  
          <!-- Toggler for mobile view -->
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarContent"
            aria-controls="navbarContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
  
          <!-- Navbar Links -->
          <div class="collapse navbar-collapse" id="navbarContent">
            <ul class="navbar-nav ms-auto">
              <li
                class="nav-item"
                v-for="(link, index) in links"
                :key="index"
              >
                <a
                  v-if="!link.children && !link.action"
                  class="nav-link text-white"
                  :class="{ active: link.active }"
                  :href="link.path"
                >
                  <i :class="link.icon"></i> {{ link.name }}
                </a>
                <a
                  v-if="link.action"
                  class="nav-link text-white"
                  href="#"
                  @click="handleClick(link, $event)"
                >
                  <i :class="link.icon"></i> {{ link.name }}
                </a>
                <div v-else-if="link.children" class="nav-item dropdown">
                  <a
                    class="nav-link dropdown-toggle text-white"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i :class="link.icon"></i> {{ link.name }}
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li
                      v-for="(child, childIndex) in link.children"
                      :key="childIndex"
                    >
                      <a
                        class="dropdown-item"
                        :href="child.path"
                        @click="handleClick(child, $event)"
                      >
                        <i :class="child.icon"></i> {{ child.name }}
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    `,
  };