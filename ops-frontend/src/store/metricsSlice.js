// ops-frontend/src/store/metricsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  live: { cpu: 0, memory: 0, disk: 0 },
  history: [] 
};

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    // 1. For live updates (keeps the chart scrolling forward cleanly)
    updateMetrics: (state, action) => {
      state.live = action.payload;
      
      const timestamp = action.payload.timeLabel || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      // Only append to scrolling live history if it's new streaming data
      state.history.push({ ...action.payload, timeLabel: timestamp });
      if (state.history.length > 100) { // Increased to allow a healthy scroll window
        state.history.shift();
      }
    },
    // 2. NEW ACTION: For bulk loading full database dumps (like 7 days)
    setHistory: (state, action) => {
      state.history = action.payload; // Completely populates graph without trimming
    }
  }
});

export const { updateMetrics, setHistory } = metricsSlice.actions;
export default metricsSlice.reducer;