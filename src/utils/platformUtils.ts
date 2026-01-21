export const isWeb = true; 

export const isMobile = typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false;

export const getInitialRoute = (): string => {
  // In your new router, "/" is the landing page
  return "/";
};

export const shouldShowLandingPage = (): boolean => {
  return true;
};

export const getAuthRoute = (): string => {
  // Map expo-router "/(auth)/login" to your react-router path
  return "/login";
};

export const getRegisterRoute = (): string => {
  return "/register";
};

export const getDashboardRoute = (): string => {
  // Map "/(tabs)" to your dashboard/home route
  return "/app";
};
