export const routes = {
  start: "/",
  modules: "/modules",
  module: (id: string) => `/modules/${id}`,
  quiz: (id: string) => `/quiz/${id}`,
  certificate: "/certificate",
} as const;
