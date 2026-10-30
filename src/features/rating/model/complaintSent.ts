import { create } from "zustand";

// The work id of the complaint just filed on the new-complaint page, for the list it returns to (the "sent" note); cleared when dismissed.
type State = { id: string | null; set: (id: string | null) => void };
export const useComplaintSent = create<State>((set) => ({ id: null, set: (id) => set({ id }) }));
