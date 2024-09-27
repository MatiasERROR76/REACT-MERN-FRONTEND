export const getEnvVariables = () => {
  const env = import.meta.env;

  return {
    VITE_MODE: import.meta.env.VITE_MODE,
    ...env,
  };
};

// dos posibles errores
