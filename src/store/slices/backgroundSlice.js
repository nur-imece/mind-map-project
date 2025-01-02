export const createBackgroundSlice = (set, get) => ({
  backgroundImage: null,

  setBackgroundImage: (imageUrl) => {
    set({ backgroundImage: imageUrl });
  },
}); 