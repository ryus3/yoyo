export const scrollToTopInstant = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
};

export const scrollToTopSmooth = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};