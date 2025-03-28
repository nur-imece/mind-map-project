export const createPresentationSlice = (set, get) => ({
  presentationOrder: [],
  isPresentationMode: false,
  currentSlideIndex: 0,

  setPresentationOrder: (order) => {
    set({ 
      presentationOrder: order,
      currentSlideIndex: 0
    });
  },

  setCurrentSlideIndex: (index) => {
    set({ currentSlideIndex: index });
  },

  togglePresentationMode: () => {
    set(state => ({ 
      isPresentationMode: !state.isPresentationMode,
      currentSlideIndex: 0 
    }));
  },

  startPresentation: (nodeIds) => {
    set({ 
      presentationOrder: nodeIds,
      currentSlideIndex: 0,
      isPresentationMode: true
    });
  },

  endPresentation: () => {
    set({ 
      isPresentationMode: false,
      currentSlideIndex: 0
    });
  },

  nextSlide: () => {
    set(state => {
      if (state.currentSlideIndex < state.presentationOrder.length - 1) {
        return { currentSlideIndex: state.currentSlideIndex + 1 };
      }
      return state;
    });
  },

  previousSlide: () => {
    set(state => {
      if (state.currentSlideIndex > 0) {
        return { currentSlideIndex: state.currentSlideIndex - 1 };
      }
      return state;
    });
  },
}); 