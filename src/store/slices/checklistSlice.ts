import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ChecklistState { togglingIds: string[] }

const checklistSlice = createSlice({
  name: 'checklist',
  initialState: { togglingIds: [] as string[] } as ChecklistState,
  reducers: {
    startToggle:  (state, { payload }: PayloadAction<string>) => { state.togglingIds.push(payload); },
    finishToggle: (state, { payload }: PayloadAction<string>) => {
      state.togglingIds = state.togglingIds.filter(id => id !== payload);
    },
  },
});

export const { startToggle, finishToggle } = checklistSlice.actions;

export const selectTogglingIds = (state: { checklist: ChecklistState }) => state.checklist.togglingIds;

export default checklistSlice.reducer;
